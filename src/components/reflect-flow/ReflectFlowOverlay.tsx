
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Step, UndeterminedStep, RecordingSession, ElementInfoForPopup, ClickStep } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeaderControls } from './HeaderControls';
import { StepList } from './StepList';
import { ElementHoverPopup } from './ElementHoverPopup';
import { HighlightOverlay } from './HighlightOverlay';
import { useToast } from '@/hooks/use-toast';
import { FileIcon, TargetIcon, AddIcon } from './icons';
import { CommandInfo, findCommandByKey, availableCommands } from '@/lib/commands';
import { arrayMove } from '@dnd-kit/sortable';


interface ElementDetails {
  element: HTMLElement;
  info: ElementInfoForPopup;
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
  const [isMounted, setIsMounted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<Step[]>([]);
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
  const [panelPosition, setPanelPosition] = useState<{ top: number; left: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartOffset, setDragStartOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [newlyAddedStepId, setNewlyAddedStepId] = useState<string | null>(null);

  const isDraggingRef = useRef(isDragging);
  useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
  const dragStartOffsetRef = useRef(dragStartOffset);
  useEffect(() => { dragStartOffsetRef.current = dragStartOffset; }, [dragStartOffset]);
  
  const currentPanelPositionRef = useRef(panelPosition);
  useEffect(() => { currentPanelPositionRef.current = panelPosition; }, [panelPosition]);

  const [focusedElementInfo, setFocusedElementInfo] = useState<{element: HTMLElement, initialValue: string} | null>(null);
  const previousUrlRef = useRef<string>(typeof window !== 'undefined' ? window.location.href : '');


  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const initialWidth = isPanelCollapsed ? PANEL_WIDTH_COLLAPSED : PANEL_WIDTH_EXPANDED;
    setPanelPosition({
      top: PANEL_MIN_TOP,
      left: Math.max(PANEL_MIN_LEFT, window.innerWidth - initialWidth - PANEL_MIN_LEFT),
    });
  }, [isMounted, isPanelCollapsed]);


  const handleTogglePanelCollapse = useCallback(() => {
    setIsPanelCollapsed(prevCollapsed => {
        const newCollapsed = !prevCollapsed;
        const oldWidth = newCollapsed ? PANEL_WIDTH_EXPANDED : PANEL_WIDTH_COLLAPSED;
        const newWidth = newCollapsed ? PANEL_WIDTH_COLLAPSED : PANEL_WIDTH_EXPANDED;

        setPanelPosition(currentPos => {
            if (!currentPos) return null; // Should not happen if mounted
            let newLeft = currentPos.left;
            if (typeof window !== 'undefined') {
                if (currentPos.left + oldWidth >= window.innerWidth - PANEL_MIN_LEFT - 20) {
                    newLeft = window.innerWidth - newWidth - PANEL_MIN_LEFT;
                }
                newLeft = Math.max(PANEL_MIN_LEFT, newLeft);
                if (newLeft + newWidth + PANEL_MIN_LEFT > window.innerWidth) {
                    newLeft = window.innerWidth - newWidth - PANEL_MIN_LEFT;
                }
            }
            return { ...currentPos, left: newLeft };
        });
        return newCollapsed;
    });
  }, []);

  const handleMouseMoveDraggable = useCallback((event: MouseEvent) => {
    if (!isDraggingRef.current || !currentPanelPositionRef.current) return;
    event.preventDefault();

    let newTop = event.clientY - dragStartOffsetRef.current.y;
    let newLeft = event.clientX - dragStartOffsetRef.current.x;

    const panelWidth = panelCardRef.current?.offsetWidth || (isPanelCollapsed ? PANEL_WIDTH_COLLAPSED : PANEL_WIDTH_EXPANDED);
    const panelHeight = panelCardRef.current?.offsetHeight || (typeof window !== 'undefined' ? window.innerHeight : 600);


    if (typeof window !== 'undefined') {
        newTop = Math.max(PANEL_MIN_TOP, Math.min(newTop, window.innerHeight - panelHeight - PANEL_MIN_TOP));
        newLeft = Math.max(PANEL_MIN_LEFT, Math.min(newLeft, window.innerWidth - panelWidth - PANEL_MIN_LEFT));
    }


    setPanelPosition({ top: newTop, left: newLeft });
  }, [isPanelCollapsed]);

