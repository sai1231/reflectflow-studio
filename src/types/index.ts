
export type StepType =
  | 'navigate'
  | 'click'
  | 'type'
  | 'scroll'
  | 'waitForElement' // Used for assertions and explicit waits
  | 'action'; // Generic action for things like doubleClick, clearValue, moveTo

// Base for all steps
interface BaseStep {
  id: string;
  type: StepType;
  description: string;
  selector?: string; // Primary selector, for simplicity in some contexts. Full list in selectors array.
  selectors?: string[]; // Comprehensive list of selectors
  target?: string; // e.g., 'main' or iframe ID
  timeout?: number; // In milliseconds
}

// Specific step properties
export interface NavigateStep extends BaseStep {
  type: 'navigate';
  url: string;
}

export interface ClickStep extends BaseStep {
  type: 'click';
  // selectors array from BaseStep is primary
  offsetX?: number;
  offsetY?: number;
  button?: 'primary' | 'auxiliary' | 'secondary';
  duration?: number;
}

export interface TypeStep extends BaseStep {
  type: 'type';
  value: string; // Text to type or value for 'addValue'
  // selectors array from BaseStep is primary
  params?: {
    operation?: 'set' | 'add'; // For distinguishing between setValue and addValue
  };
}

export interface ScrollStep extends BaseStep {
  type: 'scroll';
  // selectors array from BaseStep can be target element or undefined for viewport scroll
  x?: number; // Horizontal scroll position (if viewport)
  y?: number; // Vertical scroll position (if viewport)
}

export interface WaitForElementStepProperty {
  name: string; // e.g., 'visible', 'enabled', 'clickable', 'existing', 'textContent', 'attribute:data-testid', 'value'
  expectedValue: string | number | boolean;
  operator?: '==' | '!=' | '<' | '>' | '<=' | '>=' | 'contains' | 'not-contains';
}

export interface WaitForElementStep extends BaseStep {
  type: 'waitForElement';
  // selectors array from BaseStep is primary
  properties: WaitForElementStepProperty[]; // Defines what to assert or wait for
  // 'waitType' can be inferred from property names or be explicit if needed
}

export interface ActionStep extends BaseStep {
  type: 'action';
  // selectors array from BaseStep is primary
  subAction: // Specific WebDriver classic actions
    | 'doubleClick'
    | 'clearValue'
    | 'moveTo'
    // Potentially others: dragAndDrop, contextClick, etc.
    | 'getSize' // Could also be an assertion
    | 'getLocation'; // Could also be an assertion
  params?: Record<string, any>; // For additional parameters like coordinates for moveTo
}


// Union type for all possible steps
export type Step =
  | NavigateStep
  | ClickStep
  | TypeStep
  | ScrollStep
  | WaitForElementStep
  | ActionStep;

