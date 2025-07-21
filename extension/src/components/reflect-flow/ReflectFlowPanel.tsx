
"use client";

import { useState, useCallback, useEffect } from 'react';
import type { Step, UndeterminedStep, RecordingSession, ChromeMessage } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeaderControls } from './HeaderControls';
import { StepList } from './StepList';
import { useToast } from '@/hooks/use-toast';
import { FileIcon, AddIcon } from './icons';
import { arrayMove } from '@dnd-kit/sortable';
import { findCommandByKey } from '@/lib/commands';

export function ReflectFlowPanel() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<Step[]>([]);
  const [isElementSelectorActive, setIsElementSelectorActive] = useState(false);
  
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [newlyAddedStepId, setNewlyAddedStepId] = useState<string | null>(null);

  const { toast } = useToast();

  // Effect to listen for messages from the background script (e.g., new steps)
  useEffect(() => {
    const messageListener = (message: ChromeMessage, sender: chrome.runtime.MessageSender) => {
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
            ...message.payload, // Include any other properties like value, url etc.
        };

        setRecordedSteps(prev => [...prev, newStep]);
        setNewlyAddedStepId(newStep.id);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);


  const sendMessageToContentScript = (message: ChromeMessage) => {
    // In an extension, you'd send a message to the content script.
    // We'll use the background script as a relay.
    chrome.runtime.sendMessage(message);
  };

  const handleToggleRecording = useCallback(() => {
    const newIsRecording = !isRecording;
    setIsRecording(newIsRecording);
    sendMessageToContentScript({ type: 'TOGGLE_RECORDING', payload: { isRecording: newIsRecording } });
    toast({
      title: newIsRecording ? "Recording Started" : "Recording Paused",
      description: newIsRecording ? "Capturing interactions on the page." : "Interaction recording is now paused.",
    });
  }, [isRecording, toast]);

  const handleToggleElementSelector = useCallback(() => {
    const newIsActive = !isElementSelectorActive;
    setIsElementSelectorActive(newIsActive);
    sendMessageToContentScript({ type: 'TOGGLE_ELEMENT_SELECTOR', payload: { isActive: newIsActive } });
    toast({
        title: newIsActive ? "Element Selector Activated" : "Element Selector Deactivated",
        description: newIsActive ? "Hover over elements to inspect." : "Element inspection is off.",
      });
  }, [isElementSelectorActive, toast]);

  const handleTogglePanelCollapse = useCallback(() => {
    setIsPanelCollapsed(prev => !prev);
  }, []);

  const handleAddManualStep = useCallback(() => {
    const baseId = String(Date.now()) + Math.random().toString(36).substring(2, 7);
    const newStep: UndeterminedStep = {
        id: baseId,
        type: 'undetermined',
        badgeLabel: 'New Step',
        description: 'New Step - Choose Command',
        target: 'main',
        timeout: 5000,
        selectors: [''], 
        selector: ''
    };
    setRecordedSteps(prev => [...prev, newStep]);
    setNewlyAddedStepId(newStep.id);
    toast({ title: "New Step Added", description: "Choose a command for the new step." });
  }, [toast]);

  const handleSaveSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sessionToSave: RecordingSession = {
      title: "My Recorded Session " + new Date().toLocaleTimeString(),
      description: "A recording of user interactions.",
      url: "N/A (Extension Context)",
      steps: recordedSteps,
      device_screen_emulation: {
        width: 0, 
        height: 0,
        deviceScaleFactor: window.devicePixelRatio,
        mobile: /Mobi|Android/i.test(navigator.userAgent),
        userAgent: navigator.userAgent,
      }
    };
    
    try {
      // Use chrome.storage.local for extensions
      chrome.storage.local.set({ 'reflectFlowSession': JSON.stringify(sessionToSave) }, () => {
         toast({ title: "Session Saved", description: "Session data saved to extension storage." });
      });
    } catch (error) {
      console.error("Error saving session to chrome.storage:", error);
      toast({ title: "Save Error", "description": "Could not save session. See console.", variant: "destructive" });
    }
  }, [recordedSteps, toast]);

  const handleExportSession = useCallback(() => {
    if (typeof window === 'undefined') return;
     const sessionToSave: RecordingSession = {
      title: "My Recorded Session - " + new Date().toISOString(),
      description: "A recording of user interactions exported from ReflectFlow.",
      url: "N/A (Extension Context)",
      steps: recordedSteps,
      device_screen_emulation: {
        width: 0,
        height: 0,
        deviceScaleFactor: window.devicePixelRatio,
        mobile: /Mobi|Android/i.test(navigator.userAgent),
        userAgent: navigator.userAgent,
      }
    };

    const jsonString = JSON.stringify(sessionToSave, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `reflectflow-session-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);

    toast({ title: "Session Exported", description: "Session data downloaded as JSON file." });
  }, [recordedSteps, toast]);

  const handleUpdateStep = useCallback((updatedStep: Step) => {
    setRecordedSteps(prev => prev.map(s => s.id === updatedStep.id ? updatedStep : s));
    if (updatedStep.type !== 'undetermined') {
        const finalDescription = updatedStep.badgeLabel || updatedStep.description;
        toast({ title: "Step Updated", description: `Step "${finalDescription}" has been configured.` });
    }
    if (newlyAddedStepId === updatedStep.id && updatedStep.type !== 'undetermined') {
        setNewlyAddedStepId(null);
    }
  }, [newlyAddedStepId, toast]);

  const handleDeleteStep = useCallback((id: string) => {
    setRecordedSteps(prev => prev.filter(s => s.id !== id));
    toast({ title: "Step Deleted", description: "The step has been removed." });
  }, [toast]);

  const handleReorderSteps = useCallback((oldIndex: number, newIndex: number) => {
    setRecordedSteps((prevSteps) => {
      if (oldIndex !== newIndex && oldIndex >= 0 && oldIndex < prevSteps.length && newIndex >= 0 && newIndex < prevSteps.length) {
        return arrayMove(prevSteps, oldIndex, newIndex);
      }
      return prevSteps;
    });
    toast({ title: "Steps Reordered", description: "The order of the steps has been updated." });
  }, [toast]);

  const handleInitiateSelectorPick = useCallback((stepId: string) => {
    toast({ title: "Pick an Element", description: "This would activate picking mode on the page." });
  }, [toast]);

  return (
    <Card className="h-full w-full flex flex-col shadow-none border-none rounded-none bg-card/90 backdrop-blur-sm">
      <CardHeader className="p-4 border-b">
        <div className="flex justify-between items-center">
          {!isPanelCollapsed && (
            <div className="flex items-center space-x-2">
              <FileIcon className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl font-headline">ReflectFlow</CardTitle>
                <CardDescription className="text-xs">Record & Playback UI Interactions</CardDescription>
              </div>
            </div>
          )}
          {isPanelCollapsed && <div className="w-6 h-6"></div>}
        </div>
        <div className={`mt-4 ${isPanelCollapsed ? 'flex justify-center' : ''}`}>
          <HeaderControls
            isRecording={isRecording}
            onToggleRecording={handleToggleRecording}
            onSaveSession={handleSaveSession}
            onExportSession={handleExportSession}
            stepCount={recordedSteps.length}
            isElementSelectorActive={isElementSelectorActive}
            onToggleElementSelector={handleToggleElementSelector}
            isPanelCollapsed={isPanelCollapsed}
            onTogglePanelCollapse={handleTogglePanelCollapse}
          />
        </div>
      </CardHeader>
      {!isPanelCollapsed && (
        <>
          <CardContent className="flex-1 min-h-0 overflow-hidden p-0 relative">
            <StepList
              steps={recordedSteps}
              onUpdateStep={handleUpdateStep}
              onDeleteStep={handleDeleteStep}
              newlyAddedStepId={newlyAddedStepId}
              onStepDetermined={() => newlyAddedStepId ? setNewlyAddedStepId(null) : undefined}
              onReorderSteps={handleReorderSteps}
              onPickSelectorForStep={handleInitiateSelectorPick}
            />
          </CardContent>
          <CardFooter className="p-3 border-t flex flex-col items-start space-y-2">
              <div className="flex justify-start w-full items-center">
                <Button onClick={handleAddManualStep} variant="outline" size="sm">
                  <AddIcon className="mr-2 h-4 w-4" /> Add Step
                </Button>
              </div>
            </CardFooter>
        </>
      )}
    </Card>
  );
}
