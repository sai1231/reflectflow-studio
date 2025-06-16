
export type StepType =
  | 'navigate'
  | 'click'
  | 'doubleClick'
  | 'type'
  | 'keyDown'
  | 'keyUp'
  | 'scroll'
  | 'waitForElement'
  | 'moveTo'
  | 'dragAndDrop'
  | 'executeScript'
  | 'isEqual'
  | 'saveScreenshot'
  | 'selectOption'
  | 'touchAction'
  | 'waitUntil'
  | 'pause'
  | 'debug'
  | 'undetermined';

export interface BaseStep {
  id: string;
  type: StepType;
  commandKey?: string; // Original key from availableCommands for precise parameter lookup
  description: string;
  selectors?: string[];
  selector?: string;
  target?: string; // Usually 'main' or an iframe selector
  timeout?: number; // Default command timeout
}

export interface NavigateStep extends BaseStep {
  type: 'navigate';
  url: string;
}

export interface ClickStep extends BaseStep {
  type: 'click';
  clickOptions?: string; // JSON string for click options like button, x, y, skipRelease
}

export interface DoubleClickStep extends BaseStep {
  type: 'doubleClick';
  // Potentially similar options as ClickStep if needed
}

export interface TypeStep extends BaseStep {
  type: 'type';
  value: string; // Text to type or value to set/add. For clearValue, this would be empty.
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
  scrollType?: 'window' | 'element'; // To distinguish between window scroll and element scrollIntoView
  x?: number; // For window scroll
  y?: number; // For window scroll
  scrollIntoViewOptions?: string; // JSON string for element scroll options
}

export interface WaitForElementStep extends BaseStep {
  type: 'waitForElement';
  property?: string; // e.g., 'visible', 'textContent', 'attribute:data-foo', 'css:color', 'size.width', 'html', 'computedLabel', 'focused', 'selected', 'stable', 'existing', 'clickable', 'tagName', 'value'
  propertyType?: 'attribute' | 'css' | 'jsProperty' | 'computed' | 'content' | 'location' | 'size' | 'tag' | 'text' | 'value' | 'state'; // Helps categorize property
  attributeName?: string; // Specific for getAttribute, if property is generic
  cssProperty?: string; // Specific for getCSSProperty
  jsPropertyName?: string; // Specific for getProperty
  operator?: '==' | '!=' | '<' | '>' | '<=' | '>=' | 'contains' | 'not-contains' | 'exists' | 'stable' | 'clickable';
  expectedValue?: string | number | boolean;
  includeSelectorTag?: boolean; // For getHTML
  reverse?: boolean; // For waitFor commands (e.g., wait for not visible)
  waitTimeoutMessage?: string;
  checkInterval?: number; // Formerly 'interval' for waitFor commands
  derivedAction?: 'nextElement' | 'parentElement' | 'previousElement'; // For internal logic if needed
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
  script: string; // The JavaScript code to execute
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
  touchActionArgs: string; // JSON string for touch action arguments
}

export interface WaitUntilStep extends BaseStep {
  type: 'waitUntil';
  conditionScript: string; // JavaScript function (as string) for the condition
  waitUntilOptions?: string; // JSON string for options like timeout, interval
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
  // No specific params until a command is chosen
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
