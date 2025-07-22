
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReflectFlowPanel } from '@/components/reflect-flow/ReflectFlowPanel';
import type { ChromeMessage, Step } from '@/types';
import { findCommandByKey } from '@/lib/commands';

console.log("ReflectFlow content script loaded.");

let isRecording = false;
let isElementSelectorActive = false;
let focusedElement: { element: HTMLInputElement | HTMLTextAreaElement, value: string } | null = null;
let currentHoveredElement: HTMLElement | null = null;

// --- UI Injection ---
let reflectFlowRoot: HTMLElement | null = null;
let reactRoot: ReactDOM.Root | null = null;
let isOverlayVisible = false;

function injectUI() {
  if (document.getElementById('reflectflow-extension-root')) return;

  reflectFlowRoot = document.createElement('div');
  reflectFlowRoot.id = 'reflectflow-extension-root';
  reflectFlowRoot.style.position = 'fixed';
  reflectFlowRoot.style.top = '10px';
  reflectFlowRoot.style.right = '10px';
  reflectFlowRoot.style.width = '400px';
  reflectFlowRoot.style.height = '600px';
  reflectFlowRoot.style.zIndex = '99999999';
  reflectFlowRoot.style.display = 'none'; // Initially hidden
  document.body.appendChild(reflectFlowRoot);

  reactRoot = ReactDOM.createRoot(reflectFlowRoot);
  reactRoot.render(
    <React.StrictMode>
      <ReflectFlowPanel />
    </React.StrictMode>
  );
}

function toggleOverlay(show?: boolean) {
    if (!reflectFlowRoot) {
        injectUI();
        if (!reflectFlowRoot) return; // Guard against injection failure
    }
    const shouldShow = typeof show === 'boolean' ? show : !isOverlayVisible;
    reflectFlowRoot!.style.display = shouldShow ? 'block' : 'none';
    isOverlayVisible = shouldShow;
}


// Function to generate unique step ID
function generateStepId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Function to generate robust selectors for an element
function generateSelectors(element: HTMLElement): string[] {
  const selectors: string[] = [];
  const addUniqueSelector = (selector: string) => {
    if (selector && !selectors.includes(selector) && selectors.length < 5) {
      try {
        if (document.querySelector(selector) === element) {
          selectors.push(selector);
        }
      } catch (e) {
        // Ignore invalid selectors
      }
    }
  };

  // 1. data-testid
  if (element.getAttribute('data-testid')) {
    addUniqueSelector(`[data-testid="${element.getAttribute('data-testid')}"]`);
  }
  // 2. ID
  if (element.id) {
    addUniqueSelector(`#${CSS.escape(element.id)}`);
  }
  // 3. Name attribute
  if (element.getAttribute('name')) {
    addUniqueSelector(`${element.tagName.toLowerCase()}[name="${element.getAttribute('name')}"]`);
  }
  // 4. ARIA label
  if (element.getAttribute('aria-label')) {
      addUniqueSelector(`${element.tagName.toLowerCase()}[aria-label="${element.getAttribute('aria-label')}"]`);
  }
  // 5. Class names (simplified)
  if (element.className && typeof element.className === 'string') {
    const stableClassNames = element.className.split(' ').filter(c => c && !c.includes(':') && !c.includes('__') && !/[0-9]/.test(c)).join('.');
    if (stableClassNames) {
      addUniqueSelector(`${element.tagName.toLowerCase()}.${stableClassNames}`);
    }
  }
  // 6. XPath as a fallback
  if (selectors.length === 0) {
      let path = '';
      let current: Element | null = element;
      while (current) {
          let segment = current.tagName.toLowerCase();
          const siblings = Array.from(current.parentElement?.children || []).filter(e => e.tagName === current?.tagName);
          if (siblings.length > 1) {
              const index = siblings.indexOf(current) + 1;
              segment += `[${index}]`;
          }
          path = path ? `${segment}/${path}` : segment;
          if (current.parentElement === document.body) break;
          current = current.parentElement;
      }
      addUniqueSelector(path ? `//body/${path}` : '');
  }
  return selectors;
}


function createStepPayload(commandKey: string, element?: HTMLElement, value?: any): Partial<Step> | null {
  const command = findCommandByKey(commandKey);
  if (!command) return null;

  const selectors = element ? generateSelectors(element) : undefined;

  const step: Partial<Step> = {
    id: generateStepId(),
    commandKey: command.key,
    selectors: selectors,
    selector: selectors ? selectors[0] : undefined,
    ...value
  };

  return step;
}

function sendStepToUI(stepPayload: Partial<Step> | null) {
  if (!stepPayload || !(isRecording || isElementSelectorActive)) return;

  chrome.runtime.sendMessage({
    type: 'ADD_STEP',
    payload: stepPayload
  });
}

