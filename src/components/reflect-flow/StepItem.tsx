"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import type { Step, ClickStep, TypeStep, NavigateStep, ScrollStep, WaitForElementStep, ActionStep, WaitForElementStepProperty } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ClickIcon,
  TypeActionIcon,
  NavigateIcon,
  ScrollIcon,
  AssertIcon, 
  EditIcon,
  DeleteIcon,
  SaveIcon,
  DragHandleIcon,
  MoreOptionsIcon,
  ActionIcon 
} from './icons'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';

interface StepItemProps {
  step: Step;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onUpdateStep: (step: Step) => void;
  onDeleteStep: (id:string) => void;
}

const getIconForStep = (type: Step['type']): React.ElementType => {
  switch (type) {
    case 'click': return ClickIcon;
    case 'type': return TypeActionIcon;
    case 'navigate': return NavigateIcon;
    case 'scroll': return ScrollIcon;
    case 'waitForElement': return AssertIcon;
    case 'action': return ActionIcon;
    default: return ClickIcon; 
  }
};

export function StepItem({ step, isSelected, onSelect, onUpdateStep, onDeleteStep }: StepItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableStep, setEditableStep] = useState<Step>(() => JSON.parse(JSON.stringify(step)));

  useEffect(() => {
    // If not in editing mode, keep editableStep synced with the prop step
    // This is important if the step is updated externally (e.g. by another process)
    // or if the component is re-rendered with a new step prop for the same item (though less likely with proper keys)
    if (!isEditing) {
      setEditableStep(JSON.parse(JSON.stringify(step)));
    }
  }, [step, isEditing]);
  
  const CurrentStepIcon = getIconForStep(editableStep.type);

  const handleInputChange = (field: keyof Step, value: any) => {
    setEditableStep(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (path: string, value: any) => {
    setEditableStep(prev => {
      const newStep = JSON.parse(JSON.stringify(prev)); 
      let current: any = newStep;
      const parts = path.split('.');
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = value;
        } else {
          if (!current[part]) current[part] = {}; 
          current = current[part];
        }
      });
      return newStep;
    });
  };

  const handleSelectorChange = (index: number, value: string) => {
    setEditableStep(prev => {
      const newSelectors = [...(prev.selectors || [])];
      if (index < newSelectors.length) {
        newSelectors[index] = value;
      } else {
         // This case should ideally be handled by an "add selector" button
        newSelectors[index] = value; // Or push if appropriate
      }
      // Ensure the primary selector (display selector) is updated if it's the first one
      const primarySelector = newSelectors[0] || '';
      return { ...prev, selectors: newSelectors, selector: primarySelector };
    });
  };
  
  const handlePropertyChange = (propIndex: number, field: keyof WaitForElementStepProperty, value: any) => {
    setEditableStep(prev => {
      if (prev.type !== 'waitForElement') return prev;
      const newProperties = JSON.parse(JSON.stringify((prev as WaitForElementStep).properties || []));
      if (propIndex < newProperties.length) {
        (newProperties[propIndex] as any)[field] = value;
      }
      return { ...prev, properties: newProperties } as WaitForElementStep;
    });
  };


  const toggleEdit = () => {
    if (isEditing) {
      // Saving changes
      let finalStep = { ...editableStep };
      if (finalStep.selectors && finalStep.selectors.length > 0) {
        finalStep.selector = finalStep.selectors[0];
      } else if (finalStep.selector && (!finalStep.selectors || finalStep.selectors.length === 0)) {
        finalStep.selectors = [finalStep.selector];
      }
      onUpdateStep(finalStep);
      setIsEditing(false); 
    } else {
      // Entering edit mode
      // Ensure editableStep is a fresh, deep copy of the current prop step
      setEditableStep(JSON.parse(JSON.stringify(step)));
      setIsEditing(true);
    }
  };
  
  const renderStepDetails = () => {
    // Use editableStep for display consistency, as it reflects prop step when not editing
    const currentDisplayStep = editableStep;
    const primarySelector = currentDisplayStep.selector || (currentDisplayStep.selectors && currentDisplayStep.selectors[0]) || 'N/A';
    switch (currentDisplayStep.type) {
      case 'navigate':
        return <p className="text-xs text-muted-foreground truncate" title={(currentDisplayStep as NavigateStep).url}>URL: {(currentDisplayStep as NavigateStep).url}</p>;
      case 'click':
        return <p className="text-xs text-muted-foreground truncate" title={primarySelector}>Selector: {primarySelector}</p>;
      case 'type':
        return (
          <>
            <p className="text-xs text-muted-foreground truncate" title={primarySelector}>Selector: {primarySelector}</p>
            <p className="text-xs text-muted-foreground truncate" title={(currentDisplayStep as TypeStep).value}>Value: {(currentDisplayStep as TypeStep).value}</p>
          </>
        );
      case 'scroll':
        if ((currentDisplayStep as ScrollStep).selectors && (currentDisplayStep as ScrollStep).selectors!.length > 0) {
          return <p className="text-xs text-muted-foreground truncate" title={(currentDisplayStep as ScrollStep).selectors![0]}>Target: {(currentDisplayStep as ScrollStep).selectors![0]}</p>;
        }
        return <p className="text-xs text-muted-foreground">Scroll Window</p>;
      case 'waitForElement':
        const wfes = currentDisplayStep as WaitForElementStep;
        if (wfes.properties && wfes.properties.length > 0) {
          const prop = wfes.properties[0];
          return <p className="text-xs text-muted-foreground truncate" title={`${prop.name} ${prop.operator || 'is'} ${String(prop.expectedValue)} on ${primarySelector}`}>Assert: {prop.name} {prop.operator || 'is'} "{String(prop.expectedValue)}" on "{primarySelector}"</p>;
        }
        return <p className="text-xs text-muted-foreground truncate" title={primarySelector}>WaitFor: {primarySelector}</p>;
      case 'action':
        const actionStep = currentDisplayStep as ActionStep;
        return (
          <>
            <p className="text-xs text-muted-foreground truncate">Action: {actionStep.subAction}</p>
            {actionStep.selectors && actionStep.selectors.length > 0 && 
              <p className="text-xs text-muted-foreground truncate" title={actionStep.selectors[0]}>Selector: {actionStep.selectors[0]}</p>
            }
          </>
        );
      default:
        return currentDisplayStep.selector ? <p className="text-xs text-muted-foreground truncate" title={currentDisplayStep.selector}>Selector: {currentDisplayStep.selector}</p> : null;
    }
  };

  const renderEditableFields = () => (
    <div className="space-y-3 p-3 border-t mt-3 bg-muted/20 rounded-b-md">
      <div>
        <Label htmlFor={`desc-${editableStep.id}`} className="text-xs font-medium">Description</Label>
        <Input
          id={`desc-${editableStep.id}`}
          placeholder="Description"
          value={editableStep.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="text-sm h-8 mt-1"
        />
      </div>

      {editableStep.type !== 'navigate' && editableStep.type !== 'scroll' && (!editableStep.type.startsWith('key')) && editableStep.type !== 'setViewport' && (
        <div>
          <Label htmlFor={`selector-${editableStep.id}-${0}`} className="text-xs font-medium">Primary Selector</Label>
          <Input
            id={`selector-${editableStep.id}-${0}`}
            placeholder="CSS Selector, XPath, etc."
            value={editableStep.selectors ? editableStep.selectors[0] || '' : editableStep.selector || ''}
            onChange={(e) => handleSelectorChange(0, e.target.value)}
            className="text-sm h-8 mt-1"
          />
          {/* TODO: Add UI for managing multiple selectors */}
        </div>
      )}

      {editableStep.type === 'navigate' && (
        <div>
          <Label htmlFor={`url-${editableStep.id}`} className="text-xs font-medium">URL</Label>
          <Input
            id={`url-${editableStep.id}`}
            placeholder="https://example.com"
            value={(editableStep as NavigateStep).url}
            onChange={(e) => handleNestedChange('url', e.target.value)}
            className="text-sm h-8 mt-1"
          />
        </div>
      )}

      {editableStep.type === 'type' && (
        <div>
          <Label htmlFor={`value-${editableStep.id}`} className="text-xs font-medium">Value to Type</Label>
          <Input
            id={`value-${editableStep.id}`}
            placeholder="Text to type"
            value={(editableStep as TypeStep).value}
            onChange={(e) => handleNestedChange('value', e.target.value)}
            className="text-sm h-8 mt-1"
          />
        </div>
      )}
      
      {editableStep.type === 'action' && (editableStep as ActionStep).subAction === 'moveTo' && (
         <div>
            <Label className="text-xs font-medium">Move To Offset (X, Y)</Label>
            <div className="flex space-x-2 mt-1">
                <Input type="number" placeholder="X offset" value={(editableStep as ActionStep).params?.x ?? ''} onChange={(e) => handleNestedChange('params.x', parseInt(e.target.value,10) || 0)} className="text-sm h-8" />
                <Input type="number" placeholder="Y offset" value={(editableStep as ActionStep).params?.y ?? ''} onChange={(e) => handleNestedChange('params.y', parseInt(e.target.value,10) || 0)} className="text-sm h-8" />
            </div>
         </div>
      )}


      {editableStep.type === 'waitForElement' && (editableStep as WaitForElementStep).properties && (editableStep as WaitForElementStep).properties.map((prop, index) => (
        <div key={index} className="space-y-2 p-2 border rounded-md bg-background/50">
          <p className="text-xs font-semibold">Assertion/Wait Property {index + 1}</p>
          <div>
            <Label htmlFor={`propName-${editableStep.id}-${index}`} className="text-xs">Property Name</Label>
            <Input
              id={`propName-${editableStep.id}-${index}`}
              placeholder="e.g., visible, textContent, attribute:data-testid"
              value={prop.name}
              onChange={(e) => handlePropertyChange(index, 'name', e.target.value)}
              className="text-sm h-8 mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`propValue-${editableStep.id}-${index}`} className="text-xs">Expected Value</Label>
            <Input
              id={`propValue-${editableStep.id}-${index}`}
              placeholder="Expected value"
              value={String(prop.expectedValue)} // Ensure value is string for input
              onChange={(e) => {
                // Attempt to convert back to original type, simple conversion for now
                let val: string | number | boolean = e.target.value;
                if (typeof prop.expectedValue === 'boolean') val = e.target.value === 'true';
                else if (typeof prop.expectedValue === 'number') val = parseFloat(e.target.value) || 0;
                handlePropertyChange(index, 'expectedValue', val);
              }}
              className="text-sm h-8 mt-1"
            />
          </div>
          {/* TODO: Add operator dropdown */}
        </div>
      ))}
       {editableStep.timeout !== undefined && (
         <div>
            <Label htmlFor={`timeout-${editableStep.id}`} className="text-xs font-medium">Timeout (ms)</Label>
            <Input
                id={`timeout-${editableStep.id}`}
                type="number"
                placeholder="Timeout in milliseconds"
                value={editableStep.timeout}
                onChange={(e) => handleInputChange('timeout', parseInt(e.target.value, 10) || undefined)}
                className="text-sm h-8 mt-1"
            />
         </div>
       )}

      {/* Button to save changes explicitly within the edit UI */}
      <Button onClick={toggleEdit} size="sm" variant="default" className="h-8 mt-2">
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
            <div className="flex-grow truncate min-w-0">
              <p className="text-sm font-medium truncate" title={editableStep.description}>{editableStep.description}</p>
              {renderStepDetails()}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" aria-label="More options">
                  <MoreOptionsIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={toggleEdit} disabled={isEditing && false /* Allow saving from menu item too if desired, but primary save is inline now */}>
                  <EditIcon className="mr-2 h-4 w-4" />
                  {isEditing ? 'Cancel Edit' : 'Edit Step'} 
                  {/* Changed "Save Changes" to "Cancel Edit" if inline save button is primary */}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDeleteStep(editableStep.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <DeleteIcon className="mr-2 h-4 w-4" />
                  Delete Step
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
          {isEditing && renderEditableFields()}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
