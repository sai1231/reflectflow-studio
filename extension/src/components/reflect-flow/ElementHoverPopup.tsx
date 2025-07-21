
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
  DropdownMenuPortal,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { availableCommands, type CommandInfo } from '@/lib/commands';
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
  DoubleClickIcon,
  MoveToIcon,
  GetSizeIcon,
  GetLocationIcon,
  FileCodeIcon,
  TagsIcon,
  HelpCircleIcon,
  ChevronsUpDownIcon,
  HandIcon,
  ListChecksIcon,
  GetPropertyIcon,
  Sigma,
  CheckCircle2,
  PlayIcon,
} from './icons';

interface ElementInfo {
  id?: string;
  cssSelector?: string;
  xpath?: string;
  tagName?: string;
}

interface ElementHoverPopupProps {
  elementInfo: ElementInfo | null;
  isOpen: boolean;
  onCommandSelected: (commandKey: string, targetElementInfo: ElementInfo) => void;
  position: { top: number; left: number } | null;
  onClose: () => void;
}

const getIconForCommandKey = (key: string): React.ElementType => {
  switch (key) {
    case 'click': return ClickIcon;
    case 'doubleClick': return DoubleClickIcon;
    case 'setValue': return TypeActionIcon;
    case 'addValue': return AddValueIcon;
    case 'clearValue': return ClearValueIcon;
    case 'scrollIntoView': return ScrollIcon;
    case 'moveTo': return MoveToIcon;
    case 'dragAndDrop': return HandIcon;
    case 'touchAction': return HandIcon;

    case 'getAttribute': return GetAttributeIcon;
    case 'getCSSProperty': return GetPropertyIcon;
    case 'getComputedLabel': return Sigma;
    case 'getComputedRole': return Sigma;
    case 'getElement': return IsExistingIcon; // Represents finding/getting an element
    case 'getElements': return IsExistingIcon; // Represents finding/getting elements
    case 'getHTML': return FileCodeIcon;
    case 'getLocation': return GetLocationIcon;
    case 'getProperty': return GetPropertyIcon;
    case 'getSize': return GetSizeIcon;
    case 'getTagName': return TagsIcon;
    case 'getText': return GetTextIcon;
    case 'getValue': return TypeActionIcon; // Reusing, could be more specific if needed

    case 'isClickable': return ClickIcon; // Related to clickability
    case 'isDisplayed': return ViewIcon;
    case 'isEnabled': return IsEnabledIcon;
    case 'isEqual': return ChevronsUpDownIcon;
    case 'isExisting': return IsExistingIcon;
    case 'isFocused': return CheckCircle2;
    case 'isSelected': return CheckCircle2;
    case 'isStable': return PlayIcon; // Reusing

    case 'nextElement': return Sigma; // Placeholder, could be specific arrow
    case 'parentElement': return Sigma; // Placeholder
    case 'previousElement': return Sigma; // Placeholder

    case 'selectByAttribute': case 'selectByIndex': case 'selectByVisibleText': return ListChecksIcon;

    case 'waitForClickable': return ClickIcon;
    case 'waitForDisplayed': return ViewIcon;
    case 'waitForEnabled': return IsEnabledIcon;
    case 'waitForExist': return IsExistingIcon;
    case 'waitForStable': return PlayIcon;
    default: return HelpCircleIcon;
  }
};

const elementCommands = availableCommands.filter(cmd => cmd.isElementCommand);

const actionCommands = elementCommands.filter(cmd =>
  ['click', 'doubleClick', 'setValue', 'addValue', 'clearValue', 'scrollIntoView', 'moveTo', 'dragAndDrop', 'selectByAttribute', 'selectByIndex', 'selectByVisibleText', 'touchAction'].includes(cmd.key)
);

const fetchingCommands = elementCommands.filter(cmd =>
  ['getAttribute', 'getCSSProperty', 'getComputedLabel', 'getComputedRole', 'getElement', 'getElements', 'getHTML', 'getLocation', 'getProperty', 'getSize', 'getTagName', 'getText', 'getValue', 'nextElement', 'parentElement', 'previousElement'].includes(cmd.key)
);

const assertionCommands = elementCommands.filter(cmd =>
  ['isClickable', 'isDisplayed', 'isEnabled', 'isEqual', 'isExisting', 'isFocused', 'isSelected', 'isStable'].includes(cmd.key)
);

const waitCommands = elementCommands.filter(cmd =>
  ['waitForClickable', 'waitForDisplayed', 'waitForEnabled', 'waitForExist', 'waitForStable'].includes(cmd.key)
);


export function ElementHoverPopup({ elementInfo, isOpen, onCommandSelected, position, onClose }: ElementHoverPopupProps) {
  if (!isOpen || !position || !elementInfo) {
    return null;
  }

  const handleSelect = (commandKey: string) => {
    onCommandSelected(commandKey, elementInfo);
    onClose();
  };

  const renderCommandItems = (commands: CommandInfo[]) => {
    return commands.map(cmd => {
      const IconComponent = getIconForCommandKey(cmd.key);
      return (
        <DropdownMenuItem key={cmd.key} onSelect={() => handleSelect(cmd.key)}>
          <IconComponent className="mr-2 h-4 w-4" /> {cmd.badgeLabel}
        </DropdownMenuItem>
      );
    });
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
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      <DropdownMenuPortal>
        <DropdownMenuContent
          className="w-64 z-[10002]"
          align="start"
          sideOffset={5}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel>Element Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {actionCommands.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ActionIcon className="mr-2 h-4 w-4" /> Actions
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="z-[10003]">
                  {renderCommandItems(actionCommands)}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}

          {fetchingCommands.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <GetTextIcon className="mr-2 h-4 w-4" /> Fetching
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="z-[10003]">
                  {renderCommandItems(fetchingCommands)}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}

          {assertionCommands.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <AssertionIcon className="mr-2 h-4 w-4" /> Assertions
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="z-[10003]">
                  {renderCommandItems(assertionCommands)}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}

          {waitCommands.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <WaitIcon className="mr-2 h-4 w-4" /> Wait For
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="z-[10003]">
                  {renderCommandItems(waitCommands)}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}

        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
