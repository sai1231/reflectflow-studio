"use client";

import type React from 'react';
import { useState } from 'react';
import type { Step } from '@/types';
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
  SubmitIcon,
  AssertIcon,
  EditIcon,
  DeleteIcon,
  SaveIcon,
  DragHandleIcon,
  MoreOptionsIcon
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

const actionIcons: Record<Step['type'], React.ElementType> = {
  click: ClickIcon,
  type: TypeActionIcon,
  navigate: NavigateIcon,
  scroll: ScrollIcon,
  submit: SubmitIcon,
  assert: AssertIcon,
};

export function StepItem({ step, isSelected, onSelect, onUpdateStep, onDeleteStep }: StepItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableStep, setEditableStep] = useState<Step>(step);

  const ActionIcon = actionIcons[step.type] || ClickIcon;

  const handleInputChange = (field: keyof Step, value: string) => {
    setEditableStep(prev => ({ ...prev, [field]: value }));
  };
  
  const handleParamsChange = (key: string, value: string) => {
    setEditableStep(prev => ({ ...prev, params: { ...prev.params, [key]: value } }));
  };

  const toggleEdit = () => {
    if (isEditing) {
      onUpdateStep(editableStep);
    }
    setIsEditing(!isEditing);
  };

  const renderEditableFields = () => (
    <div className="space-y-2 p-2 border-t mt-2">
      <Input
        placeholder="Description"
        value={editableStep.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        className="text-sm"
      />
      {step.type !== 'navigate' && step.type !== 'scroll' && step.type !== 'submit' && (
        <Input
          placeholder="Selector (ID, CSS, XPath)"
          value={editableStep.selector || ''}
          onChange={(e) => handleInputChange('selector', e.target.value)}
          className="text-sm"
        />
      )}
      { (step.type === 'type' || step.type === 'navigate') && (
        <Input
          placeholder={step.type === 'type' ? "Value to type" : "URL"}
          value={editableStep.value || ''}
          onChange={(e) => handleInputChange('value', e.target.value)}
          className="text-sm"
        />
      )}
      { step.type === 'assert' && (
        <>
         <Input
            placeholder="Property (e.g. textContent, visible)"
            value={editableStep.params?.property || ''}
            onChange={(e) => handleParamsChange('property', e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="Expected Value"
            value={editableStep.params?.expected || ''}
            onChange={(e) => handleParamsChange('expected', e.target.value)}
            className="text-sm"
          />
        </>
      )}
      <Button onClick={toggleEdit} size="sm" variant="outline"><SaveIcon className="mr-1 h-4 w-4" /> Save</Button>
    </div>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Card className={`mb-2 transition-all duration-150 ease-in-out ${isSelected ? 'shadow-lg border-primary' : 'shadow-sm'}`}>
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <DragHandleIcon className="h-5 w-5 text-muted-foreground cursor-grab" />
            <Checkbox
              id={`step-${step.id}`}
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(step.id, !!checked)}
              aria-label={`Select step ${step.description}`}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <ActionIcon className="h-5 w-5 text-primary" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Action: {step.type}</p>
              </TooltipContent>
            </Tooltip>
            <div className="flex-grow truncate">
              <p className="text-sm font-medium truncate" title={step.description}>{step.description}</p>
              {step.selector && <p className="text-xs text-muted-foreground truncate" title={step.selector}>Selector: {step.selector}</p>}
              {step.value && (step.type === 'type' || step.type === 'navigate') && <p className="text-xs text-muted-foreground truncate" title={step.value}>Value: {step.value}</p>}
              {step.type === 'assert' && step.params && <p className="text-xs text-muted-foreground truncate">Assert: {step.params.property} is "{step.params.expected}"</p>}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreOptionsIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={toggleEdit}>
                  <EditIcon className="mr-2 h-4 w-4" />
                  {isEditing ? 'Save' : 'Edit'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDeleteStep(step.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <DeleteIcon className="mr-2 h-4 w-4" />
                  Delete
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
