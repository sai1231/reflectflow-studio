
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import type { Step, ClickStep, TypeStep, NavigateStep, ScrollStep, WaitForElementStep, KeyDownStep, KeyUpStep, DoubleClickStep, MoveToStep } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  ClickIcon,
  TypeActionIcon,
  NavigateIcon,
  ScrollIcon,
  AssertIcon, 
  DeleteIcon,
  SaveIcon,
  DragHandleIcon,
  MoreOptionsIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  KeyboardIcon,
  MoveToIcon,
  ActionIcon, // Fallback / generic action
} from './icons'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StepItemProps {
  step: Step;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onUpdateStep: (step: Step) => void;
  onDeleteStep: (id:string) => void;
}

const getIconForStep = (type: Step['type']): React.ElementType => {
  switch (type) {
    case 'navigate': return NavigateIcon;
    case 'click': return ClickIcon;
    case 'doubleClick': return ClickIcon; // Or a dedicated DoubleClickIcon
    case 'type': return TypeActionIcon;
    case 'keyDown': return KeyboardIcon;
    case 'keyUp': return KeyboardIcon;
    case 'scroll': return ScrollIcon;
    case 'waitForElement': return AssertIcon;
    case 'moveTo': return MoveToIcon;
    default: return ActionIcon; // Fallback
  }
};

const WAIT_OPERATORS = ['==', '!=', '<', '>', '<=', '>=', 'contains', 'not-contains', 'exists', 'stable', 'clickable'];

