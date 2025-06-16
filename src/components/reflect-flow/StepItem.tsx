"use client";

import type React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import type { Step, ClickStep, TypeStep, NavigateStep, ScrollStep, WaitForElementStep, KeyDownStep, KeyUpStep, DoubleClickStep, MoveToStep, UndeterminedStep, StepType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CommandInfo, availableCommands } from '@/lib/commands';

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
  ActionIcon, 
  HelpCircleIcon,
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
  initialExpanded?: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onUpdateStep: (step: Step) => void;
  onDeleteStep: (id:string) => void;
  onCommandSelected: (stepId: string) => void; 
}

const getIconForStep = (type: Step['type']): React.ElementType => {
  if (type === 'undetermined') return HelpCircleIcon;
  switch (type) {
    case 'navigate': return NavigateIcon;
    case 'click': return ClickIcon;
    case 'doubleClick': return ClickIcon; 
    case 'type': return TypeActionIcon;
    case 'keyDown': return KeyboardIcon;
    case 'keyUp': return KeyboardIcon;
    case 'scroll': return ScrollIcon;
    case 'waitForElement': return AssertIcon;
    case 'moveTo': return MoveToIcon;
    default: return ActionIcon; 
  }
};

const WAIT_OPERATORS = ['==', '!=', '<', '>', '<=', '>=', 'contains', 'not-contains', 'exists', 'stable', 'clickable'];

