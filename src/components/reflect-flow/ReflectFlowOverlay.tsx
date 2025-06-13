
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Step, NavigateStep, ClickStep, TypeStep, ScrollStep, WaitForElementStep, KeyDownStep, KeyUpStep, DoubleClickStep, MoveToStep } from '@/types';
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

const PANEL_WIDTH_EXPANDED = 400;
const PANEL_WIDTH_COLLAPSED = 160; 
const PANEL_MIN_LEFT = 16;
const PANEL_MIN_TOP = 16;


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
    cssSelector: id || cssSelector, 
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
  const [inspectIconTarget, setInspectIconTarget] = useState<HTMLElement | null>(null);
  
  const [isElementContextMenuOpen, setIsElementContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [currentContextMenuElementInfo, setCurrentContextMenuElementInfo] = useState<ElementInfoForPopup | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelCardRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{ top: number; left: number }>({ top: PANEL_MIN_TOP, left: -9999 }); // Initialize off-screen
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartOffset, setDragStartOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Refs for drag handlers to ensure they use the latest state
  const isDraggingRef = useRef(isDragging);
  useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
  const dragStartOffsetRef = useRef(dragStartOffset);
  useEffect(() => { dragStartOffsetRef.current = dragStartOffset; }, [dragStartOffset]);
  const currentPanelPositionRef = useRef(panelPosition);
  useEffect(() => { currentPanelPositionRef.current = panelPosition; }, [panelPosition]);


  useEffect(() => {
    // Only set initial position if it's the first render (left is -9999)
    if (panelPosition.left === -9999) {
      const initialWidth = isPanelCollapsed ? PANEL_WIDTH_COLLAPSED : PANEL_WIDTH_EXPANDED;
      setPanelPosition({
        top: PANEL_MIN_TOP,
        left: Math.max(PANEL_MIN_LEFT, window.innerWidth - initialWidth - PANEL_MIN_LEFT),
      });
    }
  }, [isPanelCollapsed, panelPosition.left]); 


  const handleTogglePanelCollapse = useCallback(() => {
    setIsPanelCollapsed(prevCollapsed => {
        const newCollapsed = !prevCollapsed;
        const oldWidth = newCollapsed ? PANEL_WIDTH_EXPANDED : PANEL_WIDTH_COLLAPSED;
        const newWidth = newCollapsed ? PANEL_WIDTH_COLLAPSED : PANEL_WIDTH_EXPANDED;

        setPanelPosition(currentPos => {
            let newLeft = currentPos.left;
            // If the panel's right edge was near the window's right edge, adjust to keep it there
            if (currentPos.left + oldWidth >= window.innerWidth - PANEL_MIN_LEFT - 20) { // 20 is a small buffer
                newLeft = window.innerWidth - newWidth - PANEL_MIN_LEFT;
            }
            newLeft = Math.max(PANEL_MIN_LEFT, newLeft); // Ensure it doesn't go off left screen
            // If adjusted newLeft makes it go off right screen, pin it to the right.
            if (newLeft + newWidth + PANEL_MIN_LEFT > window.innerWidth) {
                newLeft = window.innerWidth - newWidth - PANEL_MIN_LEFT;
            }
            return { ...currentPos, left: newLeft };
        });
        return newCollapsed;
    });
  }, []);

  const handleMouseMoveDraggable = useCallback((event: MouseEvent) => {
    if (!isDraggingRef.current) return;
    event.preventDefault();

    let newTop = event.clientY - dragStartOffsetRef.current.y;
    let newLeft = event.clientX - dragStartOffsetRef.current.x;

    const panelWidth = panelCardRef.current?.offsetWidth || (isPanelCollapsed ? PANEL_WIDTH_COLLAPSED : PANEL_WIDTH_EXPANDED);
    const panelHeight = panelCardRef.current?.offsetHeight || window.innerHeight; 

    newTop = Math.max(PANEL_MIN_TOP, Math.min(newTop, window.innerHeight - panelHeight - PANEL_MIN_TOP));
    newLeft = Math.max(PANEL_MIN_LEFT, Math.min(newLeft, window.innerWidth - panelWidth - PANEL_MIN_LEFT));
    
    setPanelPosition({ top: newTop, left: newLeft });
  }, [isPanelCollapsed]); 

  const handleMouseUpDraggable = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMoveDraggable);
    document.removeEventListener('mouseup', handleMouseUpDraggable);
  }, [handleMouseMoveDraggable]);

  const handleMouseDownDraggable = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, input, [role="button"], [role="menuitem"]')) {
        return;
    }
    event.preventDefault();
    setIsDragging(true);
    setDragStartOffset({
        x: event.clientX - currentPanelPositionRef.current.left,
        y: event.clientY - currentPanelPositionRef.current.top,
    });
    document.addEventListener('mousemove', handleMouseMoveDraggable);
    document.addEventListener('mouseup', handleMouseUpDraggable);
  }, [handleMouseMoveDraggable, handleMouseUpDraggable]);


  const handleToggleRecording = useCallback(() => {
    const newIsRecording = !isRecording;
    setIsRecording(newIsRecording);
    if (newIsRecording) {
      setIsElementSelectorActive(false); 
      setIsElementContextMenuOpen(false);
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

  const recordClick = useCallback((event: MouseEvent) => {
    if (isElementSelectorActive || !isRecording || isElementContextMenuOpen) return;

    if (panelCardRef.current && panelCardRef.current.contains(event.target as Node)) {
      return;
    }
    
    const target = event.target as HTMLElement;
    if (!target || !target.tagName || target === document.body || target === document.documentElement) {
      return;
    }

    const elementInfo = generateElementInfo(target);
    const primarySelector = elementInfo.id || elementInfo.cssSelector || elementInfo.xpath || 'N/A';
    const selectors: string[] = [];
    if (elementInfo.id) selectors.push(elementInfo.id);
    if (elementInfo.cssSelector && elementInfo.cssSelector !== elementInfo.id) selectors.push(elementInfo.cssSelector);
    if (elementInfo.xpath && !selectors.includes(elementInfo.xpath)) selectors.push(elementInfo.xpath);
    if (selectors.length === 0) selectors.push(elementInfo.tagName || 'unknown');


    const description = `Click on ${elementInfo.tagName}${primarySelector !== elementInfo.tagName ? ` (${primarySelector})` : ''}`;

    const newStep: ClickStep = {
      id: String(Date.now()) + Math.random().toString(36).substring(2,7),
      type: 'click',
      selector: primarySelector, // Still useful for quick display
      selectors: selectors, // Store all generated selectors
      description: description,
    };

    setRecordedSteps(prevSteps => [...prevSteps, newStep]);
    toast({ title: "Action Recorded", description: `Recorded: ${newStep.description}` });
  }, [toast, isElementSelectorActive, isRecording, isElementContextMenuOpen]);

  useEffect(() => {
    if (isRecording && !isElementSelectorActive && !isElementContextMenuOpen) {
      document.addEventListener('click', recordClick, true); 
    } else {
      document.removeEventListener('click', recordClick, true);
    }
    return () => {
      document.removeEventListener('click', recordClick, true);
    };
  }, [isRecording, recordClick, isElementSelectorActive, isElementContextMenuOpen]);


  const handleMouseOver = useCallback((event: MouseEvent) => {
    if (!isElementSelectorActive || isElementContextMenuOpen || isDraggingRef.current) return;
    const target = event.target as HTMLElement;

    if (target.matches('[data-reflectflow-icon="true"]')) {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      return;
    }
    
    if (panelCardRef.current && panelCardRef.current.contains(target)) {
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
  }, [isElementSelectorActive, isElementContextMenuOpen]); 

  const handleMouseOut = useCallback(() => {
    if (!isElementSelectorActive || isElementContextMenuOpen || isDraggingRef.current) return;
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, [isElementSelectorActive, isElementContextMenuOpen]);


  const handleInspectIconClick = useCallback((event: React.MouseEvent, pageElement: HTMLElement) => {
    event.stopPropagation(); 
    const elementInfoForMenu = highlightedElementDetails && highlightedElementDetails.element === pageElement
      ? highlightedElementDetails.info
      : generateElementInfo(pageElement);

    setCurrentContextMenuElementInfo(elementInfoForMenu);
    const iconRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenuPosition({ top: iconRect.bottom + 5, left: iconRect.left });
    setIsElementContextMenuOpen(true);
    setInspectIconTarget(null); 
    setHighlightedElementDetails(null); 
  }, [highlightedElementDetails]);

  const closeElementContextMenu = useCallback(() => {
    setIsElementContextMenuOpen(false);
    setCurrentContextMenuElementInfo(null);
    setHighlightedElementDetails(null); 
    setInspectIconTarget(null); 
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isElementContextMenuOpen) {
          closeElementContextMenu();
        } else if (isElementSelectorActive) {
          setIsElementSelectorActive(false); 
          toast({ title: "Element Selector Deactivated", description: "Pressed ESC key."});
        }
      }
    };

    if (isElementSelectorActive) {
      document.addEventListener('keydown', handleKeyDown);
      if (!isElementContextMenuOpen) { 
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
      setIsElementContextMenuOpen(false); 
      setCurrentContextMenuElementInfo(null);
    }

    return () => { 
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('keydown', handleKeyDown);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [isElementSelectorActive, isElementContextMenuOpen, handleMouseOver, handleMouseOut, toast, closeElementContextMenu]);


  const handlePlaySelected = useCallback(() => {
    if (selectedSteps.length === 0) {
      toast({ title: "No steps selected", description: "Please select steps to play.", variant: "destructive" });
      return;
    }
    toast({ title: "Playing Selected Steps (Simulated)", description: `Actual playback logic for ${selectedSteps.length} step(s) not yet implemented.` });
    console.log("Simulating playback of steps:", selectedSteps.map(id => recordedSteps.find(s => s.id === id)));
  }, [selectedSteps, recordedSteps, toast]);

  const handleToggleElementSelector = useCallback(() => {
    const newIsActive = !isElementSelectorActive;
    setIsElementSelectorActive(newIsActive);
    if (newIsActive) {
      setIsRecording(false); 
      setHighlightedElementDetails(null);
      setInspectIconTarget(null);
      setIsElementContextMenuOpen(false); 
      toast({
        title: "Element Selector Activated",
        description: "Hover over elements. Click target icon to open actions. Press ESC to deactivate.",
      });
    } else {
      setHighlightedElementDetails(null);
      setInspectIconTarget(null);
      setIsElementContextMenuOpen(false);
      setCurrentContextMenuElementInfo(null);
      toast({
        title: "Element Selector Deactivated",
        description: "Element inspection is off.",
      });
    }
  }, [isElementSelectorActive, toast]);

  const handleCommandSelected = useCallback((command: string, targetElementInfo: ElementInfoForPopup) => {
    // Generate all available selectors from the target element info
    const allSelectors: string[] = [];
    if (targetElementInfo.id) allSelectors.push(targetElementInfo.id);
    if (targetElementInfo.cssSelector && targetElementInfo.cssSelector !== targetElementInfo.id) {
        allSelectors.push(targetElementInfo.cssSelector);
    }
    if (targetElementInfo.xpath && !allSelectors.includes(targetElementInfo.xpath)) {
        allSelectors.push(targetElementInfo.xpath);
    }
    // Fallback if no specific selectors found
    if (allSelectors.length === 0 && targetElementInfo.tagName) {
        allSelectors.push(targetElementInfo.tagName);
    } else if (allSelectors.length === 0) {
        allSelectors.push('N/A');
    }
    
    // Use the first selector as the primary display selector, or 'N/A'
    const primarySelector = allSelectors[0];
    
    const tagName = targetElementInfo.tagName || 'element';
    let newStep: Step | null = null;
    let toastMessage = "";
    const baseId = String(Date.now()) + Math.random().toString(36).substring(2,7);

    const defaultTimeout = 5000;
    const defaultTarget = 'main';

    switch (command) {
      case 'actionClick':
        newStep = { id: baseId, type: 'click', selectors: allSelectors, selector: primarySelector, description: `Click ${tagName} (${primarySelector})`, target: defaultTarget, timeout:defaultTimeout } as ClickStep;
        toastMessage = `Click action for ${primarySelector} added.`;
        break;
      case 'actionDoubleClick':
        newStep = { id: baseId, type: 'doubleClick', selectors: allSelectors, selector: primarySelector, description: `Double Click ${tagName} (${primarySelector})`, target: defaultTarget, timeout: defaultTimeout } as DoubleClickStep;
        toastMessage = `Double Click action for ${primarySelector} added.`;
        break;
      case 'actionSetValue': 
        newStep = { id: baseId, type: 'type', value: '', selectors: allSelectors, selector: primarySelector, description: `Set Value in ${tagName} (${primarySelector})`, target: defaultTarget, timeout: defaultTimeout } as TypeStep;
        toastMessage = `Set Value (type) action for ${primarySelector} added. Edit to set text.`;
        break;
      case 'actionAddValue': 
        newStep = { id: baseId, type: 'type', value: '', selectors: allSelectors, selector: primarySelector, description: `Add Value to ${tagName} (${primarySelector})`, target: defaultTarget, timeout: defaultTimeout } as TypeStep; // Differentiate via description or future param
        toastMessage = `Add Value (type) action for ${primarySelector} added. Edit to set text.`;
        break;
      case 'actionClearValue': 
        newStep = { id: baseId, type: 'type', value: '', selectors: allSelectors, selector: primarySelector, description: `Clear Value of ${tagName} (${primarySelector})`, target: defaultTarget, timeout: defaultTimeout } as TypeStep;
        toastMessage = `Clear Value action for ${primarySelector} added.`;
        break;
      case 'actionScrollIntoView':
        newStep = { id: baseId, type: 'scroll', selectors: allSelectors, selector: primarySelector, description: `Scroll ${tagName} (${primarySelector}) into view`, target: defaultTarget, timeout: defaultTimeout } as ScrollStep;
        toastMessage = `Scroll Into View action for ${primarySelector} added.`;
        break;
      case 'actionMoveTo':
        newStep = { id: baseId, type: 'moveTo', selectors: allSelectors, selector: primarySelector, description: `Move to ${tagName} (${primarySelector})`, target: defaultTarget, timeout: defaultTimeout } as MoveToStep;
        toastMessage = `Move To action for ${primarySelector} added.`;
        break;

      case 'assertIsVisible':
        newStep = { id: baseId, type: 'waitForElement', selectors: allSelectors, selector: primarySelector, description: `Assert ${tagName} (${primarySelector}) is visible`, property: 'visible', expectedValue: true, operator: '==', target: defaultTarget, timeout: defaultTimeout } as WaitForElementStep;
        toastMessage = `Assertion (Is Visible) for ${primarySelector} added.`;
        break;
      case 'assertGetText':
        newStep = { id: baseId, type: 'waitForElement', selectors: allSelectors, selector: primarySelector, description: `Assert text of ${tagName} (${primarySelector})`, property: 'textContent', expectedValue: '', operator: '==', target: defaultTarget, timeout: defaultTimeout } as WaitForElementStep;
        toastMessage = `Assertion (Get Text) for ${primarySelector} added. Edit expected value.`;
        break;
      case 'assertGetAttribute':
        newStep = { id: baseId, type: 'waitForElement', selectors: allSelectors, selector: primarySelector, description: `Assert attribute of ${tagName} (${primarySelector})`, property: 'attribute:your-attribute-name', expectedValue: '', operator: '==', target: defaultTarget, timeout: defaultTimeout } as WaitForElementStep;
        toastMessage = `Assertion (Get Attribute) for ${primarySelector} added. Edit attribute name and value.`;
        break;
      case 'assertIsEnabled':
        newStep = { id: baseId, type: 'waitForElement', selectors: allSelectors, selector: primarySelector, description: `Assert ${tagName} (${primarySelector}) is enabled`, property: 'enabled', expectedValue: true, operator: '==', target: defaultTarget, timeout: defaultTimeout } as WaitForElementStep;
        toastMessage = `Assertion (Is Enabled) for ${primarySelector} added.`;
        break;
      case 'assertIsExisting':
        newStep = { id: baseId, type: 'waitForElement', selectors: allSelectors, selector: primarySelector, description: `Assert ${tagName} (${primarySelector}) exists`, property: 'existing', expectedValue: true, operator: 'exists', target: defaultTarget, timeout: defaultTimeout } as WaitForElementStep;
        toastMessage = `Assertion (Is Existing) for ${primarySelector} added.`;
        break;
      case 'assertGetSize': 
         newStep = { id: baseId, type: 'waitForElement', selectors: allSelectors, selector: primarySelector, description: `Assert size of ${tagName} (${primarySelector})`, property: 'size.width', expectedValue: 0, operator: '==', target: defaultTarget, timeout: defaultTimeout } as WaitForElementStep;
        toastMessage = `Assertion (Get Size - width) for ${primarySelector} added. Edit expected value / add height.`;
        break;
      case 'assertGetLocation':
        newStep = { id: baseId, type: 'waitForElement', selectors: allSelectors, selector: primarySelector, description: `Assert location of ${tagName} (${primarySelector})`, property: 'location.x', expectedValue: 0, operator: '==', target: defaultTarget, timeout: defaultTimeout } as WaitForElementStep;
        toastMessage = `Assertion (Get Location - x) for ${primarySelector} added. Edit expected value / add y.`;
        break;
        
      case 'waitForVisible':
        newStep = { id: baseId, type: 'waitForElement', selectors: allSelectors, selector: primarySelector, description: `Wait for ${tagName} (${primarySelector}) to be visible`, property: 'visible', expectedValue: true, operator: '==', target: defaultTarget, timeout: defaultTimeout } as WaitForElementStep;
        toastMessage = `Wait (For Visible) for ${primarySelector} added.`;
        break;
      case 'waitForClickable':
        newStep = { id: baseId, type: 'waitForElement', selectors: allSelectors, selector: primarySelector, description: `Wait for ${tagName} (${primarySelector}) to be clickable`, property: 'clickable', expectedValue: true, operator: 'clickable', target: defaultTarget, timeout: defaultTimeout } as WaitForElementStep;
        toastMessage = `Wait (For Clickable) for ${primarySelector} added.`;
        break;
      case 'waitForEnabled':
        newStep = { id: baseId, type: 'waitForElement', selectors: allSelectors, selector: primarySelector, description: `Wait for ${tagName} (${primarySelector}) to be enabled`, property: 'enabled', expectedValue: true, operator: '==', target: defaultTarget, timeout: defaultTimeout } as WaitForElementStep;
        toastMessage = `Wait (For Enabled) for ${primarySelector} added.`;
        break;
      case 'waitForExist':
        newStep = { id: baseId, type: 'waitForElement', selectors: allSelectors, selector: primarySelector, description: `Wait for ${tagName} (${primarySelector}) to exist`, property: 'existing', expectedValue: true, operator: 'exists', target: defaultTarget, timeout: defaultTimeout } as WaitForElementStep;
        toastMessage = `Wait (For Exist) for ${primarySelector} added.`;
        break;
      case 'waitForStable':
         newStep = { id: baseId, type: 'waitForElement', selectors: allSelectors, selector: primarySelector, description: `Wait for ${tagName} (${primarySelector}) to be stable`, property: 'stable', expectedValue: true, operator: 'stable', target: defaultTarget, timeout: defaultTimeout } as WaitForElementStep;
        toastMessage = `Wait (For Stable) for ${primarySelector} added.`;
        break;
      default:
        toastMessage = `Unknown command: ${command}`;
        console.warn(toastMessage);
        break;
    }

    if (newStep) {
      setRecordedSteps(prev => [...prev, newStep]);
      toast({ title: "Step Added", description: toastMessage });
    }
    closeElementContextMenu(); 
  }, [toast, closeElementContextMenu]);


  const handleSaveSession = useCallback(() => {
    const sessionToSave = {
      title: "My Recorded Session",
      description: "A recording of user interactions.",
      url: window.location.href, 
      steps: recordedSteps,
      device_screen_emulation: { 
        width: window.innerWidth,
        height: window.innerHeight,
        deviceScaleFactor: window.devicePixelRatio,
        mobile: /Mobi|Android/i.test(navigator.userAgent),
        userAgent: navigator.userAgent,
      }
    };
    console.log("Saving session (simulated):", JSON.stringify(sessionToSave, null, 2));
    toast({ title: "Session Saved (Simulated)", description: "Session data logged to console. Actual saving logic not yet implemented." });
  }, [toast, recordedSteps]);

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

  const panelWidthClass = isPanelCollapsed ? `w-[${PANEL_WIDTH_COLLAPSED}px]` : `w-[${PANEL_WIDTH_EXPANDED}px]`;

  if (panelPosition.left === -9999) {
    return null; 
  }

  return (
    <div 
      ref={overlayRef} 
      className="fixed z-[10000] pointer-events-none" 
      style={{ 
        top: `${panelPosition.top}px`, 
        left: `${panelPosition.left}px`,
      }}
    >
      <Card 
        ref={panelCardRef}
        className={`h-full max-h-[calc(100vh-32px)] flex flex-col shadow-2xl pointer-events-auto overflow-hidden bg-card/90 backdrop-blur-sm transition-[width] duration-300 ease-in-out ${panelWidthClass}`}
      >
        <CardHeader 
          className="p-4 border-b cursor-grab" 
          onMouseDown={handleMouseDownDraggable} 
        >
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
          </>
        )}
      </Card>

      {isElementSelectorActive && inspectIconTarget && !isElementContextMenuOpen && !isDragging && (() => {
          const rect = inspectIconTarget.getBoundingClientRect();
          const iconSize = 32; 
          let iconTop = rect.top + rect.height / 2 - iconSize / 2;
          let iconLeft = rect.left + rect.width / 2 - iconSize / 2;

          iconTop = Math.max(8, Math.min(iconTop, window.innerHeight - iconSize - 8));
          iconLeft = Math.max(8, Math.min(iconLeft, window.innerWidth - iconSize - 8));
          
          return (
              <Button
                  data-reflectflow-icon="true" 
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
        elementInfo={currentContextMenuElementInfo}
        isOpen={isElementContextMenuOpen && !!currentContextMenuElementInfo && !isDragging} 
        onCommandSelected={handleCommandSelected}
        position={contextMenuPosition}
        onClose={closeElementContextMenu}
      />
      
      <HighlightOverlay targetElement={isElementSelectorActive && !isDragging ? (highlightedElementDetails?.element ?? null) : null} />
    </div>
  );
}

