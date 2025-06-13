export type ActionType = 'click' | 'type' | 'navigate' | 'scroll' | 'submit' | 'assert';

export interface Step {
  id: string;
  type: ActionType;
  selector?: string;
  value?: string; // For 'type' action, URL for 'navigate', scroll coordinates, assertion value
  description: string;
  params?: Record<string, any>; // For assertions or complex actions, e.g. { property: "textContent", expected: "Welcome" }
}
