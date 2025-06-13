
"use client";

import { Button } from '@/components/ui/button';
import { RecordIcon, PauseIcon, SaveIcon, TargetIcon, CollapsePanelIcon, ExpandPanelIcon } from './icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  onSaveSession: () => void;
  stepCount: number;
  isElementSelectorActive: boolean;
  onToggleElementSelector: () => void;
  isPanelCollapsed: boolean;
  onTogglePanelCollapse: () => void;
}

export function HeaderControls({
  isRecording,
  onToggleRecording,
  onSaveSession,
  stepCount,
  isElementSelectorActive,
  onToggleElementSelector,
  isPanelCollapsed,
  onTogglePanelCollapse,
}: HeaderControlsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onToggleRecording} 
              variant={isRecording ? "destructive" : "default"} 
              size="sm" 
              className={isPanelCollapsed ? "w-9 h-9 p-0" : "w-28"}
            >
              {isRecording ? <PauseIcon className={isPanelCollapsed ? "h-4 w-4" : "mr-2 h-4 w-4"} /> : <RecordIcon className={isPanelCollapsed ? "h-4 w-4" : "mr-2 h-4 w-4"} />}
              {!isPanelCollapsed && (isRecording ? 'Pause' : 'Record')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isRecording ? 'Pause current recording' : 'Start new recording'}</p>
          </TooltipContent>
        </Tooltip>

        {!isPanelCollapsed && (
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
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onToggleElementSelector} 
              variant={isElementSelectorActive ? "secondary" : "outline"} 
              size="icon" 
              className="h-9 w-9"
              disabled={isRecording && !isPanelCollapsed} // Disable if recording unless panel is collapsed (then record might be icon only)
            >
              <TargetIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isElementSelectorActive ? 'Deactivate Element Selector' : 'Activate Element Selector'}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onTogglePanelCollapse} variant="ghost" size="icon" className="h-9 w-9">
              {isPanelCollapsed ? <ExpandPanelIcon className="h-4 w-4" /> : <CollapsePanelIcon className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPanelCollapsed ? 'Expand Panel' : 'Collapse Panel'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