// --- Event Handlers ---
function handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('#reflectflow-extension-root')) return;

    if (isElementSelectorActive) {
        event.preventDefault();
        event.stopPropagation();
        const stepPayload = createStepPayload('click', target);
        sendStepToUI(stepPayload);
        // Deactivate selector mode after a selection is made
        chrome.runtime.sendMessage({ type: 'TOGGLE_ELEMENT_SELECTOR', payload: { isActive: false }});
        return;
    }

    if (isRecording) {
        const stepPayload = createStepPayload('click', target);
        sendStepToUI(stepPayload);
    }
}

function handleFocusIn(event: FocusEvent) {
  if (!isRecording) return;
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    focusedElement = { element: target, value: target.value };
  }
}

function handleFocusOut(event: FocusEvent) {
  if (!isRecording || !focusedElement) return;
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    if (target === focusedElement.element && target.value !== focusedElement.value) {
      const stepPayload = createStepPayload('setValue', focusedElement.element, { value: target.value });
      sendStepToUI(stepPayload);
    }
  }
  focusedElement = null;
}

function handleChange(event: Event) {
  if (!isRecording) return;
  const target = event.target as HTMLElement;

  if (target.tagName === 'SELECT') {
    const selectElement = target as HTMLSelectElement;
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const stepPayload = createStepPayload('selectByVisibleText', selectElement, { visibleText: selectedOption.text });
    sendStepToUI(stepPayload);
  }
}

// --- Element Inspector Logic ---
let highlightOverlay: HTMLDivElement | null = null;

function createHighlightOverlay() {
    if (highlightOverlay) return;
    highlightOverlay = document.createElement('div');
    highlightOverlay.id = 'reflectflow-highlight-overlay';
    highlightOverlay.style.position = 'fixed';
    highlightOverlay.style.border = '2px dashed #f54269'; // Accent color
    highlightOverlay.style.borderRadius = '3px';
    highlightOverlay.style.pointerEvents = 'none';
    highlightOverlay.style.zIndex = '99999998';
    highlightOverlay.style.transition = 'all 50ms ease-in-out';
    document.body.appendChild(highlightOverlay);
}

function updateHighlightOverlay(element: HTMLElement | null) {
    if (!highlightOverlay || !element) {
        if(highlightOverlay) highlightOverlay.style.display = 'none';
        return;
    }
    const rect = element.getBoundingClientRect();
    highlightOverlay.style.display = 'block';
    highlightOverlay.style.top = `${rect.top}px`;
    highlightOverlay.style.left = `${rect.left}px`;
    highlightOverlay.style.width = `${rect.width}px`;
    highlightOverlay.style.height = `${rect.height}px`;
}

function handleMouseMove(event: MouseEvent) {
    if (!isElementSelectorActive) return;
    const target = event.target as HTMLElement;
    if (target === currentHoveredElement || target.id === 'reflectflow-highlight-overlay' || target.closest('#reflectflow-extension-root')) {
        return;
    }
    currentHoveredElement = target;
    updateHighlightOverlay(currentHoveredElement);
}

function activateInspector() {
    document.body.style.cursor = 'crosshair';
    createHighlightOverlay();
    document.addEventListener('mousemove', handleMouseMove, true);
}

function deactivateInspector() {
    document.body.style.cursor = 'default';
    if (highlightOverlay) {
        highlightOverlay.style.display = 'none';
    }
    currentHoveredElement = null;
    document.removeEventListener('mousemove', handleMouseMove, true);
}


function addListeners() {
  document.addEventListener('click', handleClick, true);
  document.addEventListener('focusin', handleFocusIn, true);
  document.addEventListener('focusout', handleFocusOut, true);
  document.addEventListener('change', handleChange, true);
}

function removeListeners() {
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('focusin', handleFocusIn, true);
  document.removeEventListener('focusout', handleFocusOut, true);
  document.removeEventListener('change', handleChange, true);
}

// --- Message Handling ---
chrome.runtime.onMessage.addListener((message: ChromeMessage, _sender, sendResponse) => {
  switch (message.type) {
    case 'TOGGLE_OVERLAY_REQUEST':
        toggleOverlay();
        break;
    case 'STATE_UPDATE':
      const { isRecording: newIsRecording, isElementSelectorActive: newIsSelectorActive } = message.payload;
      
      if (newIsRecording !== isRecording) {
        isRecording = newIsRecording;
        isRecording ? addListeners() : removeListeners();
      }

      if (newIsSelectorActive !== isElementSelectorActive) {
        isElementSelectorActive = newIsSelectorActive;
        isElementSelectorActive ? activateInspector() : deactivateInspector();
        // Also add click listener if not already recording
        if (isElementSelectorActive && !isRecording) {
            document.addEventListener('click', handleClick, true);
        } else if (!isElementSelectorActive && !isRecording) {
            document.removeEventListener('click', handleClick, true);
        }
      }
      break;
  }
  return true;
});

// Initial setup
injectUI();
