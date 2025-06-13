
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

// Helper function, can be outside the component or memoized if complex
const generateElementInfo = (element: HTMLElement): ElementInfoForPopup => {
  let id = element.id ? `#${CSS.escape(element.id)}` : undefined;
  let cssSelector = `${element.tagName.toLowerCase()}`;
  if (element.classList.length > 0) {
    const significantClasses = Array.from(element.classList)
      .filter(c => c.trim() !== '' && !/^(bg-|text-|border-|p-|m-|flex|grid|item|justify|self-|gap-|rounded|shadow-|w-|h-)/.test(c))
      .map(c => CSS.escape(c));
    if (significantClasses.length > 0) {
      cssSelector += `.${significantClasses.join('.')}`;
    } else {
      // Fallback to first class if no "significant" ones found
      const firstClass = Array.from(element.classList).find(c => c.trim() !== '');
      if (firstClass) {
        cssSelector += `.${CSS.escape(firstClass)}`;
      }
    }
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
  if (['button', 'a', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'].includes(element.tagName.toLowerCase()) && element.textContent && element.textContent.trim().length > 0 && element.textContent.trim().length < 50 && !element.children.length) {
      xpath += `[normalize-space()="${element.textContent.trim().replace(/"/g, "'")}"]`;
  } else if (element.getAttribute('aria-label')) {
    xpath += `[@aria-label="${element.getAttribute('aria-label')?.replace(/"/g, "'")}"]`;
  }


  return {
    id: element.id || undefined,
    cssSelector: id || cssSelector, // Prefer ID if available for cssSelector field too
    xpath: xpath,
    tagName: element.tagName.toLowerCase(),
  };
};


export function ReflectFlowOverlay() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<Step[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [isElementSelectorActive, setIsElementSelectorActive] = useState(false);
  
  const [highlightedElementDetails, setHighlightedElementDetails] = useState<ElementDetails | null>(null);
  const [inspectIconTarget, setInspectIconTarget] = useState<HTMLElement | null>(null); // This is the page element for which the icon is shown
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
    
    const elementInfo = generateElementInfo(target);
    const selector = elementInfo.id ? `#${CSS.escape(elementInfo.id)}` : elementInfo.cssSelector || 'N/A';
    const description = `Click on ${elementInfo.tagName}${selector !== elementInfo.tagName ? ` (${selector})` : ''}`;


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


  const handleMouseOver = useCallback((event: MouseEvent) => {
    if (!isElementSelectorActive || isElementContextPopupOpen) return;
    
    const target = event.target as HTMLElement;

    if (target.matches('[data-reflectflow-icon="true"]')) {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      return;
    }

    if (overlayRef.current && overlayRef.current.contains(target)) {
        setInspectIconTarget(null);
        setHighlightedElementDetails(null);
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        return;
    }
    if (!target || !target.tagName || target === document.body || target === document.documentElement) {
        setInspectIconTarget(null);
        setHighlightedElementDetails(null);
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        return;
    }
    
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = setTimeout(() => {
      setHighlightedElementDetails({ element: target, info: generateElementInfo(target) });
      setInspectIconTarget(target);
    }, 500);
  }, [isElementSelectorActive, isElementContextPopupOpen]);

  const handleMouseOut = useCallback((event: MouseEvent) => {
    if (!isElementSelectorActive || isElementContextPopupOpen) return;
    
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    // Do not clear highlight/icon here; they persist until next valid hover, mode change, or popup interaction.
  }, [isElementSelectorActive, isElementContextPopupOpen]);


  const handleInspectIconClick = useCallback((event: React.MouseEvent, pageElement: HTMLElement) => {
    event.stopPropagation(); // Prevent click from bubbling further
    
    const elementInfoForPopup = highlightedElementDetails && highlightedElementDetails.element === pageElement 
      ? highlightedElementDetails.info 
      : generateElementInfo(pageElement);

    setCurrentPopupElementInfo(elementInfoForPopup);
    
    const iconRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const popupWidth = 384; // approx width of ElementHoverPopup (w-96)
    const popupHeight = 350; // approx height of popup

    let left = iconRect.left + iconRect.width / 2 - popupWidth / 2;
    let top = iconRect.bottom + 10; // Default below icon

    // Adjust if popup goes off-screen horizontally
    if (left < 10) left = 10;
    if (left + popupWidth > window.innerWidth - 10) {
        left = window.innerWidth - popupWidth - 10;
    }
    // Adjust if popup goes off-screen vertically
    if (top + popupHeight > window.innerHeight - 10) { // If not enough space below
        top = iconRect.top - popupHeight - 10; // Try above icon
    }
    if (top < 10) { // If still not enough space (or not enough above)
        top = Math.max(10, window.innerHeight - popupHeight - 10); // Stick to bottom edge or top if very tall screen
    }


    setPopupAnchorPosition({ top, left });
    setIsElementContextPopupOpen(true);
    setInspectIconTarget(null); // Hide the icon itself once popup is open, highlight remains
  }, [highlightedElementDetails]);

  const closeElementContextPopup = useCallback(() => {
    setIsElementContextPopupOpen(false);
    setCurrentPopupElementInfo(null);
    setHighlightedElementDetails(null); 
    setInspectIconTarget(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isElementContextPopupOpen) {
          closeElementContextPopup();
        } else if (isElementSelectorActive) {
          setIsElementSelectorActive(false); // This will trigger the cleanup in the else block below
          toast({ title: "Element Selector Deactivated", description: "Pressed ESC key."});
        }
      }
    };

    if (isElementSelectorActive) {
      document.addEventListener('keydown', handleKeyDown);
      if (!isElementContextPopupOpen) {
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
      } else { 
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      }
    } else { 
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
  }, [isElementSelectorActive, isElementContextPopupOpen, handleMouseOver, handleMouseOut, toast, closeElementContextPopup]);


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
      // State clearing for deactivation is handled in the useEffect
    }
  }, [isElementSelectorActive, toast]);

  const handleCommandSelected = useCallback((command: string, targetElementInfo: ElementInfoForPopup) => {
    const selector = targetElementInfo.id ? `#${CSS.escape(targetElementInfo.id)}` : targetElementInfo.cssSelector || targetElementInfo.xpath || 'N/A';
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
          type: 'assert', selector, description: `Wait for ${tagName} (${selector}) to be visible`, // Using 'assert' type for waits for now
          params: { waitType: 'isVisible', timeout: 5000 }, 
        };
        toastMessage = `Wait (For Visible) for ${selector} added.`;
        break;
      case 'waitForClickable':
        newStep = {
          id: String(Date.now()) + Math.random().toString(36).substring(2,7),
          type: 'assert', selector, description: `Wait for ${tagName} (${selector}) to be clickable`, // Using 'assert' type for waits for now
          params: { waitType: 'isClickable', timeout: 5000 },
        };
        toastMessage = `Wait (For Clickable) for ${selector} added.`;
        break;
    }

    if (newStep) {
      setRecordedSteps(prev => [...prev, newStep]);
      toast({ title: "Step Added", description: toastMessage });
    }
    
    // Close popup and clear inspection state, ready for next element or deactivation
    closeElementContextPopup();

  }, [toast, closeElementContextPopup]);


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

      {isElementSelectorActive && inspectIconTarget && !isElementContextPopupOpen && (() => {
          const rect = inspectIconTarget.getBoundingClientRect();
          const iconSize = 32; 
          let iconTop = rect.top + rect.height / 2 - iconSize / 2;
          let iconLeft = rect.left + rect.width / 2 - iconSize / 2;

          iconTop = Math.max(8, Math.min(iconTop, window.innerHeight - iconSize - 8));
          iconLeft = Math.max(8, Math.min(iconLeft, window.innerWidth - iconSize - 8));
          
          return (
              <Button
                  data-reflectflow-icon="true" // Attribute to identify the icon
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

