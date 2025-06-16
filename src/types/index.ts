
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
  | 'undetermined'; // Added for newly added steps before command selection

// Base for all steps
interface BaseStep {
  id: string;
  type: StepType;
  description: string;
  selectors?: string[]; 
  selector?: string; 
  target?: string; 
  timeout?: number; 
}

// Specific step properties
export interface NavigateStep extends BaseStep {
  type: 'navigate';
  url: string;
}

export interface ClickStep extends BaseStep {
  type: 'click';
}

export interface DoubleClickStep extends BaseStep {
  type: 'doubleClick';
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
  x?: number; 
  y?: number; 
}

export interface WaitForElementStep extends BaseStep {
  type: 'waitForElement';
  property?: string; 
  operator?: '==' | '!=' | '<' | '>' | '<=' | '>=' | 'contains' | 'not-contains' | 'exists' | 'stable' | 'clickable';
  expectedValue?: string | number | boolean; 
}

export interface MoveToStep extends BaseStep {
  type: 'moveTo';
}

// For newly added steps before command selection
export interface UndeterminedStep extends BaseStep {
  type: 'undetermined';
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
  | MoveToStep
  | UndeterminedStep;

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
