
export type StepType =
  | 'navigate'
  | 'click'
  | 'doubleClick'
  | 'type'
  | 'keyDown'
  | 'keyUp'
  | 'scroll'
  | 'waitForElement' // Generic type for various assertions/waits on elements
  | 'moveTo'
  | 'dragAndDrop'
  | 'executeScript'
  | 'isEqual' // Comparing two elements
  | 'saveScreenshot'
  | 'selectOption' // For selectByAttribute, selectByIndex, selectByVisibleText
  | 'touchAction'
  | 'waitUntil' // Generic wait for a condition
  | 'pause'
  | 'debug'
  | 'undetermined';

export interface BaseStep {
  id: string;
  type: StepType;
  commandKey?: string; // Original key from availableCommands for precise parameter lookup & badge
  badgeLabel?: string; // Specific label for the badge, derived from commandKey
  description: string; // Human-readable description, often from commandKey's description
  selectors?: string[]; // Array of selectors (CSS, XPath, ARIA)
  selector?: string; // Primary selector (usually selectors[0])
  target?: string; // Usually 'main' or an iframe selector
  timeout?: number; // Default command timeout
}

export interface NavigateStep extends BaseStep {
  type: 'navigate';
  url: string;
}

export interface ClickStep extends BaseStep {
  type: 'click';
  clickOptions?: string; // JSON string for WDIO click options like button, x, y, skipRelease
}

export interface DoubleClickStep extends BaseStep {
  type: 'doubleClick';
  // WDIO doubleClick doesn't take specific options other than what ClickOptions might cover (button)
  // For simplicity, we can reuse clickOptions if needed, or leave it without specific options.
  clickOptions?: string;
}

export interface TypeStep extends BaseStep {
  type: 'type';
  value: string; // Text to type or value for addValue/setValue. For clearValue, this would be empty.
}

export interface KeyDownStep extends BaseStep {
  type: 'keyDown';
  key: string; // Key to press, e.g., 'Enter', 'Shift', 'a'
}

export interface KeyUpStep extends BaseStep {
  type: 'keyUp';
  key: string; // Key to release
}

export interface ScrollStep extends BaseStep {
  type: 'scroll';
  scrollType?: 'window' | 'element'; // To distinguish 'scrollWindow' from 'scrollIntoView'
  x?: number; // For window scroll (command: scrollWindow)
  y?: number; // For window scroll (command: scrollWindow)
  scrollIntoViewOptions?: string; // JSON string for element scroll options (command: scrollIntoView)
}

// Consolidating various "get", "is", and "wait" commands into WaitForElementStep
// The 'property' field combined with 'operator' and 'expectedValue' defines the assertion/wait.
export interface WaitForElementStep extends BaseStep {
  type: 'waitForElement';
  // For 'getAttribute', 'getCSSProperty', 'getProperty', 'getHTML', 'getText', 'getValue', 'getTagName', 'getLocation', 'getSize', 'getComputedLabel', 'getComputedRole'
  // For 'isClickable', 'isDisplayed', 'isEnabled', 'isExisting', 'isFocused', 'isSelected', 'isStable'
  // For 'waitForClickable', 'waitForDisplayed', 'waitForEnabled', 'waitForExist', 'waitForStable'
  // For 'getElement', 'getElements'
  // For 'nextElement', 'parentElement', 'previousElement'
  property?: string; // e.g., 'visible', 'textContent', 'attribute:data-foo', 'css:color', 'size.width', 'html', 'computedLabel', 'focused', 'selected', 'stable', 'existing', 'clickable', 'tagName', 'value'
  propertyType?: 'attribute' | 'css' | 'jsProperty' | 'computed' | 'content' | 'location' | 'size' | 'tag' | 'text' | 'value' | 'state'; // Helps categorize property
  attributeName?: string; // Required for getAttribute
  cssProperty?: string; // Required for getCSSProperty
  jsPropertyName?: string; // Required for getProperty
  includeSelectorTag?: boolean; // Optional for getHTML

  operator?: '==' | '!=' | '<' | '>' | '<=' | '>=' | 'contains' | 'not-contains' | 'exists' | 'stable' | 'clickable';
  expectedValue?: string | number | boolean; // Value to assert against

  reverse?: boolean; // For waitFor commands (e.g., wait for not visible)
  waitTimeoutMessage?: string; // Custom message for timeout
  checkInterval?: number; // Interval for checking condition in waitFor commands

  derivedAction?: 'nextElement' | 'parentElement' | 'previousElement'; // Internal helper for derived elements
}

export interface MoveToStep extends BaseStep {
  type: 'moveTo';
  xOffset?: number;
  yOffset?: number;
}

export interface DragAndDropStep extends BaseStep {
  type: 'dragAndDrop';
  targetSelector: string; // Selector of the element to drop onto
  duration?: number;
}

export interface ExecuteScriptStep extends BaseStep {
  type: 'executeScript';
  script: string; // The JavaScript code (as a string)
  scriptArgs?: string; // JSON string representing arguments for the script
  isAsync?: boolean; // Differentiates execute from executeAsync
}

export interface IsEqualStep extends BaseStep {
  type: 'isEqual';
  otherSelector: string; // Selector of the other element to compare with
}

export interface SaveScreenshotStep extends BaseStep {
  type: 'saveScreenshot';
  filename?: string; // Optional filename for the screenshot
}

export interface SelectOptionStep extends BaseStep {
  type: 'selectOption';
  selectMethod: 'attribute' | 'index' | 'text';
  attributeName?: string;   // For selectByAttribute
  attributeValue?: string;  // For selectByAttribute
  optionIndex?: number;     // For selectByIndex
  visibleText?: string;     // For selectByVisibleText
}

export interface TouchActionStep extends BaseStep {
  type: 'touchAction';
  touchActionArgs: string; // JSON string for touch action arguments (action for WDIO)
}

export interface WaitUntilStep extends BaseStep {
  type: 'waitUntil';
  conditionScript: string; // JavaScript function (as string) for the condition
  waitUntilOptions?: string; // JSON string for options like timeout, interval etc.
}

export interface PauseStep extends BaseStep {
  type: 'pause';
  duration: number; // Duration in milliseconds
}

export interface DebugStep extends BaseStep {
  type: 'debug';
  // No specific params, just pauses execution
}

export interface UndeterminedStep extends BaseStep {
  type: 'undetermined';
  badgeLabel?: string; // Can be set if we want to prefill badge for new undetermined steps
}


export type Step =
  | NavigateStep
  | ClickStep
  | DoubleClickStep
  | TypeStep
  | KeyDownStep
  | KeyUpStep
  | ScrollStep
  | WaitForElementStep
  | MoveToStep
  | DragAndDropStep
  | ExecuteScriptStep
  | IsEqualStep
  | SaveScreenshotStep
  | SelectOptionStep
  | TouchActionStep
  | WaitUntilStep
  | PauseStep
  | DebugStep
  | UndeterminedStep;

// Represents a saved recording session
export interface RecordingSession {
  title: string;
  description: string;
  url: string;
  steps: Step[];
  device_screen_emulation?: {
    width: number;
    height: number;
    deviceScaleFactor: number;
    mobile: boolean;
    userAgent: string;
  };
}

    