
"use client";

import { useState, useCallback, useMemo } from 'react';
import type { Step } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeaderControls } from './HeaderControls';
import { StepList } from './StepList';
import { ElementHoverPopup } from './ElementHoverPopup';
import { useToast } from '@/hooks/use-toast';
import { PlayIcon, CheckboxSquareIcon, CheckboxUncheckedIcon, FileIcon } from './icons'; // Updated imports

// Mock initial steps for demonstration
const MOCK_STEPS: Step[] = [
  { id: '1', type: 'navigate', value: 'https://example.com/login', description: 'Navigate to Login Page' },
  { id: '2', type: 'type', selector: '#username', value: 'testUser', description: 'Type username' },
  { id: '3', type: 'type', selector: '#password', value: 'password123', description: 'Type password' },
  { id: '4', type: 'click', selector: 'button[type="submit"]', description: 'Click Login Button' },
  { id: '5', type: 'assert', selector: '.welcome-message', params: {property: 'textContent', expected: 'Welcome testUser'}, description: 'Verify Welcome Message' },
  { id: '6', type: 'scroll', selector: 'window', value: '0, 500', description: 'Scroll window down'},
];


export function ReflectFlowOverlay() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<Step[]>(MOCK_STEPS); // Start with mock data
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false); // For ElementHoverPopup

  const { toast } = useToast();

  const handleToggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
    toast({
      title: isRecording ? "Recording Paused" : "Recording Started",
      description: isRecording ? "Interaction recording is now paused." : "Capturing user interactions.",
    });
  }, [isRecording, toast]);

  const handlePlayAll = useCallback(() => {
    if (recordedSteps.length === 0) {
      toast({ title: "No steps to play", description: "Record some steps first.", variant: "destructive" });
      return;
    }
    toast({ title: "Playing All Steps", description: "Simulating playback of all recorded steps..." });
    // Actual playback logic would go here
  }, [recordedSteps, toast]);

  const handlePlaySelected = useCallback(() => {
    if (selectedSteps.length === 0) {
      toast({ title: "No steps selected", description: "Please select steps to play.", variant: "destructive" });
      return;
    }
    toast({ title: "Playing Selected Steps", description: `Simulating playback of ${selectedSteps.length} selected step(s)...` });
    // Actual playback logic for selected steps would go here
  }, [selectedSteps, toast]);

  const handleAddAssertion = useCallback(() => {
    const newAssertion: Step = {
      id: String(Date.now()),
      type: 'assert',
      description: 'New Assertion',
      selector: 'body', // Default selector
      params: { property: 'visible', expected: 'true' }
    };
    setRecordedSteps(prev => [...prev, newAssertion]);
    toast({ title: "Assertion Added", description: "A new assertion step has been added to the list." });
  }, [toast]);

  const handleSaveSession = useCallback(() => {
    toast({ title: "Session Saved (Simulated)", description: "Your current recording session has been 'saved' locally." });
    // Actual local storage saving logic would go here
  }, [toast]);

  const handleSelectStep = useCallback((id: string, selected: boolean) => {
    setSelectedSteps(prev =>
      selected ? [...prev, id] : prev.filter(stepId => stepId !== id)
    );
  }, []);
  
  const handleSelectAllSteps = useCallback(() => {
    if (selectedSteps.length === recordedSteps.length) {
      setSelectedSteps([]); // Deselect all
    } else {
      setSelectedSteps(recordedSteps.map(step => step.id)); // Select all
    }
  }, [recordedSteps, selectedSteps]);

  const handleUpdateStep = useCallback((updatedStep: Step) => {
    setRecordedSteps(prev => prev.map(s => s.id === updatedStep.id ? updatedStep : s));
    toast({ title: "Step Updated", description: `Step "${updatedStep.description}" has been saved.` });
  }, [toast]);

  const handleDeleteStep = useCallback((id: string) => {
    setRecordedSteps(prev => prev.filter(s => s.id !== id));
    setSelectedSteps(prev => prev.filter(stepId => stepId !== id)); // also remove from selected
    toast({ title: "Step Deleted", description: "The step has been removed from the list." });
  }, [toast]);
  
  const mockElementInfo = useMemo(() => ({
    id: "submit-button",
    cssSelector: "button.btn.btn-primary[type='submit']",
    xpath: "//button[@id='submit-button']"
  }), []);

  return (
    <div className="fixed top-0 right-0 h-full p-4 flex flex-col items-end z-[1000] pointer-events-none">
      <Card className="w-[400px] h-full flex flex-col shadow-2xl pointer-events-auto overflow-hidden">
        <CardHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileIcon className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl font-headline">ReflectFlow</CardTitle>
                <CardDescription className="text-xs">Record & Playback UI Interactions</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsPopupVisible(prev => !prev)}>
              {isPopupVisible ? "Hide" : "Show"} Inspector
            </Button>
          </div>
          <div className="mt-4">
            <HeaderControls
              isRecording={isRecording}
              onToggleRecording={handleToggleRecording}
              onPlayAll={handlePlayAll}
              onAddAssertion={handleAddAssertion}
              onSaveSession={handleSaveSession}
              stepCount={recordedSteps.length}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden relative">
          {/* Add a wrapper for StepList to manage its height if CardContent is used for padding */}
          <div className="h-full"> 
            <StepList
              steps={recordedSteps}
              selectedSteps={selectedSteps}
              onSelectStep={handleSelectStep}
              onUpdateStep={handleUpdateStep}
              onDeleteStep={handleDeleteStep}
            />
          </div>
        </CardContent>
        {recordedSteps.length > 0 && (
          <CardFooter className="p-3 border-t flex-col items-start space-y-2">
            <div className="flex justify-between w-full items-center">
              <Button onClick={handleSelectAllSteps} variant="ghost" size="sm" className="text-xs">
                {selectedSteps.length === recordedSteps.length && recordedSteps.length > 0 ? <CheckboxSquareIcon className="mr-2 h-4 w-4" /> : <CheckboxUncheckedIcon className="mr-2 h-4 w-4" />}
                {selectedSteps.length === recordedSteps.length && recordedSteps.length > 0 ? 'Deselect All' : 'Select All'} ({selectedSteps.length}/{recordedSteps.length})
              </Button>
              <Button onClick={handlePlaySelected} variant="accent" size="sm" disabled={selectedSteps.length === 0 || isRecording}>
                <PlayIcon className="mr-2 h-4 w-4" />
                Play Selected ({selectedSteps.length})
              </Button>
            </div>
           
          </CardFooter>
        )}
      </Card>
      <ElementHoverPopup elementInfo={mockElementInfo} isVisible={isPopupVisible} />
    </div>
  );
}
