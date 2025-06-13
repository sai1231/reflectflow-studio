
"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Step } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeaderControls } from './HeaderControls';
import { StepList } from './StepList';
import { ElementHoverPopup } from './ElementHoverPopup';
import { HighlightOverlay } from './HighlightOverlay';
import { useToast } from '@/hooks/use-toast';
import { PlayIcon, CheckboxSquareIcon, CheckboxUncheckedIcon, FileIcon, TargetIcon } from './icons';

interface ElementDetails {
  element: HTMLElement;
  info: ElementInfoForPopup;
}

interface ElementInfoForPopup {
  id?: string;
  cssSelector?: string;
  xpath?: string;
  tagName?: string;
}

export function ReflectFlowOverlay() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<Step[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  // const [isInspectorPanelVisible, setIsInspectorPanelVisible] = useState(true); // No longer directly controls element popup visibility
  const [isElementSelectorActive, setIsElementSelectorActive] = useState(false);
  
  const [highlightedElementDetails, setHighlightedElementDetails] = useState<ElementDetails | null>(null);
  const [inspectIconTarget, setInspectIconTarget] = useState<HTMLElement | null>(null);
  const [isElementContextPopupOpen, setIsElementContextPopupOpen] = useState(false);
  const [popupAnchorPosition, setPopupAnchorPosition] = useState<{ top: number; left: number } | null>(null);
  const [currentPopupElementInfo, setCurrentPopupElementInfo] = useState<ElementInfoForPopup | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleToggleRecording = useCallback(() => {
    const newIsRecording = !isRecording;
    setIsRecording(newIsRecording);
    if (newIsRecording) {
      setIsElementSelectorActive(false); 
      setIsElementContextPopupOpen(false);
      setInspectIconTarget(null);
      setHighlightedElementDetails(null);
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
    if (isElementSelectorActive || !isRecording || isElementContextPopupOpen) return; 

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
      selector = `#${CSS.escape(target.id)}`;
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
  }, [toast, isElementSelectorActive, isRecording, isElementContextPopupOpen]); 

  useEffect(() => {
    if (isRecording && !isElementSelectorActive && !isElementContextPopupOpen) {
      document.addEventListener('click', handleClick, true);
    } else {
      document.removeEventListener('click', handleClick, true);
    }
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [isRecording, handleClick, isElementSelectorActive, isElementContextPopupOpen]);


  const generateElementInfo = (element: HTMLElement): ElementInfoForPopup => {
    let id = element.id ? `#${CSS.escape(element.id)}` : undefined;
    let cssSelector = `${element.tagName.toLowerCase()}`;
    if (element.classList.length > 0) {
      const classes = Array.from(element.classList).filter(c => c.trim() !== '').map(c => CSS.escape(c)).join('.');
      if (classes) cssSelector += `.${classes}`;
    }
    
    let xpath = `//${element.tagName.toLowerCase()}`;
    if (element.id) {
      xpath += `[@id='${CSS.escape(element.id)}']`;
    } else if (element.classList.length > 0) {
        const significantClass = Array.from(element.classList).find(c => !c.startsWith('bg-') && !c.startsWith('text-') && !c.startsWith('p-') && !c.startsWith('m-') && c.trim() !== '');
        if (significantClass) {
            xpath += `[contains(@class, '${CSS.escape(significantClass)}')]`;
        }
    }
    if (['button', 'a', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(element.tagName.toLowerCase()) && element.textContent && element.textContent.trim().length < 50 && !element.children.length) {
        xpath += `[normalize-space()="${element.textContent.trim().replace(/"/g, "'")}"]`;
    }

    return {
      id: element.id || undefined,
      cssSelector: id || cssSelector,
      xpath: xpath,
      tagName: element.tagName.toLowerCase(),
    };
  };

  const handleMouseOver = useCallback((event: MouseEvent) => {
    // This function should only set up the timer for showing the icon.
    // It should not run if a popup is already open.
    if (!isElementSelectorActive || isElementContextPopupOpen) return;
    
    const target = event.target as HTMLElement;

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    if (overlayRef.current && overlayRef.current.contains(target)) {
        setInspectIconTarget(null); // Clear icon if hovering over overlay
        setHighlightedElementDetails(null);
        return;
    }
    if (!target || !target.tagName || target === document.body || target === document.documentElement) {
        setInspectIconTarget(null); // Clear icon if on body/html
        setHighlightedElementDetails(null);
        return;
    }
    
    // Clear previous icon target immediately to avoid flickering if mouse moves fast
    setInspectIconTarget(null);
    setHighlightedElementDetails({ element: target, info: generateElementInfo(target) }); // Set highlight immediately

    hoverTimerRef.current = setTimeout(() => {
      // After delay, confirm the target for the icon
      setInspectIconTarget(target);
    }, 500);
  }, [isElementSelectorActive, isElementContextPopupOpen]);

  const handleMouseOut = useCallback((event: MouseEvent) => {
    if (!isElementSelectorActive || isElementContextPopupOpen) return;
    
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    // Don't clear inspectIconTarget or highlightedElementDetails here immediately
    // to allow user to move mouse to the icon.
    // Icon will be cleared if another element is hovered or selector mode changes.
  }, [isElementSelectorActive, isElementContextPopupOpen]);


  const handleInspectIconClick = useCallback((event: React.MouseEvent, element: HTMLElement) => {
    event.stopPropagation();
    if (!highlightedElementDetails || highlightedElementDetails.element !== element) {
      // This case should ideally not happen if icon is tied to highlightedElementDetails
      const info = generateElementInfo(element);
      setHighlightedElementDetails({element, info});
      setCurrentPopupElementInfo(info);
    } else {
      setCurrentPopupElementInfo(highlightedElementDetails.info);
    }

    const iconRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const popupWidth = 384; // approx width of ElementHoverPopup (w-96)
    let left = iconRect.left + iconRect.width / 2 - popupWidth / 2;
    let top = iconRect.bottom + 10;

    // Adjust if popup goes off-screen
    if (left < 10) left = 10;
    if (left + popupWidth > window.innerWidth - 10) {
        left = window.innerWidth - popupWidth - 10;
    }
    if (top + 300 > window.innerHeight - 10) { // Assuming popup height ~300px
        top = iconRect.top - 300 - 10; // Position above icon
        if (top < 10) top = 10;
    }

    setPopupAnchorPosition({ top, left });
    setIsElementContextPopupOpen(true);
    setInspectIconTarget(null); // Hide the icon itself once popup is open
  }, [highlightedElementDetails]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isElementContextPopupOpen) {
          setIsElementContextPopupOpen(false);
          setCurrentPopupElementInfo(null);
          // Keep highlightedElementDetails so border remains until mouse moves or selector off
        } else if (isElementSelectorActive) {
          setIsElementSelectorActive(false);
          toast({ title: "Element Selector Deactivated", description: "Pressed ESC key."});
        }
      }
    };

    if (isElementSelectorActive) {
      document.addEventListener('keydown', handleKeyDown);
      if (!isElementContextPopupOpen) { // Only add mouse listeners if popup is NOT open
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
      } else { // Popup IS open, remove mouse listeners
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      }
    } else { // Selector not active
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('keydown', handleKeyDown);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      setHighlightedElementDetails(null);
      setInspectIconTarget(null);
      setIsElementContextPopupOpen(false);
      setCurrentPopupElementInfo(null);
    }

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('keydown', handleKeyDown);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [isElementSelectorActive, isElementContextPopupOpen, handleMouseOver, handleMouseOut, toast]);


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

  const handleToggleElementSelector = useCallback(() => {
    const newIsActive = !isElementSelectorActive;
    setIsElementSelectorActive(newIsActive);
    if (newIsActive) {
      setIsRecording(false); 
      setHighlightedElementDetails(null); 
      setInspectIconTarget(null);
      setIsElementContextPopupOpen(false);
      toast({
        title: "Element Selector Activated",
        description: "Hover over elements. Click target icon to inspect. Press ESC to deactivate.",
      });
    } else {
      toast({
        title: "Element Selector Deactivated",
        description: "Element inspection is off.",
      });
      setHighlightedElementDetails(null);
      setInspectIconTarget(null);
      setIsElementContextPopupOpen(false);
    }
  }, [isElementSelectorActive, toast]);

  const handleCommandSelected = useCallback((command: string, targetElementInfo: ElementInfoForPopup) => {
    const selector = targetElementInfo.id ? `#${CSS.escape(targetElementInfo.id)}` : targetElementInfo.cssSelector || 'N/A';
    const tagName = targetElementInfo.tagName || 'element';
    let newStep: Step | null = null;
    let toastMessage = "";

    switch (command) {
      case 'assertIsVisible':
        newStep = {
          id: String(Date.now()) + Math.random().toString(36).substring(2,7),
          type: 'assert', selector, description: `Assert ${tagName} (${selector}) is visible`,
          params: { assertionType: 'isVisible' },
        };
        toastMessage = `Assertion (Is Visible) for ${selector} added.`;
        break;
      case 'assertTextContentEquals':
        newStep = {
          id: String(Date.now()) + Math.random().toString(36).substring(2,7),
          type: 'assert', selector, description: `Assert text of ${tagName} (${selector}) equals...`,
          params: { assertionType: 'textContentEquals', expectedValue: '' }, 
        };
        toastMessage = `Assertion (Text Content) for ${selector} added. Edit to set expected value.`;
        break;
      case 'actionClick':
        newStep = {
          id: String(Date.now()) + Math.random().toString(36).substring(2,7),
          type: 'click', selector, description: `Click on ${tagName} (${selector})`,
        };
        toastMessage = `Click action for ${selector} added.`;
        break;
      case 'actionTypeText':
        newStep = {
          id: String(Date.now()) + Math.random().toString(36).substring(2,7),
          type: 'type', selector, value: '', description: `Type text in ${tagName} (${selector})`,
        };
        toastMessage = `Type action for ${selector} added. Edit to set text.`;
        break;
      case 'actionScrollIntoView':
        newStep = {
          id: String(Date.now()) + Math.random().toString(36).substring(2,7),
          type: 'scroll', selector, description: `Scroll ${tagName} (${selector}) into view`,
          params: { scrollType: 'intoView' }
        };
        toastMessage = `Scroll Into View action for ${selector} added.`;
        break;
      case 'waitForVisible':
        newStep = {
          id: String(Date.now()) + Math.random().toString(36).substring(2,7),
          type: 'assert', selector, description: `Wait for ${tagName} (${selector}) to be visible`,
          params: { waitType: 'isVisible', timeout: 5000 }, 
        };
        toastMessage = `Wait (For Visible) for ${selector} added.`;
        break;
      case 'waitForClickable':
        newStep = {
          id: String(Date.now()) + Math.random().toString(36).substring(2,7),
          type: 'assert', selector, description: `Wait for ${tagName} (${selector}) to be clickable`,
          params: { waitType: 'isClickable', timeout: 5000 },
        };
        toastMessage = `Wait (For Clickable) for ${selector} added.`;
        break;
    }

    if (newStep) {
      setRecordedSteps(prev => [...prev, newStep]);
      toast({ title: "Step Added", description: toastMessage });
    }
    setIsElementContextPopupOpen(false); // Close popup
    setCurrentPopupElementInfo(null);
    // Keep element selector active, but clear current highlight for next interaction.
    // User might want to inspect another element immediately.
    setHighlightedElementDetails(null); 
    setInspectIconTarget(null);
  }, [toast]);


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
  
  const closeElementContextPopup = useCallback(() => {
    setIsElementContextPopupOpen(false);
    setCurrentPopupElementInfo(null);
    // Optionally, clear highlight or keep it until next hover
    // setHighlightedElementDetails(null); 
    // setInspectIconTarget(null);
  }, []);

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
            {/* This button is now less relevant for element popup, can be removed or repurposed
            <Button variant="ghost" size="sm" onClick={() => setIsInspectorPanelVisible(prev => !prev)} className="text-xs">
              {isInspectorPanelVisible ? "Hide" : "Show"} Inspector
            </Button>
            */}
          </div>
          <div className="mt-4">
            <HeaderControls
              isRecording={isRecording}
              onToggleRecording={handleToggleRecording}
              onPlayAll={handlePlayAll}
              onSaveSession={handleSaveSession}
              stepCount={recordedSteps.length}
              isElementSelectorActive={isElementSelectorActive}
              onToggleElementSelector={handleToggleElementSelector}
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

      {/* Clickable Icon that appears on hover */}
      {isElementSelectorActive && inspectIconTarget && !isElementContextPopupOpen && (() => {
          const rect = inspectIconTarget.getBoundingClientRect();
          // Attempt to center the icon on the element, adjust as needed
          const iconSize = 32; // Assuming h-8 w-8 for the button
          let iconTop = rect.top + rect.height / 2 - iconSize / 2;
          let iconLeft = rect.left + rect.width / 2 - iconSize / 2;

          // Ensure icon stays within viewport bounds slightly
          iconTop = Math.max(8, Math.min(iconTop, window.innerHeight - iconSize - 8));
          iconLeft = Math.max(8, Math.min(iconLeft, window.innerWidth - iconSize - 8));
          
          return (
              <Button
                  variant="outline"
                  size="icon"
                  className="fixed h-8 w-8 bg-background shadow-lg rounded-full p-0 z-[10001] pointer-events-auto"
                  style={{
                      top: `${iconTop}px`,
                      left: `${iconLeft}px`,
                  }}
                  onClick={(e) => handleInspectIconClick(e, inspectIconTarget)}
                  title="Inspect Element"
              >
                  <TargetIcon className="h-4 w-4 text-primary" />
              </Button>
          );
      })()}
      
      <ElementHoverPopup 
        elementInfo={currentPopupElementInfo} 
        isOpen={isElementContextPopupOpen && !!currentPopupElementInfo} 
        onCommandSelected={handleCommandSelected}
        position={popupAnchorPosition}
        onClose={closeElementContextPopup}
      />
      <HighlightOverlay targetElement={isElementSelectorActive ? (highlightedElementDetails?.element ?? null) : null} />
    </div>
  );
}
