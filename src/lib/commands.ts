
export interface CommandInfo {
  key: string;
  description: string;
  // Future enhancement: Add default type and params for cleaner mapping
  // mapsToType?: StepType;
  // defaultParams?: Partial<Step>;
}

export const availableCommands: CommandInfo[] = [
  { key: 'navigate', description: 'Navigate to a new URL.' },
  { key: 'click', description: 'Click on an element.' },
  { key: 'doubleClick', description: 'Double-click an element.' },
  { key: 'type', description: 'Type text, clearing existing content first. (Alias: setValue)' },
  { key: 'setValue', description: 'Type text, clearing existing content first.' },
  { key: 'addValue', description: 'Type text without clearing existing content.' },
  { key: 'clearValue', description: 'Clear text from input field.' },
  { key: 'keyDown', description: 'Simulate a key down event.' },
  { key: 'keyUp', description: 'Simulate a key up event.' },
  { key: 'scrollIntoView', description: 'Scroll element into view.' },
  { key: 'moveTo', description: 'Move mouse to element center.' },
  // Wait/Assertion like commands that map to waitForElement
  { key: 'waitForElement', description: 'Wait for an element with specific properties.' },
  { key: 'waitForClickable', description: 'Wait until element is clickable.' },
  { key: 'waitForDisplayed', description: 'Wait until element is visible. (Alias: isDisplayed)' },
  { key: 'waitForEnabled', description: 'Wait until element is enabled. (Alias: isEnabled)' },
  { key: 'waitForExist', description: 'Wait until element exists. (Alias: isExisting)' },
  { key: 'waitForStable', description: 'Wait until element is stable.' },
  { key: 'isDisplayed', description: 'Check if element is visible.' },
  { key: 'isEnabled', description: 'Check if element is enabled.' },
  { key: 'isExisting', description: 'Check if element exists in DOM.' },
  { key: 'isClickable', description: 'Check if element is clickable.' },
  { key: 'isFocused', description: 'Check if element has focus.' },
  { key: 'isSelected', description: 'Check if option/checkbox/radio is selected.' },
  { key: 'isStable', description: 'Check if element is stable (not moving/changing).' },
  { key: 'getText', description: "Get element's visible text (for assertion)." },
  { key: 'getValue', description: "Get input/select element's value (for assertion)." },
  { key: 'getAttribute', description: "Get element's HTML attribute value (for assertion)." },
  { key: 'getCSSProperty', description: "Get element's CSS property value (for assertion)." },
  { key: 'getSize', description: "Get element's width and height (for assertion)." },
  { key: 'getLocation', description: "Get element's X/Y coordinates (for assertion)." },
  { key: 'getTagName', description: "Get element's HTML tag name (for assertion)." },
  { key: 'getHTML', description: "Get element's HTML content (for assertion)." },
  { key: 'getComputedLabel', description: "Get element's accessible label (for assertion)." },
  { key: 'getComputedRole', description: "Get element's accessible role (for assertion)." },
  // Commands that might need new StepTypes or more complex handling in future
  { key: 'dragAndDrop', description: 'Drag and drop an element. (Basic support)' },
  { key: 'execute', description: 'Run sync JavaScript in browser. (Basic support)' },
  { key: 'executeAsync', description: 'Run async JavaScript in browser. (Basic support)' },
  { key: 'saveScreenshot', description: 'Take screenshot. (Basic support)' },
  { key: 'selectByAttribute', description: 'Select dropdown option by attribute. (Basic support)' },
  { key: 'selectByIndex', description: 'Select dropdown option by index. (Basic support)' },
  { key: 'selectByVisibleText', description: 'Select dropdown option by visible text. (Basic support)' },
  { key: 'touchAction', description: 'Perform touch gestures (mobile). (Basic support)' },
  { key: 'waitUntil', description: 'Wait until custom condition is true. (Basic support)' },
  // Element relations - may need specific handling or map to generic find
  { key: 'getElement', description: 'Find single element. (Maps to generic step)' },
  { key: 'getElements', description: 'Find multiple elements. (Maps to generic step)' },
  { key: 'nextElement', description: 'Get next sibling element. (Basic support)' },
  { key: 'parentElement', description: 'Get parent element. (Basic support)' },
  { key: 'previousElement', description: 'Get previous sibling element. (Basic support)' },
  { key: 'isEqual', description: 'Check if two elements are the same. (Basic support)' },
];
