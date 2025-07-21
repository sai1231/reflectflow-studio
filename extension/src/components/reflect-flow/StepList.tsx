
"use client";

import type { Step } from '@/types';
import { StepItem } from './StepItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface StepListProps {
  steps: Step[];
  onUpdateStep: (step: Step) => void;
  onDeleteStep: (id: string) => void;
  newlyAddedStepId: string | null;
  onStepDetermined: (id: string) => void;
  onReorderSteps: (oldIndex: number, newIndex: number) => void;
  onPickSelectorForStep: (stepId: string) => void;
}

export function StepList({ steps, onUpdateStep, onDeleteStep, newlyAddedStepId, onStepDetermined, onReorderSteps, onPickSelectorForStep }: StepListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((step) => step.id === active.id);
      const newIndex = steps.findIndex((step) => step.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderSteps(oldIndex, newIndex);
      }
    }
  }

  if (steps.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 min-h-0">
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={steps.map(step => step.id)}
        strategy={verticalListSortingStrategy}
      >
        <ScrollArea className="h-full w-full">
          <div className="p-1 space-y-1">
            {steps.map((step) => (
              <StepItem
                key={step.id}
                step={step}
                onUpdateStep={onUpdateStep}
                onDeleteStep={onDeleteStep}
                initialExpanded={step.id === newlyAddedStepId || step.type === 'undetermined'}
                onCommandSelected={() => onStepDetermined(step.id)}
                onPickSelectorForStep={onPickSelectorForStep}
              />
            ))}
          </div>
        </ScrollArea>
      </SortableContext>
    </DndContext>
  );
}
