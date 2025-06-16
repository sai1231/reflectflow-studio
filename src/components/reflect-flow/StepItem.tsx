
"use client";

import type React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import type { Step, StepType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CommandInfo, availableCommands, findCommandByKey } from '@/lib/commands';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  FileCodeIcon, 
  SaveScreenshotIcon,
  HandIcon, 
  PauseCircleIcon, 
  BugIcon, 
  ChevronsUpDownIcon, 
  ListChecksIcon, 
  WatchIcon, 
  TargetIcon,
} from './icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StepItemProps {
  step: Step;
  initialExpanded?: boolean;
  onUpdateStep: (step: Step) => void;
  onDeleteStep: (id:string) => void;
  onCommandSelected: (stepId: string) => void;
  onPickSelectorForStep: (stepId: string) => void;
}

const getIconForStep = (type: StepType, commandKey?: string): React.ElementType => {
  if (commandKey) {
    const cmd = findCommandByKey(commandKey);
    if (cmd) {
        switch(cmd.key) {
            case 'navigate': return NavigateIcon;
            case 'click': return ClickIcon;
            case 'doubleClick': return ClickIcon;
            case 'setValue': case 'addValue': case 'clearValue': return TypeActionIcon;
            case 'saveScreenshot': return SaveScreenshotIcon;
        }
    }
  }

  switch (type) {
    case 'navigate': return NavigateIcon;
    case 'click': return ClickIcon;
    case 'doubleClick': return ClickIcon; 
    case 'type': return TypeActionIcon;
    case 'keyDown': case 'keyUp': return KeyboardIcon;
    case 'scroll': return ScrollIcon;
    case 'waitForElement': return AssertIcon; 
    case 'moveTo': return MoveToIcon;
    case 'dragAndDrop': return HandIcon;
    case 'executeScript': return FileCodeIcon;
    case 'isEqual': return ChevronsUpDownIcon; 
    case 'saveScreenshot': return SaveScreenshotIcon;
    case 'selectOption': return ListChecksIcon;
    case 'touchAction': return HandIcon;
    case 'waitUntil': return WatchIcon;
    case 'pause': return PauseCircleIcon;
    case 'debug': return BugIcon;
    case 'undetermined': return HelpCircleIcon;
    default: return ActionIcon; 
  }
};

interface ParamDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'string | function' | 'string | object | Array<object>' | 'string | WebdriverIO.Element' ;
  isOptional: boolean;
  fullDefinition: string; 
}


const parseParamDefinition = (def: string, isOptional: boolean): ParamDefinition => {
  const [namePart, typePartWithRest] = def.split(':').map(s => s.trim());
  const typePart = typePartWithRest?.split(' ')[0] || 'string'; 

  let resolvedType: ParamDefinition['type'] = 'string';
  const cleanTypePart = typePart.toLowerCase();

  if (cleanTypePart.includes('number')) resolvedType = 'number';
  else if (cleanTypePart.includes('boolean')) resolvedType = 'boolean';
  else if (cleanTypePart.includes('object') || cleanTypePart.includes('element') || cleanTypePart.includes('array<object>')) resolvedType = 'object'; 
  else if (cleanTypePart.includes('[]') || cleanTypePart.includes('array')) resolvedType = 'array'; 
  else if (cleanTypePart.includes('function')) resolvedType = 'function'; 
  else resolvedType = 'string';


  return { name: namePart.replace('...', '').replace('?', ''), type: resolvedType, isOptional, fullDefinition: def };
};


