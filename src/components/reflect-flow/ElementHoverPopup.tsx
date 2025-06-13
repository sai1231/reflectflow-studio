
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  CopyIcon, 
  ViewIcon, 
  TypeActionIcon, 
  ClickIcon, 
  ScrollIcon, 
  WaitIcon,
  AssertionIcon,
  ActionIcon,
  SubMenuArrowIcon 
} from './icons';
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
} from "@/components/ui/dropdown-menu";

interface ElementInfo {
  id?: string;
  cssSelector?: string;
  xpath?: string;
  tagName?: string;
}

interface ElementHoverPopupProps {
  elementInfo: ElementInfo;
  isVisible: boolean;
  onCommandSelected: (command: string, targetElementInfo: ElementInfo) => void;
}

export function ElementHoverPopup({ elementInfo, isVisible, onCommandSelected }: ElementHoverPopupProps) {
  const { toast } = useToast();

  if (!isVisible) {
    return null;
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied!", description: `${type} copied to clipboard.` });
    }).catch(err => {
      toast({ title: "Error", description: `Failed to copy ${type}.`, variant: "destructive" });
    });
  };

  const preferredSelector = elementInfo.id ? `#${elementInfo.id}` : elementInfo.cssSelector || elementInfo.xpath || 'N/A';
  const targetTag = elementInfo.tagName || 'element';

  const handleSelect = (command: string) => {
    onCommandSelected(command, elementInfo);
  };

  return (
    <Card className="fixed bottom-4 left-4 w-96 shadow-2xl z-50 bg-card/95 backdrop-blur-sm">
      <CardHeader className="p-3">
        <CardTitle className="text-base flex justify-between items-center">
          Element Inspector
          <Badge variant="secondary" className="font-normal">Mock</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 text-sm space-y-2">
        <div>
          <strong className="text-xs text-muted-foreground block">Target:</strong>
          <span className="truncate font-mono bg-muted px-1 py-0.5 rounded text-xs" title={preferredSelector}>
            {targetTag}{preferredSelector !== targetTag ? ` (${preferredSelector})` : ''}
          </span>
        </div>
        
        <div className="flex space-x-2 pt-2">
          {/* Assertions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <AssertionIcon className="mr-2 h-4 w-4" /> Add Assertion
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={5} className="w-56">
              <DropdownMenuLabel>Assertion Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleSelect('assertIsVisible')}>
                <ViewIcon className="mr-2 h-4 w-4" /> Is Visible
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleSelect('assertTextContentEquals')}>
                <TypeActionIcon className="mr-2 h-4 w-4" /> Text Content Equals...
              </DropdownMenuItem>
              {/* Add more assertion types here */}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <ActionIcon className="mr-2 h-4 w-4" /> Add Action
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={5} className="w-56">
              <DropdownMenuLabel>Action Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleSelect('actionClick')}>
                <ClickIcon className="mr-2 h-4 w-4" /> Click
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleSelect('actionTypeText')}>
                <TypeActionIcon className="mr-2 h-4 w-4" /> Type Text In...
              </DropdownMenuItem>
               <DropdownMenuItem onSelect={() => handleSelect('actionScrollIntoView')}>
                <ScrollIcon className="mr-2 h-4 w-4" /> Scroll into View
              </DropdownMenuItem>
              {/* Add more action types here */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="pt-2">
           {/* Wait For Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <WaitIcon className="mr-2 h-4 w-4" /> Add Wait
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={5} className="w-full">
              <DropdownMenuLabel>Wait Condition</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleSelect('waitForVisible')}>
                <ViewIcon className="mr-2 h-4 w-4" /> Wait For Visible
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleSelect('waitForClickable')}>
                <ClickIcon className="mr-2 h-4 w-4" /> Wait For Clickable
              </DropdownMenuItem>
              {/* Add more wait types here */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>


        <div className="pt-3 space-y-1">
          <strong className="text-xs text-muted-foreground block">Selectors:</strong>
          {elementInfo.id && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">ID:</span>
              <div className="flex items-center">
                <span className="truncate font-mono bg-muted px-1 py-0.5 rounded text-xs max-w-[180px]" title={`#${elementInfo.id}`}>{`#${elementInfo.id}`}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => copyToClipboard(`#${elementInfo.id!}`, "ID")}>
                  <CopyIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          {elementInfo.cssSelector && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">CSS:</span>
              <div className="flex items-center">
                <span className="truncate font-mono bg-muted px-1 py-0.5 rounded text-xs max-w-[180px]" title={elementInfo.cssSelector}>{elementInfo.cssSelector}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => copyToClipboard(elementInfo.cssSelector!, "CSS Selector")}>
                  <CopyIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          {elementInfo.xpath && (
            <div className="flex items-center justify-between">
               <span className="text-xs text-muted-foreground">XPath:</span>
              <div className="flex items-center">
                <span className="truncate font-mono bg-muted px-1 py-0.5 rounded text-xs max-w-[180px]" title={elementInfo.xpath}>{elementInfo.xpath}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => copyToClipboard(elementInfo.xpath!, "XPath")}>
                  <CopyIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
         <p className="text-xs text-muted-foreground pt-1">Select a command to add a step for the highlighted element.</p>
      </CardContent>
    </Card>
  );
}

