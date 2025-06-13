"use client";

import { Button } from '@/components/ui/button';
import { RecordIcon, PauseIcon, PlayIcon, AssertIcon, SaveIcon } from './icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  onPlayAll: () => void;
  onAddAssertion: () => void;
  onSaveSession: () => void;
  stepCount: number;
}

export function HeaderControls({
  isRecording,
  onToggleRecording,
  onPlayAll,
  onAddAssertion,
  onSaveSession,
  stepCount
}: HeaderControlsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onToggleRecording} variant={isRecording ? "destructive" : "default"} size="sm" className="w-28">
              {isRecording ? <PauseIcon className="mr-2 h-4 w-4" /> : <RecordIcon className="mr-2 h-4 w-4" />}
              {isRecording ? 'Pause' : 'Record'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isRecording ? 'Pause current recording' : 'Start new recording'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onPlayAll} variant="outline" size="sm" disabled={isRecording || stepCount === 0}>
              <PlayIcon className="mr-2 h-4 w-4" />
              Play All
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Play all recorded steps</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onAddAssertion} variant="outline" size="sm" disabled={isRecording}>
              <AssertIcon className="mr-2 h-4 w-4" />
              Assertion
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add an assertion step</p>
          </TooltipContent>
        </Tooltip>

         <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onSaveSession} variant="outline" size="sm" disabled={isRecording || stepCount === 0}>
              <SaveIcon className="mr-2 h-4 w-4" />
              Save
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save current session (simulated)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
