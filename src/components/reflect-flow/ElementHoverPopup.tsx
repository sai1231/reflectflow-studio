
"use client";

import type React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import {
  ClickIcon,
  TypeActionIcon,
  ScrollIcon,
  WaitIcon,
  AssertionIcon,
  ActionIcon,
  ViewIcon,
  GetTextIcon,
  GetAttributeIcon,
  IsEnabledIcon,
  IsExistingIcon,
  AddValueIcon,
  ClearValueIcon,
  DoubleClickIcon, // Assuming this exists or is similar to ClickIcon
  MoveToIcon,
  GetSizeIcon,
  GetLocationIcon,
  PlayIcon, // For Wait For Stable (placeholder)
  // XIcon, // No longer needed for an internal close button
} from './icons'; // Ensure these icons are correctly mapped or new ones added

interface ElementInfo {
  id?: string;
  cssSelector?: string;
  xpath?: string;
  tagName?: string;
}

interface ElementHoverPopupProps {
  elementInfo: ElementInfo | null;
  isOpen: boolean;
  onCommandSelected: (command: string, targetElementInfo: ElementInfo) => void;
  position: { top: number; left: number } | null;
  onClose: () => void;
}

export function ElementHoverPopup({ elementInfo, isOpen, onCommandSelected, position, onClose }: ElementHoverPopupProps) {
  if (!isOpen || !position || !elementInfo) {
    return null;
  }

  const handleSelect = (command: string) => {
    onCommandSelected(command, elementInfo);
    onClose();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DropdownMenuTrigger
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none', // Make sure it doesn't interfere with other interactions
        }}
        aria-hidden="true"
      />
      <DropdownMenuPortal>
        <DropdownMenuContent
          className="w-64"
          align="start" // Adjust as needed, might want to calculate based on position
          sideOffset={5}
          style={{
            // Overriding transform to position absolutely based on 'position' prop
            // This is a bit of a hack if Radix positions it relative to trigger via transform
            // A more robust way might be to ensure trigger is at position and let Radix handle it.
            // For now, let's try with default Radix positioning relative to the fixed trigger.
          }}
          onCloseAutoFocus={(e) => e.preventDefault()} // Prevent focus shift on close
        >
          <DropdownMenuLabel>Element Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Actions Sub Menu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ActionIcon className="mr-2 h-4 w-4" /> Actions
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => handleSelect('actionClick')}>
                  <ClickIcon className="mr-2 h-4 w-4" /> Click
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('actionDoubleClick')}>
                  <DoubleClickIcon className="mr-2 h-4 w-4" /> Double Click
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('actionSetValue')}>
                  <TypeActionIcon className="mr-2 h-4 w-4" /> Set Value (Type Text)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('actionAddValue')}>
                  <AddValueIcon className="mr-2 h-4 w-4" /> Add Value
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('actionClearValue')}>
                  <ClearValueIcon className="mr-2 h-4 w-4" /> Clear Value
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('actionScrollIntoView')}>
                  <ScrollIcon className="mr-2 h-4 w-4" /> Scroll into View
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('actionMoveTo')}>
                  <MoveToIcon className="mr-2 h-4 w-4" /> Move To
                </DropdownMenuItem>
                {/* Add other actions like dragAndDrop, execute, saveScreenshot etc. here */}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Assertions Sub Menu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <AssertionIcon className="mr-2 h-4 w-4" /> Assertions
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => handleSelect('assertIsVisible')}>
                  <ViewIcon className="mr-2 h-4 w-4" /> Is Visible
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('assertGetText')}>
                  <GetTextIcon className="mr-2 h-4 w-4" /> Get Text
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('assertGetAttribute')}>
                  <GetAttributeIcon className="mr-2 h-4 w-4" /> Get Attribute
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('assertIsEnabled')}>
                  <IsEnabledIcon className="mr-2 h-4 w-4" /> Is Enabled
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('assertIsExisting')}>
                  <IsExistingIcon className="mr-2 h-4 w-4" /> Is Existing
                </DropdownMenuItem>
                 <DropdownMenuItem onSelect={() => handleSelect('assertGetSize')}>
                  <GetSizeIcon className="mr-2 h-4 w-4" /> Get Size
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('assertGetLocation')}>
                  <GetLocationIcon className="mr-2 h-4 w-4" /> Get Location
                </DropdownMenuItem>
                {/* Add other assertions like getCSSProperty, isEqual, etc. here */}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Wait Sub Menu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <WaitIcon className="mr-2 h-4 w-4" /> Wait For
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onSelect={() => handleSelect('waitForVisible')}>
                  <ViewIcon className="mr-2 h-4 w-4" /> Visible
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('waitForClickable')}>
                  <ClickIcon className="mr-2 h-4 w-4" /> Clickable
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('waitForEnabled')}>
                  <IsEnabledIcon className="mr-2 h-4 w-4" /> Enabled
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('waitForExist')}>
                  <IsExistingIcon className="mr-2 h-4 w-4" /> Exist
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSelect('waitForStable')}>
                  <PlayIcon className="mr-2 h-4 w-4" /> Stable
                </DropdownMenuItem>
                {/* Add other waits like waitUntil etc. here */}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
