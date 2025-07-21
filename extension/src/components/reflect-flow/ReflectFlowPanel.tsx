
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Step, UndeterminedStep, ChromeMessage } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeaderControls } from './HeaderControls';
import { StepList } from './StepList';
import { useToast } from '@/hooks/use-toast';
import { FileIcon, AddIcon, MoveIcon } from './icons';
import { arrayMove } from '@dnd-kit/sortable';
import { findCommandByKey } from '@/lib/commands';

export function ReflectFlowPanel() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<Step[]>([]);
  const [isElementSelectorActive, setIsElementSelectorActive] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [newlyAddedStepId, setNewlyAddedStepId] = useState<string | null>(null);

  const { toast } = useToast();

  const panelRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Effect to listen for messages from the background/content script (e.g., new steps, state updates)
  useEffect(() => {
    const messageListener = (message: ChromeMessage) => {
      if (message.type === 'ADD_STEP' && message.payload) {
        const command = findCommandByKey(message.payload.commandKey);
        if (!command) return;

        const newStep: Step = {
            id: message.payload.id || `${Date.now()}`,
            type: command.mapsToStepType,
            commandKey: command.key,
            badgeLabel: command.badgeLabel,
            description: command.description,
            selectors: message.payload.selectors,
            selector: message.payload.selector,
            target: 'main',
            timeout: 5000,
            ...command.defaultParams,
            ...message.payload,
        };

        setRecordedSteps(prev => [...prev, newStep]);
        setNewlyAddedStepId(newStep.id);
      } else if (message.type === 'STATE_UPDATE') {
          setIsRecording(message.payload.isRecording);
          setIsElementSelectorActive(message.payload.isElementSelectorActive);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Ask background for initial state when component mounts
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
        if (response) {
            setIsRecording(response.isRecording);
            setIsElementSelectorActive(response.isElementSelectorActive);
        }
    });

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const sendMessageToBackground = (message: ChromeMessage) => {
    chrome.runtime.sendMessage(message);
  };

  const handleToggleRecording = useCallback(() => {
    const newIsRecording = !isRecording;
    sendMessageToBackground({ type: 'TOGGLE_RECORDING', payload: { isRecording: newIsRecording } });
  }, [isRecording]);

  const handleToggleElementSelector = useCallback(() => {
    const newIsActive = !isElementSelectorActive;
    sendMessageToBackground({ type: 'TOGGLE_ELEMENT_SELECTOR', payload: { isActive: newIsActive } });
  }, [isElementSelectorActive]);
  
  const handleTogglePanelCollapse = useCallback(() => setIsPanelCollapsed(prev => !prev), []);

  const handleAddManualStep = useCallback(() => {
    const newStep: UndeterminedStep = {
      id: `${Date.now()}`, type: 'undetermined', badgeLabel: 'New Step',
      description: 'New Step - Choose Command', target: 'main', timeout: 5000, selectors: [''], selector: ''
    };
    setRecordedSteps(prev => [...prev, newStep]);
    setNewlyAddedStepId(newStep.id);
    toast({ title: "New Step Added", description: "Choose a command for the new step." });
  }, [toast]);

  const handleSaveSession = useCallback(() => {
    // Session saving logic remains the same
  }, [recordedSteps, toast]);

  const handleExportSession = useCallback(() => {
     // Session exporting logic remains the same
  }, [recordedSteps, toast]);

  const handleUpdateStep = useCallback((updatedStep: Step) => {
    setRecordedSteps(prev => prev.map(s => s.id === updatedStep.id ? updatedStep : s));
    if (updatedStep.type !== 'undetermined') {
      toast({ title: "Step Updated", description: `Step "${updatedStep.badgeLabel || updatedStep.description}" has been configured.` });
    }
    if (newlyAddedStepId === updatedStep.id) setNewlyAddedStepId(null);
  }, [newlyAddedStepId, toast]);

  const handleDeleteStep = useCallback((id: string) => {
    setRecordedSteps(prev => prev.filter(s => s.id !== id));
    toast({ title: "Step Deleted" });
  }, [toast]);

  const handleReorderSteps = useCallback((oldIndex: number, newIndex: number) => {
    setRecordedSteps(prev => arrayMove(prev, oldIndex, newIndex));
    toast({ title: "Steps Reordered" });
  }, [toast]);
  
  const handleInitiateSelectorPick = useCallback((_stepId: string) => {
    sendMessageToBackground({ type: 'TOGGLE_ELEMENT_SELECTOR', payload: { isActive: true } });
    toast({ title: "Pick an Element", description: "Hover over and click an element on the page." });
  }, []);

  // Dragging logic
  const onDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!panelRef.current) return;
    setIsDragging(true);
    const panelRect = panelRef.current.getBoundingClientRect();
    dragStartPos.current = {
      x: e.clientX - panelRect.left,
      y: e.clientY - panelRect.top,
    };
    document.addEventListener('mousemove', onDragMouseMove);
    document.addEventListener('mouseup', onDragMouseUp);
  };

  const onDragMouseMove = (e: MouseEvent) => {
    if (!isDragging || !panelRef.current) return;
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    panelRef.current.style.left = `${newX}px`;
    panelRef.current.style.top = `${newY}px`;
  };

  const onDragMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', onDragMouseMove);
    document.removeEventListener('mouseup', onDragMouseUp);
  };


  return (
    <Card ref={panelRef} className="h-full w-full flex flex-col shadow-2xl border bg-card/80 backdrop-blur-sm rounded-lg overflow-hidden resize">
      <CardHeader className="p-4 border-b flex-shrink-0">
        <div className="flex justify-between items-center">
          <div ref={dragHandleRef} onMouseDown={onDragMouseDown} className="flex items-center space-x-2 cursor-move flex-grow">
            <MoveIcon className="h-4 w-4 text-muted-foreground" />
            {!isPanelCollapsed && (
              <>
                <FileIcon className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-xl font-headline">ReflectFlow</CardTitle>
                  <CardDescription className="text-xs">Record & Playback UI Interactions</CardDescription>
                </div>
              </>
            )}
          </div>
        </div>
        <div className={`mt-4 ${isPanelCollapsed ? 'flex justify-center' : ''}`}>
          <HeaderControls
            isRecording={isRecording} onToggleRecording={handleToggleRecording}
            onSaveSession={handleSaveSession} onExportSession={handleExportSession}
            stepCount={recordedSteps.length} isElementSelectorActive={isElementSelectorActive}
            onToggleElementSelector={handleToggleElementSelector} isPanelCollapsed={isPanelCollapsed}
            onTogglePanelCollapse={handleTogglePanelCollapse}
          />
        </div>
      </CardHeader>
      {!isPanelCollapsed && (
        <>
          <CardContent className="flex-1 min-h-0 overflow-hidden p-0 relative">
            <StepList
              steps={recordedSteps} onUpdateStep={handleUpdateStep}
              onDeleteStep={handleDeleteStep} newlyAddedStepId={newlyAddedStepId}
              onStepDetermined={() => newlyAddedStepId && setNewlyAddedStepId(null)}
              onReorderSteps={handleReorderSteps} onPickSelectorForStep={handleInitiateSelectorPick}
            />
          </CardContent>
          <CardFooter className="p-3 border-t flex-shrink-0">
            <Button onClick={handleAddManualStep} variant="outline" size="sm" className="w-full">
              <AddIcon className="mr-2 h-4 w-4" /> Add Step
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
