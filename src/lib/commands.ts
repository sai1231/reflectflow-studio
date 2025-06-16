
import type { Step, StepType } from '@/types';

export interface CommandInfo {
  key: string;
  description: string;
  requiredParams: string[]; // e.g., ["value: string", "attributeName: string"]
  optionalParams: string[]; // e.g., ["duration: number", "includeSelectorTag: boolean"]
  mapsToStepType: StepType;
  defaultParams?: Partial<Step>; // Pre-filled values for the step, matching the target StepType
  isElementCommand?: boolean; // True if this command typically operates on an element (and thus needs selectors)
}

export const availableCommands: CommandInfo[] = [
  {
    key: 'addValue',
    description: 'Type text without clearing existing content.',
    requiredParams: ['value: string'],
    optionalParams: [],
    mapsToStepType: 'type',
    isElementCommand: true,
    defaultParams: { description: 'Type text without clearing existing content.'}
  },
  {
    key: 'clearValue',
    description: 'Clear text from input field.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'type',
    isElementCommand: true,
    defaultParams: { value: '', description: 'Clear text from input field.' }
  },
  {
    key: 'click',
    description: 'Click on an element.',
    requiredParams: [],
    optionalParams: ['clickOptions: string'], // Representing object as string for JSON input
    mapsToStepType: 'click',
    isElementCommand: true,
  },
  {
    key: 'doubleClick',
    description: 'Double-click an element.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'doubleClick',
    isElementCommand: true,
  },
  {
    key: 'dragAndDrop',
    description: 'Drag and drop an element.',
    requiredParams: ['targetSelector: string'], // target is selector of the drop target
    optionalParams: ['duration: number'],
    mapsToStepType: 'dragAndDrop',
    isElementCommand: true, // The source element uses the main selector
  },
  {
    key: 'execute',
    description: 'Run sync JavaScript in browser.',
    requiredParams: ['script: string'], // script as string
    optionalParams: ['scriptArgs: string'], // ...args: any[] as JSON string
    mapsToStepType: 'executeScript',
    isElementCommand: false, // Can be global or on an element if element is passed as arg
  },
  {
    key: 'executeAsync',
    description: 'Run async JavaScript in browser.',
    requiredParams: ['script: string'], // script as string
    optionalParams: ['scriptArgs: string'], // ...args: any[] as JSON string
    mapsToStepType: 'executeScript',
    isElementCommand: false, // Similar to execute
    defaultParams: { isAsync: true }
  },
  {
    key: 'getAttribute',
    description: "Get element's HTML attribute value.",
    requiredParams: ['attributeName: string'],
    optionalParams: [],
    mapsToStepType: 'waitForElement', // Will use property and expectedValue for assertion
    isElementCommand: true,
    defaultParams: { operator: 'exists', propertyType: 'attribute' }
  },
  {
    key: 'getCSSProperty',
    description: "Get element's CSS property value.",
    requiredParams: ['cssProperty: string'],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { operator: 'exists', propertyType: 'css' }
  },
  {
    key: 'getComputedLabel',
    description: "Get element's accessible label.",
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'computedLabel', operator: 'exists', propertyType: 'computed' }
  },
  {
    key: 'getComputedRole',
    description: "Get element's accessible role.",
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'computedRole', operator: 'exists', propertyType: 'computed' }
  },
  {
    key: 'getElement',
    description: 'Find single element.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement', // Essentially a 'waitForExist'
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true }
  },
  {
    key: 'getElements',
    description: 'Find multiple elements. (Represented as wait for at least one)',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true }
  },
  {
    key: 'getHTML',
    description: "Get element's HTML content.",
    requiredParams: [],
    optionalParams: ['includeSelectorTag: boolean'],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'html', operator: 'exists', propertyType: 'content' }
  },
  {
    key: 'getLocation',
    description: "Get element's X/Y coordinates.",
    requiredParams: [],
    optionalParams: [], // x, y are part of the return, not input params for this "get"
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'location.x', operator: 'exists', propertyType: 'location' }
  },
  {
    key: 'getProperty',
    description: "Get element's JS property value.",
    requiredParams: ['jsPropertyName: string'],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { operator: 'exists', propertyType: 'jsProperty' }
  },
  {
    key: 'getSize',
    description: "Get element's width and height.",
    requiredParams: [],
    optionalParams: [], // width, height are part of return
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'size.width', operator: 'exists', propertyType: 'size' }
  },
  {
    key: 'getTagName',
    description: "Get element's HTML tag name.",
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'tagName', operator: 'exists', propertyType: 'tag' }
  },
  {
    key: 'getText',
    description: "Get element's visible text.",
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'textContent', operator: 'exists', propertyType: 'text' }
  },
  {
    key: 'getValue',
    description: "Get input/select element's value.",
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'value', operator: 'exists', propertyType: 'value' }
  },
  {
    key: 'isClickable',
    description: 'Check if element is clickable.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'clickable', operator: 'clickable', expectedValue: true }
  },
  {
    key: 'isDisplayed',
    description: 'Check if element is visible.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'visible', operator: '==', expectedValue: true }
  },
  {
    key: 'isEnabled',
    description: 'Check if element is enabled.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'enabled', operator: '==', expectedValue: true }
  },
  {
    key: 'isEqual',
    description: 'Check if two elements are the same.',
    requiredParams: ['otherSelector: string'],
    optionalParams: [],
    mapsToStepType: 'isEqual',
    isElementCommand: true, // First element is the main selector
  },
  {
    key: 'isExisting',
    description: 'Check if element exists in DOM.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true }
  },
  {
    key: 'isFocused',
    description: 'Check if element has focus.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'focused', operator: '==', expectedValue: true }
  },
  {
    key: 'isSelected',
    description: 'Check if option/checkbox/radio is selected.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'selected', operator: '==', expectedValue: true }
  },
  {
    key: 'isStable',
    description: 'Check if element is stable (not moving/changing).',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'stable', operator: 'stable', expectedValue: true }
  },
  {
    key: 'moveTo',
    description: 'Move mouse to element center.',
    requiredParams: [],
    optionalParams: ['xOffset: number', 'yOffset: number'],
    mapsToStepType: 'moveTo',
    isElementCommand: true,
  },
  {
    key: 'nextElement',
    description: 'Get next sibling element. (Represented as waitForExist on derived selector)',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement', // This is tricky, would need selector modification logic
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true, derivedAction: 'nextElement' }
  },
  {
    key: 'parentElement',
    description: 'Get parent element. (Represented as waitForExist on derived selector)',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true, derivedAction: 'parentElement' }
  },
  {
    key: 'previousElement',
    description: 'Get previous sibling element. (Represented as waitForExist on derived selector)',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true, derivedAction: 'previousElement' }
  },
  {
    key: 'saveScreenshot',
    description: 'Take screenshot.',
    requiredParams: [],
    optionalParams: ['filename: string'],
    mapsToStepType: 'saveScreenshot',
    isElementCommand: false, // Typically global, can be element-specific if API supports
  },
  {
    key: 'scrollIntoView',
    description: 'Scroll element into view.',
    requiredParams: [],
    optionalParams: ['scrollIntoViewOptions: string'], // scrollOptions: object as JSON string
    mapsToStepType: 'scroll',
    isElementCommand: true, // This command specifically targets an element
    defaultParams: { scrollType: 'element' }
  },
  {
    key: 'selectByAttribute',
    description: 'Select dropdown option by attribute.',
    requiredParams: ['attributeName: string', 'attributeValue: string'],
    optionalParams: [],
    mapsToStepType: 'selectOption',
    isElementCommand: true,
    defaultParams: { selectMethod: 'attribute' }
  },
  {
    key: 'selectByIndex',
    description: 'Select dropdown option by index.',
    requiredParams: ['optionIndex: number'],
    optionalParams: [],
    mapsToStepType: 'selectOption',
    isElementCommand: true,
    defaultParams: { selectMethod: 'index' }
  },
  {
    key: 'selectByVisibleText',
    description: 'Select dropdown option by visible text.',
    requiredParams: ['visibleText: string'],
    optionalParams: [],
    mapsToStepType: 'selectOption',
    isElementCommand: true,
    defaultParams: { selectMethod: 'text' }
  },
  {
    key: 'setValue',
    description: 'Type text, clearing existing content first.',
    requiredParams: ['value: string'],
    optionalParams: [],
    mapsToStepType: 'type',
    isElementCommand: true,
  },
  {
    key: 'touchAction',
    description: 'Perform touch gestures (mobile).',
    requiredParams: ['touchActionArgs: string'], // action: string | object | Array<object> as JSON string
    optionalParams: [],
    mapsToStepType: 'touchAction',
    isElementCommand: true, // Usually on an element
  },
  {
    key: 'waitForClickable',
    description: 'Wait until element is clickable.',
    requiredParams: [],
    optionalParams: ['timeout: number', 'reverse: boolean', 'waitTimeoutMessage: string', 'checkInterval: number'],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'clickable', operator: 'clickable', expectedValue: true }
  },
  {
    key: 'waitForDisplayed',
    description: 'Wait until element is visible.',
    requiredParams: [],
    optionalParams: ['timeout: number', 'reverse: boolean', 'waitTimeoutMessage: string', 'checkInterval: number'],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'visible', operator: '==', expectedValue: true }
  },
  {
    key: 'waitForEnabled',
    description: 'Wait until element is enabled.',
    requiredParams: [],
    optionalParams: ['timeout: number', 'reverse: boolean', 'waitTimeoutMessage: string', 'checkInterval: number'],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'enabled', operator: '==', expectedValue: true }
  },
  {
    key: 'waitForExist',
    description: 'Wait until element exists.',
    requiredParams: [],
    optionalParams: ['timeout: number', 'reverse: boolean', 'waitTimeoutMessage: string', 'checkInterval: number'],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true }
  },
  {
    key: 'waitForStable',
    description: 'Wait until element is stable.',
    requiredParams: [],
    optionalParams: ['timeout: number', 'waitTimeoutMessage: string'],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'stable', operator: 'stable', expectedValue: true }
  },
  {
    key: 'waitUntil',
    description: 'Wait until custom condition is true.',
    requiredParams: ['conditionScript: string'], // condition: function as string
    optionalParams: ['waitUntilOptions: string'], // options: object as JSON string
    mapsToStepType: 'waitUntil',
    isElementCommand: false, // Condition is global JS
  },
  // Adding browser/navigation commands that are not element specific
  {
    key: 'navigate',
    description: 'Navigate to a new URL.',
    requiredParams: ['url: string'],
    optionalParams: [],
    mapsToStepType: 'navigate',
    isElementCommand: false,
  },
  {
    key: 'scrollWindow',
    description: 'Scroll the window to specified coordinates.',
    requiredParams: ['x: number', 'y: number'],
    optionalParams: [],
    mapsToStepType: 'scroll',
    isElementCommand: false,
    defaultParams: { scrollType: 'window' }
  },
   {
    key: 'pause',
    description: 'Pause execution for a specified duration.',
    requiredParams: ['duration: number'],
    optionalParams: [],
    mapsToStepType: 'pause', // Requires new StepType
    isElementCommand: false,
  },
  {
    key: 'debug',
    description: 'Pause execution and enter debug mode.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'debug', // Requires new StepType
    isElementCommand: false,
  },
];

// Helper to find CommandInfo by key
export const findCommandByKey = (key: string): CommandInfo | undefined => {
  return availableCommands.find(cmd => cmd.key === key);
};

// Helper to find CommandInfo by mapped StepType (can be ambiguous if multiple keys map to same type)
// For robust mapping, consider storing original commandKey on the Step object if needed.
export const findCommandByStepTypeAndDescription = (stepType: StepType, description: string): CommandInfo | undefined => {
  return availableCommands.find(cmd => cmd.mapsToStepType === stepType && cmd.description === description);
};