export function StepItem({ step, initialExpanded = false, onUpdateStep, onDeleteStep, onCommandSelected, onPickSelectorForStep }: StepItemProps) {
  const [editableStep, setEditableStep] = useState<Step>(() => JSON.parse(JSON.stringify(step)));
  const [isExpanded, setIsExpanded] = useState(initialExpanded || step.type === 'undetermined');
  const [commandSearch, setCommandSearch] = useState('');
  const [isCommandPopoverOpen, setIsCommandPopoverOpen] = useState(false);

  const commandInputRef = useRef<HTMLInputElement>(null); 
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: step.id});

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };


  const currentStepCommandInfo = useMemo(() => {
    if (editableStep.type === 'undetermined' || !editableStep.commandKey) return undefined;
    return findCommandByKey(editableStep.commandKey);
  }, [editableStep.type, editableStep.commandKey]);


  useEffect(() => {
    const newEditableStep = JSON.parse(JSON.stringify(step));
    if (editableStep.id !== newEditableStep.id || (editableStep.type === 'undetermined' && newEditableStep.type !== 'undetermined')) {
        setIsExpanded(initialExpanded || newEditableStep.type === 'undetermined');
    }
    setEditableStep(newEditableStep);
    if (newEditableStep.type === 'undetermined') {
        setCommandSearch('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, initialExpanded]);

  const CurrentStepIcon = getIconForStep(editableStep.type, editableStep.commandKey);

  const filteredCommands = useMemo(() => {
    if (!commandSearch) return availableCommands;
    return availableCommands.filter(cmd =>
      cmd.description.toLowerCase().includes(commandSearch.toLowerCase()) ||
      cmd.key.toLowerCase().includes(commandSearch.toLowerCase()) ||
      cmd.badgeLabel.toLowerCase().includes(commandSearch.toLowerCase())
    );
  }, [commandSearch]);

  const handleCommandSelect = (selectedCmd: CommandInfo) => {
    const baseSelectors = editableStep.selectors || [''];
    const baseSelector = editableStep.selector || baseSelectors[0] || '';

    let newStepData: Partial<Step> = {
      type: selectedCmd.mapsToStepType,
      commandKey: selectedCmd.key,
      badgeLabel: selectedCmd.badgeLabel,
      description: selectedCmd.description,
      selectors: selectedCmd.isElementCommand ? baseSelectors : undefined,
      selector: selectedCmd.isElementCommand ? baseSelector : undefined,
      target: editableStep.target || 'main',
      timeout: editableStep.timeout || 5000,
      ...(selectedCmd.defaultParams || {}) 
    };
    
    
    const allParams = [...selectedCmd.requiredParams, ...selectedCmd.optionalParams];
    allParams.forEach(paramDefString => {
      const parsedParam = parseParamDefinition(paramDefString, selectedCmd.optionalParams.includes(paramDefString));
      if (!(parsedParam.name in newStepData)) { 
        switch (parsedParam.type) {
          case 'string':
          case 'object': 
          case 'array':  
          case 'function': 
            (newStepData as any)[parsedParam.name] = ''; break;
          case 'number': (newStepData as any)[parsedParam.name] = 0; break;
          case 'boolean': (newStepData as any)[parsedParam.name] = false; break;
          default: (newStepData as any)[parsedParam.name] = ''; 
        }
      }
    });
    
    
    if (selectedCmd.key === 'getAttribute' && (newStepData as any).attributeName) {
       (newStepData as any).property = `attribute:${(newStepData as any).attributeName}`;
    } else if (selectedCmd.key === 'getCSSProperty' && (newStepData as any).cssProperty) {
       (newStepData as any).property = `css:${(newStepData as any).cssProperty}`;
    } else if (selectedCmd.key === 'getProperty' && (newStepData as any).jsPropertyName) {
       (newStepData as any).property = `jsProperty:${(newStepData as any).jsPropertyName}`;
    }


    const fullyTypedStep = {
      ...editableStep, 
      ...newStepData,
    } as Step;


    setEditableStep(fullyTypedStep);
    onUpdateStep(fullyTypedStep); 
    setIsCommandPopoverOpen(false);
    setCommandSearch('');
    if (fullyTypedStep.type !== 'undetermined') {
      onCommandSelected(fullyTypedStep.id); 
      setIsExpanded(true); 
    }
  };

  const handleInputChange = (field: keyof Step | string, value: any) => {
    setEditableStep(prev => ({ ...prev, [field]: value } as Step));
  };

  const handleNumericInputChange = (field: keyof Step | string, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value); 
    setEditableStep(prev => ({ ...prev, [field]: numValue } as Step));
  };
  
  const handleCheckboxChange = (field: keyof Step | string, checked: boolean) => {
    setEditableStep(prev => ({ ...prev, [field]: checked } as Step));
  };

  const handleSelectorChange = (index: number, value: string) => {
    setEditableStep(prev => {
      const newSelectors = [...(prev.selectors || [''])]; 
      if (index < newSelectors.length) {
        newSelectors[index] = value;
      } else if (index === newSelectors.length) {
        newSelectors.push(value);
      }
      const primarySelector = newSelectors[0] || '';
      return { ...prev, selectors: newSelectors, selector: primarySelector } as Step;
    });
  };

  const handleAddSelector = () => {
    setEditableStep(prev => {
      const newSelectors = [...(prev.selectors || []), ''];
      return { ...prev, selectors: newSelectors } as Step;
    });
  };

  const handleRemoveSelector = (index: number) => {
    setEditableStep(prev => {
      const newSelectors = [...(prev.selectors || [])];
      if (newSelectors.length > 1 && index < newSelectors.length) { 
        newSelectors.splice(index, 1);
      } else if (newSelectors.length === 1 && index === 0) {
        newSelectors[0] = ''; 
      }
      const primarySelector = newSelectors[0] || '';
      return { ...prev, selectors: newSelectors, selector: primarySelector } as Step;
    });
  };

  const handleSaveChanges = () => {
    let finalStep = { ...editableStep };
    
    if (finalStep.selectors && finalStep.selectors.length > 0) {
      finalStep.selector = finalStep.selectors[0];
    } else if (finalStep.selector && (!finalStep.selectors || finalStep.selectors.length === 0)) {
      finalStep.selectors = [finalStep.selector];
    }

    
    if (finalStep.commandKey === 'getAttribute' && (finalStep as any).attributeName && !(finalStep as any).property?.startsWith('attribute:')) {
       (finalStep as any).property = `attribute:${(finalStep as any).attributeName}`;
    } else if (finalStep.commandKey === 'getCSSProperty' && (finalStep as any).cssProperty && !(finalStep as any).property?.startsWith('css:')) {
       (finalStep as any).property = `css:${(finalStep as any).cssProperty}`;
    } else if (finalStep.commandKey === 'getProperty' && (finalStep as any).jsPropertyName && !(finalStep as any).property?.startsWith('jsProperty:')) {
       (finalStep as any).property = `jsProperty:${(finalStep as any).jsPropertyName}`;
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
    if (s.type === 'undetermined') return <p className="text-xs text-muted-foreground truncate">Choose a command to define this step.</p>;

    const primarySelectorDisplay = s.selector || (s.selectors && s.selectors[0]) || '';
    let summaryText = s.description || s.badgeLabel || s.type; 

    if (s.type === 'navigate' && 'url' in s) summaryText = `Navigate to: ${s.url || '...'}`;
    else if (s.type === 'type' && 'value' in s) summaryText = `Type: "${s.value || '...'}" into ${primarySelectorDisplay || 'element'}`;
    else if (s.type === 'scroll' && 'scrollType' in s && s.scrollType === 'window') summaryText = `Scroll window to X:${(s as any).x ?? 0}, Y:${(s as any).y ?? 0}`;
    else if (primarySelectorDisplay && (s.description || s.badgeLabel)) summaryText = `${s.description || s.badgeLabel} on ${primarySelectorDisplay}`;
    else if (s.description || s.badgeLabel) summaryText = s.description || s.badgeLabel;

    return <p className="text-xs text-muted-foreground truncate" title={summaryText}>{summaryText}</p>;
  };

  const renderCommandSelector = () => (
    <div className="space-y-2 p-3 border-t mt-2 bg-muted/20 rounded-b-md">
      <Label htmlFor={`cmd-select-trigger-${editableStep.id}`} className="text-sm font-medium">Choose Command</Label>
      <Popover open={isCommandPopoverOpen} onOpenChange={setIsCommandPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={popoverTriggerRef}
            id={`cmd-select-trigger-${editableStep.id}`}
            variant="outline"
            role="combobox"
            aria-expanded={isCommandPopoverOpen}
            className="w-full justify-between text-sm h-10"
          >
            {editableStep.badgeLabel && editableStep.type !== 'undetermined' ? 
             (editableStep.badgeLabel) : "Select command..."}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(var(--radix-popover-trigger-width))] p-0 z-[10001]"
          align="start"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            commandInputRef.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
             e.preventDefault();
          }} 
        >
          <Input
            ref={commandInputRef}
            data-command-input="true"
            placeholder="Type to search commands..."
            value={commandSearch}
            onChange={(e) => setCommandSearch(e.target.value)}
            className="text-sm h-10 border-x-0 border-t-0 rounded-none focus-visible:ring-0"
          />
          <ScrollArea className="h-[200px]">
            {filteredCommands.length > 0 ? (
              filteredCommands.map(cmd => (
                <div
                  key={cmd.key}
                  data-command-item="true"
                  className="p-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer text-sm outline-none"
                  onClick={() => handleCommandSelect(cmd)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCommandSelect(cmd); }}
                  tabIndex={0}
                >
                  {cmd.badgeLabel} <span className="text-xs text-muted-foreground">({cmd.description})</span>
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

 const renderDynamicParamInputs = () => {
    if (!currentStepCommandInfo || editableStep.type === 'undetermined') return null;

    const paramsToRender: ParamDefinition[] = [
      ...currentStepCommandInfo.requiredParams.map(p => parseParamDefinition(p, false)),
      ...currentStepCommandInfo.optionalParams.map(p => parseParamDefinition(p, true))
    ];

    if (paramsToRender.length === 0 && !currentStepCommandInfo.isElementCommand) {
        return <p className="text-xs text-muted-foreground py-2">This command requires no additional parameters.</p>;
    }
    
    return paramsToRender.map(param => {
      const paramValue = (editableStep as any)[param.name];
      const labelText = `${param.name.charAt(0).toUpperCase() + param.name.slice(1)}${param.isOptional ? '' : '*'}:`;
      const placeholder = `Enter ${param.name}`;

      return (
        <div key={param.name} className="grid grid-cols-3 gap-2 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor={`${editableStep.id}-${param.name}`} className="text-xs cursor-help">
                  {labelText}
                </Label>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-xs">{param.fullDefinition}</p>
                {param.type === 'object' || param.type === 'array' || param.type === 'function' ? 
                 <p className="text-xs mt-1">For objects/arrays, use JSON. For functions, write script body.</p> : null}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="col-span-2">
            {param.type === 'boolean' ? (
              <Checkbox
                id={`${editableStep.id}-${param.name}`}
                checked={!!paramValue}
                onCheckedChange={(checked) => handleCheckboxChange(param.name, !!checked)}
              />
            ) : param.type === 'number' ? (
              <Input
                id={`${editableStep.id}-${param.name}`}
                type="number"
                placeholder={placeholder}
                value={paramValue !== undefined ? String(paramValue) : ''}
                onChange={(e) => handleNumericInputChange(param.name, e.target.value)}
                className="text-sm h-8"
              />
            ) : (param.type === 'object' || param.type === 'array' || param.type === 'function') ? (
               <Textarea
                id={`${editableStep.id}-${param.name}`}
                placeholder={param.type === 'function' ? 'Enter script here...' : 'Enter JSON string...'}
                value={typeof paramValue === 'object' ? JSON.stringify(paramValue) : (paramValue !== undefined ? String(paramValue) : '')}
                onChange={(e) => handleInputChange(param.name, e.target.value)}
                className="text-sm h-20"
                rows={2}
              />
            ) : ( 
              <Input
                id={`${editableStep.id}-${param.name}`}
                type="text"
                placeholder={placeholder}
                value={paramValue !== undefined ? String(paramValue) : ''}
                onChange={(e) => handleInputChange(param.name, e.target.value)}
                className="text-sm h-8"
              />
            )}
          </div>
        </div>
      );
    });
  };

  const renderCommonFields = () => (
     <div className="space-y-2">
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
     </div>
  );

  const renderEditableFields = () => {
    const showPickSelectorButton = currentStepCommandInfo?.isElementCommand && 
                                  (!editableStep.selectors || editableStep.selectors.every(s => !s.trim()));
    return (
      <div className="space-y-3 p-3 border-t mt-2 bg-muted/20 rounded-b-md">
        {renderCommonFields()}

        {currentStepCommandInfo?.isElementCommand && (
          <>
            {(editableStep.selectors && editableStep.selectors.length > 0 && !editableStep.selectors.every(s=>!s.trim()) ? editableStep.selectors : ['']).map((sel, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 items-center">
                <Label htmlFor={`selector-${editableStep.id}-${index}`} className="text-xs">
                  {index === 0 ? 'Selector(s)*' : `Alt. Sel. ${index}`}
                </Label>
                <div className="col-span-2 flex items-center gap-1">
                  <Input
                    id={`selector-${editableStep.id}-${index}`}
                    placeholder={showPickSelectorButton && index === 0 ? "Click target icon to pick..." : (index === 0 ? "Primary Selector (CSS, XPath)" : "Alternative Selector")}
                    value={sel}
                    onChange={(e) => handleSelectorChange(index, e.target.value)}
                    className="text-sm h-8 flex-grow"
                    disabled={showPickSelectorButton && index === 0}
                  />
                   {index === 0 && showPickSelectorButton && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onPickSelectorForStep(editableStep.id)} 
                          className="h-7 w-7 p-0 flex-shrink-0" 
                          aria-label="Pick selector from page"
                        >
                          <TargetIcon className="h-4 w-4 text-primary" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Pick selector from page</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {(editableStep.selectors || []).length > 1 && !showPickSelectorButton && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSelector(index)} className="h-7 w-7 p-0 flex-shrink-0" aria-label="Remove selector">
                      <DeleteIcon className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!showPickSelectorButton && (
              <div className="grid grid-cols-3 gap-2 items-center">
                <div></div>
                <div className="col-span-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleAddSelector} className="h-7 text-xs mt-1 w-full">
                    Add Selector
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {renderDynamicParamInputs()}

        <Button onClick={handleSaveChanges} size="sm" variant="default" className="h-8 mt-3 w-full">
          <SaveIcon className="mr-1 h-3 w-3" /> Apply Changes
        </Button>
      </div>
    );
  };


  return (
    <TooltipProvider delayDuration={300}>
      <Card 
        ref={setNodeRef} 
        style={style} 
        className={cn("mb-2 shadow-sm", isDragging && "shadow-xl ring-2 ring-primary")}
      >
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <div 
              {...attributes} 
              {...listeners} 
              className="cursor-grab p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-ring rounded" 
              aria-label="Drag to reorder step"
            >
              <DragHandleIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <CurrentStepIcon className="h-5 w-5 text-primary flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Type: {editableStep.type} {editableStep.commandKey ? `(Cmd: ${editableStep.commandKey})` : ''}</p>
              </TooltipContent>
            </Tooltip>
            {editableStep.type !== 'undetermined' && (
                <Badge variant="outline" className="text-xs h-6 px-2 py-1 whitespace-nowrap">
                    {editableStep.badgeLabel || editableStep.type}
                </Badge>
            )}

            <div
              className="flex-grow truncate min-w-0"
              onClick={editableStep.type !== 'undetermined' ? toggleExpand : undefined}
              role={editableStep.type !== 'undetermined' ? "button" : undefined}
              tabIndex={editableStep.type !== 'undetermined' ? 0 : undefined}
              onKeyDown={(e) => editableStep.type !== 'undetermined' && (e.key === 'Enter' || e.key === ' ') && toggleExpand()}
              aria-expanded={isExpanded}
            >
              <p className="text-sm font-medium truncate" title={editableStep.badgeLabel || editableStep.description || "New Step - Choose Command"}>
                {editableStep.badgeLabel || editableStep.description || (editableStep.type === 'undetermined' ? "New Step - Choose Command" : "Step")}
              </p>
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
                  onClick={(e) => e.stopPropagation()} 
                  onFocus={(e) => e.stopPropagation()} 
                >
                  <MoreOptionsIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="z-[10002]"
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
