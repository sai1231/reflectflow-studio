
"use client";

import { Button } from '@/components/ui/button';
import { RecordIcon, PauseIcon, SaveIcon, TargetIcon } from './icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  onSaveSession: () => void;
  stepCount: number;
  isElementSelectorActive: boolean;
  onToggleElementSelector: () => void;
}

export function HeaderControls({
  isRecording,
  onToggleRecording,
  onSaveSession,
  stepCount,
  isElementSelectorActive,
  onToggleElementSelector,
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
            <Button 
              onClick={onToggleElementSelector} 
              variant={isElementSelectorActive ? "secondary" : "outline"} 
              size="icon" 
              className="h-9 w-9" // Adjusted size for icon button
            >
              <TargetIcon className="h-4 w-4" /> {/* Icon only */}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isElementSelectorActive ? 'Deactivate Element Selector' : 'Activate Element Selector'}</p>
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
