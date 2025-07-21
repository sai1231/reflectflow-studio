
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
  clickOptions?: string;
}

export interface TypeStep extends BaseStep {
  type: 'type';
  value: string;
}

export interface KeyDownStep extends BaseStep {
  type: 'keyDown';
  key: string;
}

export interface KeyUpStep extends BaseStep {
  type: 'keyUp';
  key: string;
}

export interface ScrollStep extends BaseStep {
  type: 'scroll';
  scrollType?: 'window' | 'element';
  x?: number;
  y?: number;
  scrollIntoViewOptions?: string;
}

export interface WaitForElementStep extends BaseStep {
  type: 'waitForElement';
  property?: string;
  propertyType?: 'attribute' | 'css' | 'jsProperty' | 'computed' | 'content' | 'location' | 'size' | 'tag' | 'text' | 'value' | 'state';
  attributeName?: string;
  cssProperty?: string;
  jsPropertyName?: string;
  includeSelectorTag?: boolean;
  operator?: '==' | '!=' | '<' | '>' | '<=' | '>=' | 'contains' | 'not-contains' | 'exists' | 'stable' | 'clickable';
  expectedValue?: string | number | boolean;
  reverse?: boolean;
  waitTimeoutMessage?: string;
  checkInterval?: number;
  derivedAction?: 'nextElement' | 'parentElement' | 'previousElement';
}

export interface MoveToStep extends BaseStep {
  type: 'moveTo';
  xOffset?: number;
  yOffset?: number;
}

export interface DragAndDropStep extends BaseStep {
  type: 'dragAndDrop';
  targetSelector: string;
  duration?: number;
}

export interface ExecuteScriptStep extends BaseStep {
  type: 'executeScript';
  script: string;
  scriptArgs?: string;
  isAsync?: boolean;
}

export interface IsEqualStep extends BaseStep {
  type: 'isEqual';
  otherSelector: string;
}

export interface SaveScreenshotStep extends BaseStep {
  type: 'saveScreenshot';
  filename?: string;
}

export interface SelectOptionStep extends BaseStep {
  type: 'selectOption';
  selectMethod: 'attribute' | 'index' | 'text';
  attributeName?: string;
  attributeValue?: string;
  optionIndex?: number;
  visibleText?: string;
}

export interface TouchActionStep extends BaseStep {
  type: 'touchAction';
  touchActionArgs: string;
}

export interface WaitUntilStep extends BaseStep {
  type: 'waitUntil';
  conditionScript: string;
  waitUntilOptions?: string;
}

export interface PauseStep extends BaseStep {
  type: 'pause';
  duration: number;
}

export interface DebugStep extends BaseStep {
  type: 'debug';
}

export interface UndeterminedStep extends BaseStep {
  type: 'undetermined';
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

export interface ChromeMessage {
    type: 
      | 'TOGGLE_RECORDING' 
      | 'ADD_STEP' 
      | 'TOGGLE_ELEMENT_SELECTOR'
      | 'GET_STATE'
      | 'STATE_UPDATE'
      | 'TOGGLE_OVERLAY';
    payload?: any;
}