  const handleMouseUpDraggable = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMoveDraggable);
    document.removeEventListener('mouseup', handleMouseUpDraggable);
  }, [handleMouseMoveDraggable]);

  const handleMouseDownDraggable = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, input, [role="button"], [role="menuitem"], [role="option"], [data-command-input="true"], [data-command-item="true"], textarea, [aria-label~="Drag"]')) {
        return;
    }
    if (!currentPanelPositionRef.current) return; // Guard against null position

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
      if (typeof window !== 'undefined') {
        previousUrlRef.current = window.location.href;
      }
      toast({
        title: "Recording Started",
        description: "Capturing interactions. Perform actions on the page.",
      });
    } else {
      toast({
        title: "Recording Paused",
        description: "Interaction recording is now paused.",
      });
    }
  }, [isRecording, toast]);

  const addNewStep = useCallback((commandKey: string, targetElement: HTMLElement | null, params: Omit<Step, 'id' | 'type' | 'commandKey' | 'badgeLabel' | 'description' | 'target' | 'timeout'> & Record<string, any>) => {
    const commandInfo = findCommandByKey(commandKey);
    if (!commandInfo) {
        toast({ title: "Internal Error", description: `Unknown command key: ${commandKey}`, variant: "destructive" });
        return;
    }

    let currentSelectors: string[] = [''];
    let currentSelector: string = '';

    if (targetElement && commandInfo.isElementCommand) {
        const elementInfo = generateElementInfo(targetElement);
        const selectors: string[] = [];
        if (elementInfo.id) selectors.push(elementInfo.id);
        if (elementInfo.cssSelector && elementInfo.cssSelector !== elementInfo.id) selectors.push(elementInfo.cssSelector);
        if (elementInfo.xpath && !selectors.includes(elementInfo.xpath)) selectors.push(elementInfo.xpath);
        if (selectors.length === 0 && elementInfo.tagName) selectors.push(elementInfo.tagName);
        else if (selectors.length === 0) selectors.push('unknown');
        currentSelectors = selectors;
        currentSelector = selectors[0] || 'N/A';
    }


    const newStep: Step = {
        id: String(Date.now()) + Math.random().toString(36).substring(2,7),
        type: commandInfo.mapsToStepType,
        commandKey: commandInfo.key,
        badgeLabel: commandInfo.badgeLabel,
        description: commandInfo.description,
        selectors: commandInfo.isElementCommand ? currentSelectors : undefined,
        selector: commandInfo.isElementCommand ? currentSelector : undefined,
        target: 'main', 
        timeout: 5000,
        ...(commandInfo.defaultParams || {}),
        ...params, 
    } as Step; 


    setRecordedSteps(prevSteps => [...prevSteps, newStep]);
    let toastDesc = `Recorded: ${commandInfo.badgeLabel}`;
    if (commandInfo.isElementCommand && currentSelector && currentSelector !== 'N/A') {
        toastDesc += ` on ${currentSelector}`;
    } else if (params.url) {
        toastDesc += ` to ${params.url}`;
    } else if (params.key) {
         toastDesc += `: ${params.key}`;
    } else if (params.value) {
         toastDesc += ` with value "${String(params.value).substring(0,20)}${String(params.value).length > 20 ? '...' : ''}"`;
    } else if (params.visibleText) {
        toastDesc += ` option "${String(params.visibleText).substring(0,20)}${String(params.visibleText).length > 20 ? '...' : ''}"`;
    }
    toast({ title: "Action Recorded", description: toastDesc });
  }, [toast, setRecordedSteps]);


  const checkUrlChangeAfterDelay = useCallback(() => {
    setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.href !== previousUrlRef.current) {
            addNewStep('navigate', null, { url: window.location.href });
            previousUrlRef.current = window.location.href;
        }
    }, 100); 
  }, [addNewStep]);

  const recordClick = useCallback((event: MouseEvent) => {
    if (isElementSelectorActive || !isRecording || isElementContextMenuOpen) return;
    if (panelCardRef.current && panelCardRef.current.contains(event.target as Node)) return;

    const target = event.target as HTMLElement;
    if (!target || !target.tagName || target === document.body || target === document.documentElement) return;
    
    if (target.matches('input, textarea, select')) {
        if (target.matches('input[type="checkbox"], input[type="radio"]')) {
           // Proceed to record click for these
        } else {
           checkUrlChangeAfterDelay(); 
           return; 
        }
    }
    
    const elementInfo = generateElementInfo(target);
    const selectors: string[] = [];
    if (elementInfo.id) selectors.push(elementInfo.id);
    if (elementInfo.cssSelector && elementInfo.cssSelector !== elementInfo.id) selectors.push(elementInfo.cssSelector);
    if (elementInfo.xpath && !selectors.includes(elementInfo.xpath)) selectors.push(elementInfo.xpath);
    if (selectors.length === 0) selectors.push(elementInfo.tagName || 'unknown');

    const primarySelector = selectors[0] || 'N/A';
    const commandInfo = findCommandByKey('click')!;

    const newStep: Step = {
      id: String(Date.now()) + Math.random().toString(36).substring(2,7),
      type: commandInfo.mapsToStepType,
      commandKey: commandInfo.key,
      badgeLabel: commandInfo.badgeLabel,
      description: commandInfo.description,
      selectors: selectors,
      selector: primarySelector,
      target: 'main',
      timeout: 5000,
      ...(commandInfo.defaultParams as Partial<ClickStep> || {})
    };

    setRecordedSteps(prevSteps => [...prevSteps, newStep]);
    toast({ title: "Action Recorded", description: `Recorded: Click on ${primarySelector}` });
    checkUrlChangeAfterDelay();
  }, [toast, isElementSelectorActive, isRecording, isElementContextMenuOpen, checkUrlChangeAfterDelay, setRecordedSteps]);


  const handleFocusIn = useCallback((event: FocusEvent) => {
    if (panelCardRef.current && panelCardRef.current.contains(event.target as Node)) return;
    const target = event.target as HTMLElement;
    if (target.matches('input[type="text"], input[type="password"], input[type="email"], input[type="search"], input[type="url"], input[type="tel"], input[type="number"], textarea')) {
        setFocusedElementInfo({ element: target, initialValue: (target as HTMLInputElement | HTMLTextAreaElement).value });
    }
  }, []);

  const handleFocusOut = useCallback((event: FocusEvent) => {
    if (panelCardRef.current && panelCardRef.current.contains(event.target as Node)) return;
    if (focusedElementInfo && event.target === focusedElementInfo.element) {
        const currentValue = (focusedElementInfo.element as HTMLInputElement | HTMLTextAreaElement).value;
        if (currentValue !== focusedElementInfo.initialValue) {
            addNewStep('setValue', focusedElementInfo.element, { value: currentValue });
        }
        setFocusedElementInfo(null);
    }
  }, [focusedElementInfo, addNewStep]);

  const handleChangeEvent = useCallback((event: Event) => {
    if (panelCardRef.current && panelCardRef.current.contains(event.target as Node)) return;
    const target = event.target as HTMLSelectElement;
    if (target.tagName === 'SELECT') {
        const selectedOption = target.options[target.selectedIndex];
        if (selectedOption) {
            addNewStep('selectByVisibleText', target, { visibleText: selectedOption.text });
        }
    }
  }, [addNewStep]);

  const handleGeneralKeyDown = useCallback((event: KeyboardEvent) => {
    const activeElement = document.activeElement as HTMLElement;
    if (panelCardRef.current && panelCardRef.current.contains(activeElement)) return;

    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
      if (!['Enter', 'Tab', 'Escape'].includes(event.key)) {
        return; 
      }
    }

    if (['Enter', 'Tab', 'Escape'].includes(event.key)) {
        addNewStep('keyDown', document.activeElement instanceof HTMLElement ? document.activeElement : null, { key: event.key });
    }
  }, [addNewStep]);

  const handlePopState = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.href !== previousUrlRef.current) {
        addNewStep('navigate', null, { url: window.location.href });
        previousUrlRef.current = window.location.href;
    }
  }, [addNewStep]);


  useEffect(() => {
    const shouldListen = isRecording && !isElementSelectorActive && !isElementContextMenuOpen;
    if (shouldListen) {
        document.addEventListener('click', recordClick, true);
        document.addEventListener('focusin', handleFocusIn, true);
        document.addEventListener('focusout', handleFocusOut, true);
        document.addEventListener('change', handleChangeEvent, true); 
        document.addEventListener('keydown', handleGeneralKeyDown, true);
        window.addEventListener('popstate', handlePopState);
        if (typeof window !== 'undefined') {
            previousUrlRef.current = window.location.href;
        }
    } else {
        document.removeEventListener('click', recordClick, true);
        document.removeEventListener('focusin', handleFocusIn, true);
        document.removeEventListener('focusout', handleFocusOut, true);
        document.removeEventListener('change', handleChangeEvent, true);
        document.removeEventListener('keydown', handleGeneralKeyDown, true);
        window.removeEventListener('popstate', handlePopState);
    }
    return () => {
        document.removeEventListener('click', recordClick, true);
        document.removeEventListener('focusin', handleFocusIn, true);
        document.removeEventListener('focusout', handleFocusOut, true);
        document.removeEventListener('change', handleChangeEvent, true);
        document.removeEventListener('keydown', handleGeneralKeyDown, true);
        window.removeEventListener('popstate', handlePopState);
    };
  }, [isRecording, recordClick, handleFocusIn, handleFocusOut, handleChangeEvent, handleGeneralKeyDown, handlePopState, isElementSelectorActive, isElementContextMenuOpen]);


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

  const handleCommandSelectedFromInspector = useCallback((commandKey: string, targetElementInfo: ElementInfoForPopup) => {
    const commandInfo = findCommandByKey(commandKey);
    if (!commandInfo) {
      toast({ title: "Error", description: `Unknown command: ${commandKey}`, variant: "destructive" });
      return;
    }

    const allSelectors: string[] = [];
    if (targetElementInfo.id) allSelectors.push(targetElementInfo.id);
    if (targetElementInfo.cssSelector && targetElementInfo.cssSelector !== targetElementInfo.id) {
        allSelectors.push(targetElementInfo.cssSelector);
    }
    if (targetElementInfo.xpath && !allSelectors.includes(targetElementInfo.xpath)) {
        allSelectors.push(targetElementInfo.xpath);
    }
    if (allSelectors.length === 0 && targetElementInfo.tagName) {
        allSelectors.push(targetElementInfo.tagName);
    } else if (allSelectors.length === 0) {
        allSelectors.push('N/A');
    }

    const primarySelector = allSelectors[0];
    const baseId = String(Date.now()) + Math.random().toString(36).substring(2,7);

    let newStepData: Partial<Step> = {
      type: commandInfo.mapsToStepType,
      commandKey: commandInfo.key,
      badgeLabel: commandInfo.badgeLabel,
      description: commandInfo.description,
      selectors: commandInfo.isElementCommand ? allSelectors : undefined,
      selector: commandInfo.isElementCommand ? primarySelector : undefined,
      target: 'main',
      timeout: 5000,
      ...(commandInfo.defaultParams || {})
    };

    const allParamsFromCmd = [...commandInfo.requiredParams, ...commandInfo.optionalParams];
    allParamsFromCmd.forEach(paramDefString => {
        const namePart = paramDefString.split(':')[0].replace('...', '').replace('?', '').trim();
        const typePart = (paramDefString.split(':')[1] || 'string').trim().toLowerCase();

        if (!(namePart in newStepData)) {
            if (typePart.includes('string') || typePart.includes('function') || typePart.includes('object') || typePart.includes('array')) {
                (newStepData as any)[namePart] = '';
            } else if (typePart.includes('number')) {
                (newStepData as any)[namePart] = 0;
            } else if (typePart.includes('boolean')) {
                (newStepData as any)[namePart] = false;
            } else {
                 (newStepData as any)[namePart] = '';
            }
        }
    });

    const newStep = {
      id: baseId,
      ...newStepData,
    } as Step;


    setRecordedSteps(prev => [...prev, newStep]);
    toast({ title: "Step Added", description: `${commandInfo.badgeLabel} step added for ${primarySelector}.` });
    setNewlyAddedStepId(newStep.id!);
    closeElementContextMenu();
  }, [toast, closeElementContextMenu, setRecordedSteps]);

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
  }, [toast, setRecordedSteps]);


  const handleSaveSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sessionToSave: RecordingSession = {
      title: "My Recorded Session " + new Date().toLocaleTimeString(),
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
    console.log("Saving session:", JSON.stringify(sessionToSave, null, 2));
    try {
      localStorage.setItem('reflectFlowSession', JSON.stringify(sessionToSave));
      toast({ title: "Session Saved", description: "Session data saved to Local Storage and console." });
    } catch (error) {
      console.error("Error saving session to localStorage:", error);
      toast({ title: "Save Error", description: "Could not save session to Local Storage. See console.", variant: "destructive" });
    }
  }, [toast, recordedSteps]);

  const handleExportSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sessionToSave: RecordingSession = {
      title: "My Recorded Session - " + new Date().toISOString(),
      description: "A recording of user interactions exported from ReflectFlow.",
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
  }, [toast, recordedSteps]);


  const handleUpdateStep = useCallback((updatedStep: Step) => {
    setRecordedSteps(prev => prev.map(s => s.id === updatedStep.id ? updatedStep : s));
    if (updatedStep.type !== 'undetermined') {
        const finalDescription = updatedStep.badgeLabel || updatedStep.description;
        toast({ title: "Step Updated", description: `Step "${finalDescription}" has been configured.` });
    }
    if (newlyAddedStepId === updatedStep.id && updatedStep.type !== 'undetermined') {
        setNewlyAddedStepId(null);
    }
  }, [toast, newlyAddedStepId, setRecordedSteps]);

  const handleDeleteStep = useCallback((id: string) => {
    setRecordedSteps(prev => prev.filter(s => s.id !== id));
    toast({ title: "Step Deleted", description: "The step has been removed." });
  }, [toast, setRecordedSteps]);

  const handleReorderSteps = useCallback((oldIndex: number, newIndex: number) => {
    setRecordedSteps((prevSteps) => {
      if (oldIndex !== newIndex && oldIndex >= 0 && oldIndex < prevSteps.length && newIndex >= 0 && newIndex < prevSteps.length) {
        return arrayMove(prevSteps, oldIndex, newIndex);
      }
      return prevSteps;
    });
    toast({ title: "Steps Reordered", description: "The order of the steps has been updated." });
  }, [toast, setRecordedSteps]);

  const panelWidthClass = isPanelCollapsed ? `w-[${PANEL_WIDTH_COLLAPSED}px]` : `w-[${PANEL_WIDTH_EXPANDED}px]`;

  if (!isMounted || !panelPosition) {
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
        className={`max-h-[calc(100vh-32px)] flex flex-col shadow-2xl pointer-events-auto bg-card/90 backdrop-blur-sm transition-[width] duration-300 ease-in-out ${panelWidthClass}`}
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
            <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden p-0 relative">
              <StepList
                steps={recordedSteps}
                onUpdateStep={handleUpdateStep}
                onDeleteStep={handleDeleteStep}
                newlyAddedStepId={newlyAddedStepId}
                onStepDetermined={() => newlyAddedStepId ? setNewlyAddedStepId(null) : undefined}
                onReorderSteps={handleReorderSteps}
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

      {isElementSelectorActive && inspectIconTarget && !isElementContextMenuOpen && !isDragging && typeof window !== 'undefined' && (() => {
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
        onCommandSelected={handleCommandSelectedFromInspector}
        position={contextMenuPosition}
        onClose={closeElementContextMenu}
      />

      <HighlightOverlay targetElement={isElementSelectorActive && !isDragging ? (highlightedElementDetails?.element ?? null) : null} />
    </div>
  );
}

    