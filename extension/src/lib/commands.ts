
import type { Step, StepType } from '@/types';

export interface CommandInfo {
  key: string;
  badgeLabel: string; // For display in the StepItem badge
  description: string;
  requiredParams: string[]; // e.g., ["value: string", "attributeName: string"]
  optionalParams: string[]; // e.g., ["duration: number", "includeSelectorTag: boolean"]
  mapsToStepType: StepType;
  defaultParams?: Partial<Step>; // Pre-filled values for the step, matching the target StepType
  isElementCommand?: boolean; // True if this command typically operates on an element
}

export const availableCommands: CommandInfo[] = [
  {
    key: 'addValue',
    badgeLabel: 'Add Value',
    description: 'Type text without clearing existing content.',
    requiredParams: ['value: string'],
    optionalParams: [],
    mapsToStepType: 'type',
    isElementCommand: true,
    defaultParams: { description: 'Type text without clearing existing content.'}
  },
  {
    key: 'clearValue',
    badgeLabel: 'Clear Value',
    description: 'Clear text from input field.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'type',
    isElementCommand: true,
    defaultParams: { value: '', description: 'Clear text from input field.' }
  },
  {
    key: 'click',
    badgeLabel: 'Click',
    description: 'Click on an element.',
    requiredParams: [],
    optionalParams: ['clickOptions: string'], // Representing object as string for JSON input
    mapsToStepType: 'click',
    isElementCommand: true,
  },
  {
    key: 'doubleClick',
    badgeLabel: 'Double Click',
    description: 'Double-click an element.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'doubleClick',
    isElementCommand: true,
  },
  {
    key: 'dragAndDrop',
    badgeLabel: 'Drag & Drop',
    description: 'Drag and drop an element.',
    requiredParams: ['targetSelector: string'], // target is selector of the drop target
    optionalParams: ['duration: number'],
    mapsToStepType: 'dragAndDrop',
    isElementCommand: true,
  },
  {
    key: 'execute',
    badgeLabel: 'Execute JS',
    description: 'Run sync JavaScript in browser.',
    requiredParams: ['script: string'], // script as string or function string
    optionalParams: ['scriptArgs: string'], // ...args: any[] as JSON string
    mapsToStepType: 'executeScript',
    isElementCommand: false,
  },
  {
    key: 'executeAsync',
    badgeLabel: 'Execute Async JS',
    description: 'Run async JavaScript in browser.',
    requiredParams: ['script: string'], // script as string or function string
    optionalParams: ['scriptArgs: string'], // ...args: any[] as JSON string
    mapsToStepType: 'executeScript',
    isElementCommand: false,
    defaultParams: { isAsync: true }
  },
  {
    key: 'getAttribute',
    badgeLabel: 'Get Attribute',
    description: "Get element's HTML attribute value.",
    requiredParams: ['attributeName: string'],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { operator: 'exists', propertyType: 'attribute' }
  },
  {
    key: 'getCSSProperty',
    badgeLabel: 'Get CSS Property',
    description: "Get element's CSS property value.",
    requiredParams: ['cssProperty: string'],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { operator: 'exists', propertyType: 'css' }
  },
  {
    key: 'getComputedLabel',
    badgeLabel: 'Get Comp. Label',
    description: "Get element's accessible label.",
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'computedLabel', operator: 'exists', propertyType: 'computed' }
  },
  {
    key: 'getComputedRole',
    badgeLabel: 'Get Comp. Role',
    description: "Get element's accessible role.",
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'computedRole', operator: 'exists', propertyType: 'computed' }
  },
  {
    key: 'getElement', // This is like 'find element'
    badgeLabel: 'Find Element',
    description: 'Find single element.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true, description: 'Find single element.' }
  },
  {
    key: 'getElements', // This is like 'find elements'
    badgeLabel: 'Find Elements',
    description: 'Find multiple elements. (Represented as wait for at least one)',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true, description: 'Find multiple elements.' }
  },
  {
    key: 'getHTML',
    badgeLabel: 'Get HTML',
    description: "Get element's HTML content.",
    requiredParams: [],
    optionalParams: ['includeSelectorTag: boolean'],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'html', operator: 'exists', propertyType: 'content' }
  },
  {
    key: 'getLocation',
    badgeLabel: 'Get Location',
    description: "Get element's X/Y coordinates.",
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'location.x', operator: 'exists', propertyType: 'location' }
  },
  {
    key: 'getProperty',
    badgeLabel: 'Get JS Property',
    description: "Get element's JS property value.",
    requiredParams: ['jsPropertyName: string'], // Renamed from propertyName for clarity
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { operator: 'exists', propertyType: 'jsProperty' }
  },
  {
    key: 'getSize',
    badgeLabel: 'Get Size',
    description: "Get element's width and height.",
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'size.width', operator: 'exists', propertyType: 'size' }
  },
  {
    key: 'getTagName',
    badgeLabel: 'Get Tag Name',
    description: "Get element's HTML tag name.",
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'tagName', operator: 'exists', propertyType: 'tag' }
  },
  {
    key: 'getText',
    badgeLabel: 'Get Text',
    description: "Get element's visible text.",
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'textContent', operator: 'exists', propertyType: 'text' }
  },
  {
    key: 'getValue',
    badgeLabel: 'Get Value',
    description: "Get input/select element's value.",
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'value', operator: 'exists', propertyType: 'value' }
  },
  {
    key: 'isClickable',
    badgeLabel: 'Is Clickable',
    description: 'Check if element is clickable.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'clickable', operator: 'clickable', expectedValue: true }
  },
  {
    key: 'isDisplayed',
    badgeLabel: 'Is Visible',
    description: 'Check if element is visible.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'visible', operator: '==', expectedValue: true }
  },
  {
    key: 'isEnabled',
    badgeLabel: 'Is Enabled',
    description: 'Check if element is enabled.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'enabled', operator: '==', expectedValue: true }
  },
  {
    key: 'isEqual',
    badgeLabel: 'Is Equal To',
    description: 'Check if two elements are the same.',
    requiredParams: ['otherSelector: string'], // Renamed from otherElement
    optionalParams: [],
    mapsToStepType: 'isEqual',
    isElementCommand: true,
  },
  {
    key: 'isExisting',
    badgeLabel: 'Is Existing',
    description: 'Check if element exists in DOM.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true }
  },
  {
    key: 'isFocused',
    badgeLabel: 'Is Focused',
    description: 'Check if element has focus.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'focused', operator: '==', expectedValue: true }
  },
  {
    key: 'isSelected',
    badgeLabel: 'Is Selected',
    description: 'Check if option/checkbox/radio is selected.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'selected', operator: '==', expectedValue: true }
  },
  {
    key: 'isStable',
    badgeLabel: 'Is Stable',
    description: 'Check if element is stable (not moving/changing).',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'stable', operator: 'stable', expectedValue: true }
  },
  {
    key: 'keyDown',
    badgeLabel: 'Key Down',
    description: 'Press a specific key.',
    requiredParams: ['key: string'],
    optionalParams: [],
    mapsToStepType: 'keyDown',
    isElementCommand: true, 
  },
  {
    key: 'moveTo',
    badgeLabel: 'Move To',
    description: 'Move mouse to element center.',
    requiredParams: [],
    optionalParams: ['xOffset: number', 'yOffset: number'],
    mapsToStepType: 'moveTo',
    isElementCommand: true,
  },
  {
    key: 'navigate',
    badgeLabel: 'Navigate',
    description: 'Navigate to a new URL.',
    requiredParams: ['url: string'],
    optionalParams: [],
    mapsToStepType: 'navigate',
    isElementCommand: false,
  },
  {
    key: 'nextElement',
    badgeLabel: 'Next Element',
    description: 'Get next sibling element.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true, derivedAction: 'nextElement', description: 'Get next sibling element.' }
  },
  {
    key: 'parentElement',
    badgeLabel: 'Parent Element',
    description: 'Get parent element.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true, derivedAction: 'parentElement', description: 'Get parent element.' }
  },
  {
    key: 'pause',
    badgeLabel: 'Pause',
    description: 'Pause execution for a specified duration.',
    requiredParams: ['duration: number'],
    optionalParams: [],
    mapsToStepType: 'pause',
    isElementCommand: false,
  },
  {
    key: 'previousElement',
    badgeLabel: 'Prev Element',
    description: 'Get previous sibling element.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true, derivedAction: 'previousElement', description: 'Get previous sibling element.' }
  },
  {
    key: 'saveScreenshot',
    badgeLabel: 'Save Screenshot',
    description: 'Take screenshot.',
    requiredParams: [], // filename is optional
    optionalParams: ['filename: string'],
    mapsToStepType: 'saveScreenshot',
    isElementCommand: false, // Can be global or on element. Defaulting to global.
  },
  {
    key: 'scrollIntoView',
    badgeLabel: 'Scroll To View',
    description: 'Scroll element into view.',
    requiredParams: [],
    optionalParams: ['scrollIntoViewOptions: string'], // scrollOptions: object as JSON string
    mapsToStepType: 'scroll',
    isElementCommand: true,
    defaultParams: { scrollType: 'element' }
  },
  {
    key: 'scrollWindow',
    badgeLabel: 'Scroll Window',
    description: 'Scroll the window to specified coordinates.',
    requiredParams: ['x: number', 'y: number'],
    optionalParams: [],
    mapsToStepType: 'scroll',
    isElementCommand: false,
    defaultParams: { scrollType: 'window' }
  },
  {
    key: 'selectByAttribute',
    badgeLabel: 'Select by Attribute',
    description: 'Select dropdown option by attribute.',
    requiredParams: ['attributeName: string', 'attributeValue: string'], // Renamed from attribute, value
    optionalParams: [],
    mapsToStepType: 'selectOption',
    isElementCommand: true,
    defaultParams: { selectMethod: 'attribute' }
  },
  {
    key: 'selectByIndex',
    badgeLabel: 'Select by Index',
    description: 'Select dropdown option by index.',
    requiredParams: ['optionIndex: number'], // Renamed from index
    optionalParams: [],
    mapsToStepType: 'selectOption',
    isElementCommand: true,
    defaultParams: { selectMethod: 'index' }
  },
  {
    key: 'selectByVisibleText',
    badgeLabel: 'Select by Text',
    description: 'Select dropdown option by visible text.',
    requiredParams: ['visibleText: string'], // Renamed from text
    optionalParams: [],
    mapsToStepType: 'selectOption',
    isElementCommand: true,
    defaultParams: { selectMethod: 'text' }
  },
  {
    key: 'setValue',
    badgeLabel: 'Set Value',
    description: 'Type text, clearing existing content first.',
    requiredParams: ['value: string'],
    optionalParams: [],
    mapsToStepType: 'type',
    isElementCommand: true,
  },
  {
    key: 'touchAction',
    badgeLabel: 'Touch Action',
    description: 'Perform touch gestures (mobile).',
    requiredParams: ['touchActionArgs: string'], // Renamed from action
    optionalParams: [],
    mapsToStepType: 'touchAction',
    isElementCommand: true,
  },
  {
    key: 'waitForClickable',
    badgeLabel: 'Wait: Clickable',
    description: 'Wait until element is clickable.',
    requiredParams: [],
    optionalParams: ['timeout: number', 'reverse: boolean', 'waitTimeoutMessage: string', 'checkInterval: number'], // Renamed interval, timeoutMsg
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'clickable', operator: 'clickable', expectedValue: true, description: 'Wait until element is clickable.' }
  },
  {
    key: 'waitForDisplayed',
    badgeLabel: 'Wait: Visible',
    description: 'Wait until element is visible.',
    requiredParams: [],
    optionalParams: ['timeout: number', 'reverse: boolean', 'waitTimeoutMessage: string', 'checkInterval: number'],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'visible', operator: '==', expectedValue: true, description: 'Wait until element is visible.' }
  },
  {
    key: 'waitForEnabled',
    badgeLabel: 'Wait: Enabled',
    description: 'Wait until element is enabled.',
    requiredParams: [],
    optionalParams: ['timeout: number', 'reverse: boolean', 'waitTimeoutMessage: string', 'checkInterval: number'],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'enabled', operator: '==', expectedValue: true, description: 'Wait until element is enabled.' }
  },
  {
    key: 'waitForExist',
    badgeLabel: 'Wait: Exists',
    description: 'Wait until element exists.',
    requiredParams: [],
    optionalParams: ['timeout: number', 'reverse: boolean', 'waitTimeoutMessage: string', 'checkInterval: number'],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'existing', operator: 'exists', expectedValue: true, description: 'Wait until element exists.' }
  },
  {
    key: 'waitForStable',
    badgeLabel: 'Wait: Stable',
    description: 'Wait until element is stable.',
    requiredParams: [],
    optionalParams: ['timeout: number', 'waitTimeoutMessage: string'],
    mapsToStepType: 'waitForElement',
    isElementCommand: true,
    defaultParams: { property: 'stable', operator: 'stable', expectedValue: true, description: 'Wait until element is stable.' }
  },
  {
    key: 'waitUntil',
    badgeLabel: 'Wait Until',
    description: 'Wait until custom condition is true.',
    requiredParams: ['conditionScript: string'], // Renamed from condition
    optionalParams: ['waitUntilOptions: string'], // Renamed from options
    mapsToStepType: 'waitUntil',
    isElementCommand: false,
  },
  {
    key: 'debug',
    badgeLabel: 'Debug',
    description: 'Pause execution and enter debug mode.',
    requiredParams: [],
    optionalParams: [],
    mapsToStepType: 'debug',
    isElementCommand: false,
  },
];

export const findCommandByKey = (key: string): CommandInfo | undefined => {
  return availableCommands.find(cmd => cmd.key === key);
};
