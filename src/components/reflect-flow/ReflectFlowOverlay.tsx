
"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Step } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeaderControls } from './HeaderControls';
import { StepList } from './StepList';
import { ElementHoverPopup } from './ElementHoverPopup';
import { useToast } from '@/hooks/use-toast';
import { PlayIcon, CheckboxSquareIcon, CheckboxUncheckedIcon, FileIcon } from './icons';

export function ReflectFlowOverlay() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<Step[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isElementSelectorActive, setIsElementSelectorActive] = useState(false); // Added state for element selector
  const overlayRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  const handleToggleRecording = useCallback(() => {
    const newIsRecording = !isRecording;
    setIsRecording(newIsRecording);
    if (newIsRecording) {
      toast({
        title: "Recording Started",
        description: "Capturing click interactions. Click on elements on the page.",
      });
    } else {
      toast({
        title: "Recording Paused",
        description: "Interaction recording is now paused.",
      });
    }
  }, [isRecording, toast]);

  const handleClick = useCallback((event: MouseEvent) => {
    if (overlayRef.current && overlayRef.current.contains(event.target as Node)) {
      return;
    }

    const target = event.target as HTMLElement;
    if (!target || !target.tagName || target === document.body || target === document.documentElement) {
      return;
    }
    
    let selector = target.tagName.toLowerCase();
    let descriptionDetailText = target.tagName.toLowerCase();

    if (target.id) {
      selector = `#${target.id}`;
      descriptionDetailText = selector;
    } else {
      const significantClass = Array.from(target.classList).find(
        c => c.trim() !== '' && !/^(bg-|text-|border-|p-|m-|flex|grid|item|justify|self-|gap-|rounded|shadow-|w-|h-)/.test(c)
      );
      if (significantClass) {
        selector = `${target.tagName.toLowerCase()}.${CSS.escape(significantClass)}`;
        descriptionDetailText = `.${CSS.escape(significantClass)}`;
      } else if (target.classList && target.classList.length > 0) {
        const firstClass = Array.from(target.classList).find(c => c.trim() !== '');
        if (firstClass) {
          selector = `${target.tagName.toLowerCase()}.${CSS.escape(firstClass)}`;
          descriptionDetailText = `.${CSS.escape(firstClass)}`;
        }
      }
    }
    
    const description = `Click on ${target.tagName.toLowerCase()}${descriptionDetailText !== target.tagName.toLowerCase() ? ` (${descriptionDetailText})` : ''}`;

    const newStep: Step = {
      id: String(Date.now()) + Math.random().toString(36).substring(2,7),
      type: 'click',
      selector: selector,
      description: description,
    };

    setRecordedSteps(prevSteps => [...prevSteps, newStep]);
    toast({ title: "Action Recorded", description: `Recorded: ${newStep.description}` });
  }, [toast]); 

  useEffect(() => {
    if (isRecording) {
      document.addEventListener('click', handleClick, true);
    } else {
      document.removeEventListener('click', handleClick, true);
    }
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [isRecording, handleClick]);

  const handlePlayAll = useCallback(() => {
    if (recordedSteps.length === 0) {
      toast({ title: "No steps to play", description: "Record some steps first.", variant: "destructive" });
      return;
    }
    toast({ title: "Playing All Steps (Simulated)", description: "Actual playback logic not yet implemented." });
  }, [recordedSteps, toast]);

  const handlePlaySelected = useCallback(() => {
    if (selectedSteps.length === 0) {
      toast({ title: "No steps selected", description: "Please select steps to play.", variant: "destructive" });
      return;
    }
    toast({ title: "Playing Selected Steps (Simulated)", description: `Actual playback logic for ${selectedSteps.length} step(s) not yet implemented.` });
  }, [selectedSteps, toast]);

  // Removed handleAddAssertion
  // const handleAddAssertion = useCallback(() => {
  //   const newAssertion: Step = {
  //     id: String(Date.now()) + Math.random().toString(36).substring(2,7),
  //     type: 'assert',
  //     description: 'New Assertion (Edit details below)',
  //     selector: 'body', 
  //     params: { property: '', expected: '' }
  //   };
  //   setRecordedSteps(prev => [...prev, newAssertion]);
  //   toast({ title: "Assertion Added", description: "A new assertion step has been added. Edit its details in the list." });
  // }, [toast]);

  const handleToggleElementSelector = useCallback(() => { // Added handler
    const newIsActive = !isElementSelectorActive;
    setIsElementSelectorActive(newIsActive);
    toast({
      title: newIsActive ? "Element Selector Activated" : "Element Selector Deactivated",
      description: newIsActive ? "Hover over elements to inspect (mock)." : "Element inspection is off.",
    });
  }, [isElementSelectorActive, toast]);


  const handleSaveSession = useCallback(() => {
    toast({ title: "Session Saved (Simulated)", description: "Actual saving logic not yet implemented." });
  }, [toast]);

  const handleSelectStep = useCallback((id: string, selected: boolean) => {
    setSelectedSteps(prev =>
      selected ? [...prev, id] : prev.filter(stepId => stepId !== id)
    );
  }, []);
  
  const handleSelectAllSteps = useCallback(() => {
    if (selectedSteps.length === recordedSteps.length && recordedSteps.length > 0) {
      setSelectedSteps([]);
    } else {
      setSelectedSteps(recordedSteps.map(step => step.id));
    }
  }, [recordedSteps, selectedSteps]);

  const handleUpdateStep = useCallback((updatedStep: Step) => {
    setRecordedSteps(prev => prev.map(s => s.id === updatedStep.id ? updatedStep : s));
    toast({ title: "Step Updated", description: `Step "${updatedStep.description}" has been saved.` });
  }, [toast]);

  const handleDeleteStep = useCallback((id: string) => {
    setRecordedSteps(prev => prev.filter(s => s.id !== id));
    setSelectedSteps(prev => prev.filter(stepId => stepId !== id));
    toast({ title: "Step Deleted", description: "The step has been removed." });
  }, [toast]);
  
  const mockElementInfo = useMemo(() => ({
    id: "submit-button",
    cssSelector: "button.btn.btn-primary[type='submit']",
    xpath: "//button[@id='submit-button']"
  }), []);

  return (
    <div ref={overlayRef} className="fixed top-0 right-0 h-full p-4 flex flex-col items-end z-[1000] pointer-events-none">
      <Card className="w-[400px] h-full flex flex-col shadow-2xl pointer-events-auto overflow-hidden bg-card/90 backdrop-blur-sm">
        <CardHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileIcon className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl font-headline">ReflectFlow</CardTitle>
                <CardDescription className="text-xs">Record & Playback UI Interactions</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsPopupVisible(prev => !prev)} className="text-xs">
              {isPopupVisible ? "Hide" : "Show"} Inspector
            </Button>
          </div>
          <div className="mt-4">
            <HeaderControls
              isRecording={isRecording}
              onToggleRecording={handleToggleRecording}
              onPlayAll={handlePlayAll}
              // onAddAssertion={handleAddAssertion} // Removed
              onSaveSession={handleSaveSession}
              stepCount={recordedSteps.length}
              isElementSelectorActive={isElementSelectorActive} // Added
              onToggleElementSelector={handleToggleElementSelector} // Added
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden relative">
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
                {selectedSteps.length === recordedSteps.length ? <CheckboxSquareIcon className="mr-2 h-4 w-4" /> : <CheckboxUncheckedIcon className="mr-2 h-4 w-4" />}
                {selectedSteps.length === recordedSteps.length ? 'Deselect All' : 'Select All'} ({selectedSteps.length}/{recordedSteps.length})
              </Button>
              <Button onClick={handlePlaySelected} variant="default" size="sm" disabled={selectedSteps.length === 0 || isRecording} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlayIcon className="mr-2 h-4 w-4" />
                Play Selected ({selectedSteps.length})
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
      <ElementHoverPopup elementInfo={mockElementInfo} isVisible={isPopupVisible && isElementSelectorActive} /> {/* Conditionally show popup */}
    </div>
  );
}
