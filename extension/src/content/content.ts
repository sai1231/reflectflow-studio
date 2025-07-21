
import type { ChromeMessage, SelectOptionStep, Step, TypeStep, NavigateStep } from '@/types';
import { findCommandByKey } from '@/lib/commands';

console.log("ReflectFlow content script loaded.");

let isRecording = false;
let isElementSelectorActive = false;
let focusedElement: { element: HTMLInputElement | HTMLTextAreaElement, value: string } | null = null;


// Function to generate unique step ID
function generateStepId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Function to generate robust selectors for an element
function generateSelectors(element: HTMLElement): string[] {
    const selectors: string[] = [];
    const addUniqueSelector = (selector: string) => {
        if (selector && !selectors.includes(selector) && selectors.length < 4) {
            try {
                if (document.querySelector(selector) === element) {
                    selectors.push(selector);
                }
            } catch (e) {
                // Ignore invalid selectors
            }
        }
    };

    // 1. ID
    if (element.id) {
        addUniqueSelector(`#${element.id}`);
    }

    // 2. Name attribute
    if (element.getAttribute('name')) {
        addUniqueSelector(`${element.tagName.toLowerCase()}[name="${element.getAttribute('name')}"]`);
    }

    // 3. data-testid
    if (element.getAttribute('data-testid')) {
        addUniqueSelector(`[data-testid="${element.getAttribute('data-testid')}"]`);
    }

    // 4. Class names (simplified)
    if (element.className && typeof element.className === 'string') {
        const stableClassNames = element.className.split(' ').filter(c => c && !c.includes(':') && !c.includes('__')).join('.');
        if (stableClassNames) {
            addUniqueSelector(`${element.tagName.toLowerCase()}.${stableClassNames}`);
        }
    }
    
    // Add more selector strategies if needed to reach 4
    
    return selectors;
}


function createStep(commandKey: string, element?: HTMLElement, value?: any): Partial<Step> | null {
    const command = findCommandByKey(commandKey);
    if (!command) return null;

    let selectors: string[] | undefined;
    let primarySelector: string | undefined;

    if (element) {
        selectors = generateSelectors(element);
        primarySelector = selectors[0];
    }

    const step: Partial<Step> = {
        id: generateStepId(),
        type: command.mapsToStepType,
        commandKey: command.key,
        badgeLabel: command.badgeLabel,
        description: command.description,
        selectors: selectors,
        selector: primarySelector,
        ...command.defaultParams
    };
    
    if (commandKey === 'setValue' && value !== undefined) {
        (step as Partial<TypeStep>).value = value;
    }
    if (commandKey === 'selectByVisibleText' && value !== undefined) {
        (step as Partial<SelectOptionStep>).visibleText = value;
    }
    if (commandKey === 'navigate' && value !== undefined) {
        (step as Partial<NavigateStep>).url = value;
    }


    return step;
}

function sendStepToPopup(step: Partial<Step> | null) {
    if (!step || !isRecording) return;
    
    const message: ChromeMessage = {
        type: 'ADD_STEP',
        payload: step
    };
    chrome.runtime.sendMessage(message);
}

// --- Event Handlers ---

function handleClick(event: MouseEvent) {
    if (!isRecording) return;
    const target = event.target as HTMLElement;
    // Avoid capturing clicks inside the extension UI if it's an overlay
    if (target.closest('#reflectflow-extension-root')) return;

    const step = createStep('click', target);
    sendStepToPopup(step);
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
            const step = createStep('setValue', focusedElement.element, target.value);
            sendStepToPopup(step);
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
        const step = createStep('selectByVisibleText', selectElement, selectedOption.text);
        sendStepToPopup(step);
    }
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


// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message: ChromeMessage, _sender, sendResponse) => {
    if (message.type === 'TOGGLE_RECORDING') {
        isRecording = message.payload.isRecording;
        if (isRecording) {
            addListeners();
            console.log('ReflectFlow recording started.');
        } else {
            removeListeners();
            console.log('ReflectFlow recording stopped.');
        }
        sendResponse({ status: 'OK', isRecording });
    } else if (message.type === 'TOGGLE_ELEMENT_SELECTOR') {
        isElementSelectorActive = message.payload.isActive;
        // Add logic for element selector mode here if needed
        console.log('Element selector active:', isElementSelectorActive);
        sendResponse({ status: 'OK', isElementSelectorActive });
    }
    return true;
});
