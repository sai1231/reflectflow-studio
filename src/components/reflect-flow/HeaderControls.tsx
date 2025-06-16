
"use client";

import { Button } from '@/components/ui/button';
import { RecordIcon, PauseIcon, SaveIcon, TargetIcon, ChevronUpIcon, ChevronDownIcon, DownloadIcon } from './icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  onSaveSession: () => void;
  onExportSession: () => void; // New prop
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
  onExportSession, // Destructure new prop
  stepCount,
  isElementSelectorActive,
  onToggleElementSelector,
  isPanelCollapsed,
  onTogglePanelCollapse,
}: HeaderControlsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggleRecording}
                variant={isRecording ? "destructive" : "default"}
                size="sm"
                className={isPanelCollapsed ? "w-9 h-9 p-0" : "w-auto px-3"}
              >
                {isRecording ? <PauseIcon className="h-4 w-4" /> : <RecordIcon className="h-4 w-4" />}
                {!isPanelCollapsed && <span className="ml-2">{isRecording ? 'Pause' : 'Record'}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRecording ? 'Pause current recording' : 'Start new recording'}</p>
            </TooltipContent>
          </Tooltip>

          {!isPanelCollapsed && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onSaveSession} variant="outline" size="sm" disabled={isRecording || stepCount === 0}>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save current session to Local Storage</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onExportSession} variant="outline" size="sm" disabled={isRecording || stepCount === 0}>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export session as JSON file</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggleElementSelector}
                variant={isElementSelectorActive ? "secondary" : "outline"}
                size="icon"
                className="h-9 w-9"
                disabled={isRecording && !isPanelCollapsed}
              >
                <TargetIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isElementSelectorActive ? 'Deactivate Element Selector' : 'Activate Element Selector'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onTogglePanelCollapse} variant="ghost" size="icon" className="h-9 w-9">
              {isPanelCollapsed ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronUpIcon className="h-5 w-5" />}
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