export function StepItem({ step, isSelected, onSelect, onUpdateStep, onDeleteStep }: StepItemProps) {
  const [editableStep, setEditableStep] = useState<Step>(() => JSON.parse(JSON.stringify(step)));
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const newEditableStep = JSON.parse(JSON.stringify(step));
    if (editableStep.id !== newEditableStep.id) {
        setIsExpanded(false); // Collapse if it's effectively a new step
    }
    setEditableStep(newEditableStep);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  
  const CurrentStepIcon = getIconForStep(editableStep.type);

  const handleInputChange = (field: keyof Step, value: any) => {
    setEditableStep(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNumericInputChange = (field: keyof Step, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setEditableStep(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSelectorChange = (index: number, value: string) => {
    setEditableStep(prev => {
      const newSelectors = [...(prev.selectors || [])];
      newSelectors[index] = value;
      // Also update the primary 'selector' field if it exists for convenience
      const primarySelector = newSelectors[0] || '';
      return { ...prev, selectors: newSelectors, selector: primarySelector };
    });
  };

  const handleSaveChanges = () => {
    let finalStep = { ...editableStep };
    // Ensure primary selector is synced if selectors array exists
    if (finalStep.selectors && finalStep.selectors.length > 0) {
      finalStep.selector = finalStep.selectors[0];
    } else if (finalStep.selector && (!finalStep.selectors || finalStep.selectors.length === 0)) {
      finalStep.selectors = [finalStep.selector];
    }
    onUpdateStep(finalStep);
  };
  
  const handleDelete = () => {
    onDeleteStep(editableStep.id);
  };

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };
  
  const renderStepDetailsSummary = () => {
    const s = editableStep;
    const primarySelector = s.selector || (s.selectors && s.selectors[0]) || 'N/A';
    switch (s.type) {
      case 'navigate': return <p className="text-xs text-muted-foreground truncate" title={(s as NavigateStep).url}>URL: {(s as NavigateStep).url}</p>;
      case 'click': case 'doubleClick': return <p className="text-xs text-muted-foreground truncate" title={primarySelector}>Selector: {primarySelector}</p>;
      case 'type': return <p className="text-xs text-muted-foreground truncate" title={(s as TypeStep).value}>Value: {(s as TypeStep).value}</p>;
      case 'keyDown': case 'keyUp': return <p className="text-xs text-muted-foreground truncate" title={(s as KeyDownStep).key}>Key: {(s as KeyDownStep).key}</p>;
      case 'scroll':
        const scrollStep = s as ScrollStep;
        if (scrollStep.selectors && scrollStep.selectors[0] && scrollStep.selectors[0] !== 'document') {
          return <p className="text-xs text-muted-foreground truncate" title={scrollStep.selectors[0]}>Target: {scrollStep.selectors[0]}</p>;
        }
        return <p className="text-xs text-muted-foreground">Scroll Window: X: {scrollStep.x}, Y: {scrollStep.y}</p>;
      case 'waitForElement':
        const wfes = s as WaitForElementStep;
        return <p className="text-xs text-muted-foreground truncate" title={`${wfes.property || 'Element'} ${wfes.operator || 'exists'} ${wfes.expectedValue !== undefined ? String(wfes.expectedValue) : ''} on ${primarySelector}`}>Assert: {wfes.property || 'element'} {wfes.operator || 'exists'} {wfes.expectedValue !== undefined ? `"${String(wfes.expectedValue)}"` : ''}</p>;
      case 'moveTo': return <p className="text-xs text-muted-foreground truncate" title={primarySelector}>Move to: {primarySelector}</p>;
      default: return s.selector ? <p className="text-xs text-muted-foreground truncate" title={s.selector}>Selector: {s.selector}</p> : null;
    }
  };

  const renderCommonFields = () => (
    <>
      <div className="grid grid-cols-3 gap-2 items-center">
        <Label htmlFor={`desc-${editableStep.id}`} className="text-xs col-span-1">Description</Label>
        <Input
          id={`desc-${editableStep.id}`}
          placeholder="Description"
          value={editableStep.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="text-sm h-8 col-span-2"
        />
      </div>
      {(editableStep.type !== 'navigate' && editableStep.type !== 'keyDown' && editableStep.type !== 'keyUp' && !(editableStep.type === 'scroll' && editableStep.selectors?.[0] === 'document')) && (
        <div className="grid grid-cols-3 gap-2 items-center">
          <Label htmlFor={`selector-${editableStep.id}-0`} className="text-xs">Selector</Label>
          <Input
            id={`selector-${editableStep.id}-0`}
            placeholder="Primary Selector (CSS, XPath)"
            value={editableStep.selectors ? editableStep.selectors[0] || '' : editableStep.selector || ''}
            onChange={(e) => handleSelectorChange(0, e.target.value)}
            className="text-sm h-8 col-span-2"
          />
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 items-center">
        <Label htmlFor={`target-${editableStep.id}`} className="text-xs">Target</Label>
        <Input
          id={`target-${editableStep.id}`}
          placeholder="e.g., main, #iframeId"
          value={editableStep.target || ''}
          onChange={(e) => handleInputChange('target', e.target.value)}
          className="text-sm h-8 col-span-2"
        />
      </div>
      <div className="grid grid-cols-3 gap-2 items-center">
        <Label htmlFor={`timeout-${editableStep.id}`} className="text-xs">Timeout (ms)</Label>
        <Input
          id={`timeout-${editableStep.id}`}
          type="number"
          placeholder="e.g., 5000"
          value={editableStep.timeout !== undefined ? String(editableStep.timeout) : ''}
          onChange={(e) => handleNumericInputChange('timeout', e.target.value)}
          className="text-sm h-8 col-span-2"
        />
      </div>
    </>
  );
  
  const renderEditableFields = () => (
    <div className="space-y-2 p-3 border-t mt-2 bg-muted/20 rounded-b-md">
      {renderCommonFields()}

      {editableStep.type === 'navigate' && (
        <div className="grid grid-cols-3 gap-2 items-center">
          <Label htmlFor={`url-${editableStep.id}`} className="text-xs">URL</Label>
          <Input
            id={`url-${editableStep.id}`}
            placeholder="https://example.com"
            value={(editableStep as NavigateStep).url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            className="text-sm h-8 col-span-2"
          />
        </div>
      )}

      {(editableStep.type === 'click' || editableStep.type === 'doubleClick' || editableStep.type === 'moveTo') && (
        <>
          <div className="grid grid-cols-3 gap-2 items-center">
            <Label htmlFor={`offsetX-${editableStep.id}`} className="text-xs">Offset X</Label>
            <Input id={`offsetX-${editableStep.id}`} type="number" placeholder="0" value={(editableStep as ClickStep).offsetX !== undefined ? String((editableStep as ClickStep).offsetX) : ''} onChange={(e) => handleNumericInputChange('offsetX', e.target.value)} className="text-sm h-8 col-span-2"/>
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <Label htmlFor={`offsetY-${editableStep.id}`} className="text-xs">Offset Y</Label>
            <Input id={`offsetY-${editableStep.id}`} type="number" placeholder="0" value={(editableStep as ClickStep).offsetY !== undefined ? String((editableStep as ClickStep).offsetY) : ''} onChange={(e) => handleNumericInputChange('offsetY', e.target.value)} className="text-sm h-8 col-span-2"/>
          </div>
        </>
      )}
      {editableStep.type === 'click' && (
         <div className="grid grid-cols-3 gap-2 items-center">
            <Label htmlFor={`duration-${editableStep.id}`} className="text-xs">Duration (ms)</Label>
            <Input id={`duration-${editableStep.id}`} type="number" placeholder="e.g., 50" value={(editableStep as ClickStep).duration !== undefined ? String((editableStep as ClickStep).duration) : ''} onChange={(e) => handleNumericInputChange('duration', e.target.value)} className="text-sm h-8 col-span-2"/>
         </div>
      )}

      {(editableStep.type === 'keyDown' || editableStep.type === 'keyUp') && (
        <div className="grid grid-cols-3 gap-2 items-center">
          <Label htmlFor={`key-${editableStep.id}`} className="text-xs">Key</Label>
          <Input
            id={`key-${editableStep.id}`}
            placeholder="e.g., Enter, a, Shift"
            value={(editableStep as KeyDownStep).key}
            onChange={(e) => handleInputChange('key', e.target.value)}
            className="text-sm h-8 col-span-2"
          />
        </div>
      )}

      {editableStep.type === 'type' && (
        <div className="grid grid-cols-3 gap-2 items-center">
          <Label htmlFor={`value-${editableStep.id}`} className="text-xs">Value</Label>
          <Input
            id={`value-${editableStep.id}`}
            placeholder="Text to type"
            value={(editableStep as TypeStep).value}
            onChange={(e) => handleInputChange('value', e.target.value)}
            className="text-sm h-8 col-span-2"
          />
        </div>
      )}

      {editableStep.type === 'scroll' && (editableStep as ScrollStep).selectors?.[0] !== 'document' && (
        <>
         <div className="grid grid-cols-3 gap-2 items-center">
            <Label htmlFor={`scrollX-${editableStep.id}`} className="text-xs">Scroll X</Label>
            <Input id={`scrollX-${editableStep.id}`} type="number" placeholder="0" value={(editableStep as ScrollStep).x !== undefined ? String((editableStep as ScrollStep).x) : ''} onChange={(e) => handleNumericInputChange('x', e.target.value)} className="text-sm h-8 col-span-2"/>
         </div>
         <div className="grid grid-cols-3 gap-2 items-center">
            <Label htmlFor={`scrollY-${editableStep.id}`} className="text-xs">Scroll Y</Label>
            <Input id={`scrollY-${editableStep.id}`} type="number" placeholder="100" value={(editableStep as ScrollStep).y !== undefined ? String((editableStep as ScrollStep).y) : ''} onChange={(e) => handleNumericInputChange('y', e.target.value)} className="text-sm h-8 col-span-2"/>
         </div>
        </>
      )}

      {editableStep.type === 'waitForElement' && (
        <>
          <div className="grid grid-cols-3 gap-2 items-center">
            <Label htmlFor={`propName-${editableStep.id}`} className="text-xs">Property</Label>
            <Input
              id={`propName-${editableStep.id}`}
              placeholder="e.g., visible, textContent"
              value={(editableStep as WaitForElementStep).property || ''}
              onChange={(e) => handleInputChange('property', e.target.value)}
              className="text-sm h-8 col-span-2"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <Label htmlFor={`operator-${editableStep.id}`} className="text-xs">Operator</Label>
             <Select
                value={(editableStep as WaitForElementStep).operator || ''}
                onValueChange={(value) => handleInputChange('operator', value as WaitForElementStep['operator'])}
              >
                <SelectTrigger id={`operator-${editableStep.id}`} className="text-sm h-8 col-span-2">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {WAIT_OPERATORS.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
                </SelectContent>
              </Select>
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <Label htmlFor={`propValue-${editableStep.id}`} className="text-xs">Expected Value</Label>
            <Input
              id={`propValue-${editableStep.id}`}
              placeholder="true, some text, 123"
              value={(editableStep as WaitForElementStep).expectedValue !== undefined ? String((editableStep as WaitForElementStep).expectedValue) : ''}
              onChange={(e) => {
                const valStr = e.target.value;
                let val: string | number | boolean = valStr;
                if (valStr.toLowerCase() === 'true') val = true;
                else if (valStr.toLowerCase() === 'false') val = false;
                else if (!isNaN(parseFloat(valStr)) && isFinite(Number(valStr))) val = parseFloat(valStr);
                handleInputChange('expectedValue', val);
              }}
              className="text-sm h-8 col-span-2"
            />
          </div>
        </>
      )}
      
      <Button onClick={handleSaveChanges} size="sm" variant="default" className="h-8 mt-3 w-full">
        <SaveIcon className="mr-1 h-3 w-3" /> Save Changes
      </Button>
    </div>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Card className={`mb-2 transition-all duration-150 ease-in-out ${isSelected ? 'shadow-lg border-primary bg-primary/5' : 'shadow-sm'}`}>
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <DragHandleIcon className="h-5 w-5 text-muted-foreground cursor-grab flex-shrink-0" />
            <Checkbox
              id={`step-${editableStep.id}`}
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(editableStep.id, !!checked)}
              aria-label={`Select step ${editableStep.description}`}
              className="flex-shrink-0"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <CurrentStepIcon className="h-5 w-5 text-primary flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Type: {editableStep.type}</p>
              </TooltipContent>
            </Tooltip>
            <div className="flex-grow truncate min-w-0" onClick={toggleExpand} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleExpand()} aria-expanded={isExpanded}>
              <p className="text-sm font-medium truncate" title={editableStep.description}>{editableStep.description}</p>
              {!isExpanded && renderStepDetailsSummary()}
            </div>
            
            <Button variant="ghost" size="icon" onClick={toggleExpand} className="h-8 w-8 flex-shrink-0" aria-label={isExpanded ? "Collapse details" : "Expand details"}>
              {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </Button>

            <DropdownMenu onOpenChange={(open) => { if (open && isExpanded) setIsExpanded(false); /* Close expanded view if opening menu */ }}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 flex-shrink-0" 
                  aria-label="More options"
                  onClick={(e) => {
                     e.stopPropagation(); // Prevent card's onClick if any
                     console.log(`DropdownMenuTrigger button clicked for step: ${editableStep.id} - ${editableStep.description}`);
                  }}
                >
                  <MoreOptionsIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                onCloseAutoFocus={(e) => e.preventDefault()} // Important for Radix focus handling
              >
                <DropdownMenuItem onSelect={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <DeleteIcon className="mr-2 h-4 w-4" />
                  Delete Step
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {isExpanded && renderEditableFields()}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
