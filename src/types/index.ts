
export type StepType =
  | 'navigate'
  | 'click'
  | 'doubleClick'
  | 'type'
  | 'keyDown'
  | 'keyUp'
  | 'scroll'
  | 'waitForElement'
  | 'moveTo';

// Base for all steps
interface BaseStep {
  id: string;
  type: StepType;
  description: string;
  selectors?: string[]; // Primary selector list - this is the array
  selector?: string; // Typically the first/primary selector from the array, for display or simple cases
  target?: string; // e.g., 'main' or iframe ID/selector
  timeout?: number; // In milliseconds
}

// Specific step properties
export interface NavigateStep extends BaseStep {
  type: 'navigate';
  url: string;
}

export interface ClickStep extends BaseStep {
  type: 'click';
  // offsetX, offsetY, duration removed
}

export interface DoubleClickStep extends BaseStep {
  type: 'doubleClick';
  // offsetX, offsetY removed
}

export interface TypeStep extends BaseStep {
  type: 'type';
  value: string; // Text to type
}

export interface KeyDownStep extends BaseStep {
  type: 'keyDown';
  key: string; // The key that was pressed, e.g., 'Enter', 'a', 'Shift'
}

export interface KeyUpStep extends BaseStep {
  type: 'keyUp';
  key: string; // The key that was released
}

export interface ScrollStep extends BaseStep {
  type: 'scroll';
  // If selectors are present and not 'document', it's element scroll.
  // Otherwise, x and y are viewport scroll coordinates.
  x?: number; // Horizontal scroll position (if viewport/document)
  y?: number; // Vertical scroll position (if viewport/document)
}

export interface WaitForElementStep extends BaseStep {
  type: 'waitForElement';
  property?: string; // e.g., 'visible', 'enabled', 'textContent', 'attribute:data-testid', 'size.width', 'location.x'
  operator?: '==' | '!=' | '<' | '>' | '<=' | '>=' | 'contains' | 'not-contains' | 'exists' | 'stable' | 'clickable';
  expectedValue?: string | number | boolean; // Value to compare against for the property
}

export interface MoveToStep extends BaseStep {
  type: 'moveTo';
  // offsetX, offsetY removed
}


// Union type for all possible steps
export type Step =
  | NavigateStep
  | ClickStep
  | DoubleClickStep
  | TypeStep
  | KeyDownStep
  | KeyUpStep
  | ScrollStep
  | WaitForElementStep
  | MoveToStep;

// Overall recording structure (matches the root of the user's JSON)
export interface RecordingSession {
  title: string;
  description: string;
  url: string; // Initial URL
  steps: Step[];
  device_screen_emulation?: {
    width: number;
    height: number;
    deviceScaleFactor: number;
    mobile: boolean;
    userAgent: string;
  };
}