export function StepItem({ step, isSelected, initialExpanded = false, onSelect, onUpdateStep, onDeleteStep, onCommandSelected }: StepItemProps) {
  const [editableStep, setEditableStep] = useState<Step>(() => JSON.parse(JSON.stringify(step)));
  const [isExpanded, setIsExpanded] = useState(initialExpanded || step.type === 'undetermined');
  const [commandSearch, setCommandSearch] = useState('');
  const [isCommandPopoverOpen, setIsCommandPopoverOpen] = useState(step.type === 'undetermined' && (initialExpanded || step.type === 'undetermined'));
  
  const commandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newEditableStep = JSON.parse(JSON.stringify(step));
    // Check if the fundamental step ID or type has changed, indicating a new step prop
    if (editableStep.id !== newEditableStep.id || (editableStep.type === 'undetermined' && newEditableStep.type !== 'undetermined')) {
        setIsExpanded(initialExpanded || newEditableStep.type === 'undetermined');
        setEditableStep(newEditableStep);
        setCommandSearch('');
        const shouldPopoverBeOpen = newEditableStep.type === 'undetermined' && (initialExpanded || newEditableStep.id === step.id ); // Keep open if it's the same undetermined step
        setIsCommandPopoverOpen(shouldPopoverBeOpen);
        if (shouldPopoverBeOpen && commandInputRef.current) {
            commandInputRef.current.focus();
        }
    } else if (editableStep.id === newEditableStep.id && editableStep.type !== 'undetermined' && newEditableStep.type === 'undetermined') {
        // This case handles if a determined step somehow becomes undetermined (e.g. error state, though unlikely with current flow)
        setEditableStep(newEditableStep);
        setIsExpanded(true);
        setIsCommandPopoverOpen(true);
        if (commandInputRef.current) {
            commandInputRef.current.focus();
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, initialExpanded]); 

  useEffect(() => {
    if (editableStep.type === 'undetermined' && isExpanded && commandInputRef.current) {
        setIsCommandPopoverOpen(true); // Ensure popover is set to open
        commandInputRef.current.focus();
    }
  }, [editableStep.type, isExpanded]);
  
  const CurrentStepIcon = getIconForStep(editableStep.type);

  const filteredCommands = useMemo(() => {
    if (!commandSearch) return availableCommands;
    return availableCommands.filter(cmd => 
      cmd.description.toLowerCase().includes(commandSearch.toLowerCase()) ||
      cmd.key.toLowerCase().includes(commandSearch.toLowerCase())
    );
  }, [commandSearch]);

  const handleCommandSelect = (selectedCmd: CommandInfo) => {
    let newStepData: Partial<Step> = { description: selectedCmd.description };
    let finalType: StepType = 'click'; 

    switch (selectedCmd.key) {
        case 'navigate':
            finalType = 'navigate';
            newStepData = { ...newStepData, url: 'https://' } as Partial<NavigateStep>;
            break;
        case 'click': finalType = 'click'; break;
        case 'doubleClick': finalType = 'doubleClick'; break;
        case 'type': case 'setValue':
            finalType = 'type';
            newStepData = { ...newStepData, value: 'your_text_here' } as Partial<TypeStep>;
            break;
        case 'addValue':
            finalType = 'type';
            newStepData = { ...newStepData, value: 'additional_text' } as Partial<TypeStep>;
            break;
        case 'clearValue':
            finalType = 'type';
            newStepData = { ...newStepData, value: '' } as Partial<TypeStep>;
            break;
        case 'keyDown': finalType = 'keyDown'; newStepData = { ...newStepData, key: 'Enter' } as Partial<KeyDownStep>; break;
        case 'keyUp': finalType = 'keyUp'; newStepData = { ...newStepData, key: 'Enter' } as Partial<KeyUpStep>; break;
        case 'scrollIntoView':
            finalType = 'scroll';
            newStepData = { ...newStepData, selectors: [''], selector: '' } as Partial<ScrollStep>;
            break;
        case 'moveTo': finalType = 'moveTo'; break;
        
        case 'waitForElement': case 'isExisting': case 'waitForExist':
            finalType = 'waitForElement';
            newStepData = { ...newStepData, property: 'existing', operator: 'exists', expectedValue: true } as Partial<WaitForElementStep>;
            break;
        case 'isDisplayed': case 'waitForDisplayed':
            finalType = 'waitForElement';
            newStepData = { ...newStepData, property: 'visible', operator: '==', expectedValue: true } as Partial<WaitForElementStep>;
            break;
        case 'isEnabled': case 'waitForEnabled':
            finalType = 'waitForElement';
            newStepData = { ...newStepData, property: 'enabled', operator: '==', expectedValue: true } as Partial<WaitForElementStep>;
            break;
        case 'isClickable': case 'waitForClickable':
            finalType = 'waitForElement';
            newStepData = { ...newStepData, property: 'clickable', operator: 'clickable', expectedValue: true } as Partial<WaitForElementStep>;
            break;
        case 'isStable': case 'waitForStable':
            finalType = 'waitForElement';
            newStepData = { ...newStepData, property: 'stable', operator: 'stable', expectedValue: true } as Partial<WaitForElementStep>;
            break;
        case 'getText':
            finalType = 'waitForElement';
            newStepData = { ...newStepData, property: 'textContent', operator: 'contains', expectedValue: 'expected text' } as Partial<WaitForElementStep>;
            break;
        case 'getValue':
            finalType = 'waitForElement';
            newStepData = { ...newStepData, property: 'value', operator: '==', expectedValue: 'expected value' } as Partial<WaitForElementStep>;
            break;
        case 'getAttribute':
            finalType = 'waitForElement';
            newStepData = { ...newStepData, property: 'attribute:data-testid', operator: '==', expectedValue: 'attr_value' } as Partial<WaitForElementStep>;
            break;
        case 'getCSSProperty': newStepData = {...newStepData, property:'css:color', operator:'==', expectedValue:'#000000'}; finalType = 'waitForElement'; break;
        case 'getSize': newStepData = {...newStepData, property:'size.width', operator:'>', expectedValue:0}; finalType = 'waitForElement'; break;
        case 'getLocation': newStepData = {...newStepData, property:'location.x', operator:'>=', expectedValue:0}; finalType = 'waitForElement'; break;
        
        default: // For commands not directly mapped to a specific complex type
             if (selectedCmd.key.toLowerCase().includes('get') || selectedCmd.key.toLowerCase().includes('is') || selectedCmd.key.toLowerCase().includes('wait')) {
                finalType = 'waitForElement'; 
                newStepData = { ...newStepData, property: 'visible', operator: '==', expectedValue: true };
            } else {
                finalType = 'click'; // Default if no other type matches
            }
            break;
    }

    const baseSelectors = editableStep.selectors || [''];
    const baseSelector = editableStep.selector || baseSelectors[0] || '';

    const fullyTypedStep = {
      ...editableStep, // Keep existing ID, target, timeout etc.
      ...newStepData,  // Apply new description and type-specific defaults
      type: finalType,
      selectors: baseSelectors,
      selector: baseSelector,
    } as Step;

    setEditableStep(fullyTypedStep); // Update local state immediately for UI responsiveness
    onUpdateStep(fullyTypedStep);   // Propagate to parent to update main list
    setIsCommandPopoverOpen(false);
    setCommandSearch('');
    if (fullyTypedStep.type !== 'undetermined') {
      onCommandSelected(fullyTypedStep.id); 
    }
  };

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
      if (index < newSelectors.length) {
        newSelectors[index] = value;
      } else if (index === newSelectors.length) { 
        newSelectors.push(value);
      }
      const primarySelector = newSelectors[0] || '';
      return { ...prev, selectors: newSelectors, selector: primarySelector };
    });
  };
  
  const handleAddSelector = () => {
    setEditableStep(prev => {
      const newSelectors = [...(prev.selectors || []), '']; 
      return { ...prev, selectors: newSelectors };
    });
  };

  const handleRemoveSelector = (index: number) => {
    setEditableStep(prev => {
      const newSelectors = [...(prev.selectors || [])];
      if (newSelectors.length > 1 && index < newSelectors.length) { 
        newSelectors.splice(index, 1);
      }
      const primarySelector = newSelectors[0] || '';
      return { ...prev, selectors: newSelectors, selector: primarySelector };
    });
  };

  const handleSaveChanges = () => {
    let finalStep = { ...editableStep };
    // Ensure selector is consistent with selectors array
    if (finalStep.selectors && finalStep.selectors.length > 0) {
      finalStep.selector = finalStep.selectors[0];
    } else if (finalStep.selector && (!finalStep.selectors || finalStep.selectors.length === 0)) {
      finalStep.selectors = [finalStep.selector];
    } else if (!finalStep.selector && (!finalStep.selectors || finalStep.selectors.length === 0)) {
      // For types that require a selector, ensure there's at least an empty one
      const typesRequiringSelector = ['click', 'type', 'waitForElement', 'doubleClick', 'moveTo', 'scroll'];
      const isDocumentScroll = finalStep.type === 'scroll' && (finalStep as ScrollStep).selectors?.[0]?.toLowerCase() === 'document';
      
      if (typesRequiringSelector.includes(finalStep.type) && !isDocumentScroll) {
        finalStep.selectors = [''];
        finalStep.selector = '';
      }
    }
    onUpdateStep(finalStep);
  };
  
  const handleDelete = () => {
    onDeleteStep(editableStep.id);
  };

  const toggleExpand = () => {
    if (editableStep.type === 'undetermined' && !isExpanded) {
        setIsCommandPopoverOpen(true); 
    }
    setIsExpanded(prev => !prev);
  };
  
  const renderStepDetailsSummary = () => {
    const s = editableStep;
    if (s.type === 'undetermined') return <p className="text-xs text-muted-foreground truncate">Choose a command to define this step.</p>;
    
    const primarySelectorDisplay = s.selector || (s.selectors && s.selectors[0]) || (s.type !== 'navigate' && s.type !== 'scroll' ? 'N/A' : '');

    switch (s.type) {
      case 'navigate': return <p className="text-xs text-muted-foreground truncate" title={(s as NavigateStep).url}>URL: {(s as NavigateStep).url}</p>;
      case 'click': case 'doubleClick': case 'moveTo': return <p className="text-xs text-muted-foreground truncate" title={primarySelectorDisplay}>Selector: {primarySelectorDisplay}</p>;
      case 'type': return <p className="text-xs text-muted-foreground truncate" title={(s as TypeStep).value}>Value: {(s as TypeStep).value}</p>;
      case 'keyDown': case 'keyUp': return <p className="text-xs text-muted-foreground truncate" title={(s as KeyDownStep).key}>Key: {(s as KeyDownStep).key}</p>;
      case 'scroll':
        const scrollStep = s as ScrollStep;
        if (scrollStep.selectors && scrollStep.selectors[0] && scrollStep.selectors[0].toLowerCase() !== 'document') {
          return <p className="text-xs text-muted-foreground truncate" title={scrollStep.selectors[0]}>Target: {scrollStep.selectors[0]}</p>;
        }
        return <p className="text-xs text-muted-foreground">Scroll Window: X: {scrollStep.x ?? 0}, Y: {scrollStep.y ?? 0}</p>;
      case 'waitForElement':
        const wfes = s as WaitForElementStep;
        const valueDisplay = wfes.expectedValue !== undefined ? String(wfes.expectedValue) : '';
        const summary = `${wfes.property || 'Element'} ${wfes.operator || 'exists'} ${valueDisplay ? `"${valueDisplay}"` : ''} on ${primarySelectorDisplay}`;
        return <p className="text-xs text-muted-foreground truncate" title={summary}>Assert: {summary}</p>;
      default: return primarySelectorDisplay ? <p className="text-xs text-muted-foreground truncate" title={primarySelectorDisplay}>Selector: {primarySelectorDisplay}</p> : null;
    }
  };

  const renderCommandSelector = () => (
    <div className="space-y-2 p-3 border-t mt-2 bg-muted/20 rounded-b-md">
      <Label htmlFor={`cmd-search-${editableStep.id}`} className="text-sm font-medium">Choose Command</Label>
      <Popover open={isCommandPopoverOpen} onOpenChange={setIsCommandPopoverOpen}>
        <PopoverTrigger asChild>
            <Input
                ref={commandInputRef}
                id={`cmd-search-${editableStep.id}`}
                data-command-input="true"
                placeholder="Type to search commands..."
                value={commandSearch}
                onChange={(e) => setCommandSearch(e.target.value)}
                onFocus={() => setIsCommandPopoverOpen(true)}
                className="text-sm h-10"
            />
        </PopoverTrigger>
        <PopoverContent 
            className="w-[350px] p-0 z-[10001]" 
            side="bottom" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()} // Prevent focus stealing
            onCloseAutoFocus={(e) => e.preventDefault()} // Prevent focus shift on close
        >
            <ScrollArea className="h-[200px]">
            {filteredCommands.length > 0 ? (
                filteredCommands.map(cmd => (
                <div
                    key={cmd.key}
                    data-command-item="true"
                    className="p-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer text-sm outline-none"
                    onClick={() => handleCommandSelect(cmd)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCommandSelect(cmd)}
                    tabIndex={0} 
                >
                    {cmd.description} <span className="text-xs text-muted-foreground">({cmd.key})</span>
                </div>
                ))
            ) : (
                <p className="p-2 text-sm text-muted-foreground">No commands found.</p>
            )}
            </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );

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
      {(editableStep.type !== 'navigate' && editableStep.type !== 'keyDown' && editableStep.type !== 'keyUp' && !(editableStep.type === 'scroll' && (editableStep as ScrollStep).selectors?.[0]?.toLowerCase() === 'document')) && (
        <>
          {(editableStep.selectors || ['']).map((sel, index) => ( // Ensure at least one selector input for relevant types
            <div key={index} className="grid grid-cols-3 gap-2 items-center">
              <Label htmlFor={`selector-${editableStep.id}-${index}`} className="text-xs">{index === 0 ? 'Selector(s)' : `Alt. Sel. ${index + 1}`}</Label>
              <div className="col-span-2 flex items-center gap-1">
                <Input
                  id={`selector-${editableStep.id}-${index}`}
                  placeholder={index === 0 ? "Primary Selector (CSS, XPath)" : "Alternative Selector"}
                  value={sel}
                  onChange={(e) => handleSelectorChange(index, e.target.value)}
                  className="text-sm h-8 flex-grow"
                />
                {(editableStep.selectors || []).length > 1 && (
                   <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSelector(index)} className="h-7 w-7 p-0 flex-shrink-0" aria-label="Remove selector">
                    <DeleteIcon className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2 items-center">
            <div></div> 
            <div className="col-span-2">
                <Button type="button" variant="outline" size="sm" onClick={handleAddSelector} className="h-7 text-xs mt-1 w-full">
                Add Selector
                </Button>
            </div>
          </div>
        </>
      )}
      <div className="grid grid-cols-3 gap-2 items-center">
        <Label htmlFor={`target-${editableStep.id}`} className="text-xs">Target</Label>
        <Input
          id={`target-${editableStep.id}`}
          placeholder="e.g., main, #iframeId"
          value={editableStep.target || 'main'}
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
          value={editableStep.timeout !== undefined ? String(editableStep.timeout) : '5000'}
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

      {editableStep.type === 'scroll' && (editableStep as ScrollStep).selectors?.[0]?.toLowerCase() === 'document' && (
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
                value={(editableStep as WaitForElementStep).operator || '=='}
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
                else if (valStr === '' && (editableStep as WaitForElementStep).operator === 'exists') val = true; 
                else if (valStr !== '' && !isNaN(parseFloat(valStr)) && isFinite(Number(valStr))) val = parseFloat(valStr);
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
            {editableStep.type !== 'undetermined' && <Badge variant="outline" className="text-xs capitalize h-6 px-2 py-1">{editableStep.type}</Badge> }
            
            <div 
                className="flex-grow truncate min-w-0" 
                onClick={editableStep.type !== 'undetermined' ? toggleExpand : undefined} 
                role={editableStep.type !== 'undetermined' ? "button" : undefined} 
                tabIndex={editableStep.type !== 'undetermined' ? 0 : undefined} 
                onKeyDown={(e) => editableStep.type !== 'undetermined' && e.key === 'Enter' && toggleExpand()} 
                aria-expanded={isExpanded}
            >
              <p className="text-sm font-medium truncate" title={editableStep.description || "New Step - Choose Command"}>{editableStep.description || (editableStep.type === 'undetermined' ? "New Step - Choose Command" : "Step")}</p>
              {!isExpanded && editableStep.type !== 'undetermined' && renderStepDetailsSummary()}
            </div>
            
            {editableStep.type !== 'undetermined' && (
              <Button variant="ghost" size="icon" onClick={toggleExpand} className="h-8 w-8 flex-shrink-0" aria-label={isExpanded ? "Collapse details" : "Expand details"}>
                {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              </Button>
            )}

            <DropdownMenu onOpenChange={(open) => { if (open && isExpanded && editableStep.type !== 'undetermined') setIsExpanded(false); }}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 flex-shrink-0" 
                  aria-label="More options"
                  onClick={(e) => e.stopPropagation()} // Prevent card's toggleExpand if type is undetermined
                >
                  <MoreOptionsIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                onCloseAutoFocus={(e) => e.preventDefault()} 
              >
                <DropdownMenuItem onSelect={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <DeleteIcon className="mr-2 h-4 w-4" />
                  Delete Step
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {isExpanded && editableStep.type === 'undetermined' && renderCommandSelector()}
          {isExpanded && editableStep.type !== 'undetermined' && renderEditableFields()}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

