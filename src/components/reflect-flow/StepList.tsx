
"use client";

import type { Step } from '@/types';
import { StepItem } from './StepItem';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StepListProps {
  steps: Step[];
  selectedSteps: string[];
  onSelectStep: (id: string, selected: boolean) => void;
  onUpdateStep: (step: Step) => void;
  onDeleteStep: (id: string) => void;
  newlyAddedStepId: string | null;
  onStepDetermined: (id: string) => void;
}

export function StepList({ steps, selectedSteps, onSelectStep, onUpdateStep, onDeleteStep, newlyAddedStepId, onStepDetermined }: StepListProps) {
  if (steps.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground p-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 mb-4">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
          <path d="M12 8l-2.5 2.5"></path><path d="M12 8l2.5 2.5"></path>
          <path d="M12 12v-4"></path>
          <path d="M14.5 14.5L12 12"></path>
          <path d="M9.5 14.5L12 12"></path>
        </svg>
        <p className="text-center">No steps recorded yet.</p>
        <p className="text-center text-sm">Click "Record" or "Add Step" to begin.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-grow min-h-0">
      <div className="p-1 space-y-1">
        {steps.map((step, index) => (
          <StepItem
            key={step.id}
            step={step}
            isSelected={selectedSteps.includes(step.id)}
            onSelect={onSelectStep}
            onUpdateStep={onUpdateStep}
            onDeleteStep={onDeleteStep}
            initialExpanded={step.id === newlyAddedStepId || step.type === 'undetermined'}
            onCommandSelected={() => onStepDetermined(step.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
