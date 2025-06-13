"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyIcon } from './icons';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

interface ElementHoverPopupProps {
  elementInfo: {
    id?: string;
    cssSelector?: string;
    xpath?: string;
  };
  isVisible: boolean;
}

export function ElementHoverPopup({ elementInfo, isVisible }: ElementHoverPopupProps) {
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

  return (
    <Card className="fixed bottom-4 left-4 w-80 shadow-2xl z-50 bg-card/95 backdrop-blur-sm">
      <CardHeader className="p-3">
        <CardTitle className="text-base flex justify-between items-center">
          Element Inspector
          <Badge variant="secondary" className="font-normal">Mock</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 text-sm space-y-2">
        <div>
          <strong className="text-xs text-muted-foreground block">Preferred:</strong>
          <div className="flex items-center justify-between">
            <span className="truncate font-mono bg-muted px-1 py-0.5 rounded text-xs" title={preferredSelector}>{preferredSelector}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(preferredSelector, "Preferred Selector")}>
              <CopyIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {elementInfo.id && (
          <div>
            <strong className="text-xs text-muted-foreground block">ID:</strong>
             <div className="flex items-center justify-between">
              <span className="truncate font-mono bg-muted px-1 py-0.5 rounded text-xs" title={`#${elementInfo.id}`}>{`#${elementInfo.id}`}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(`#${elementInfo.id!}`, "ID")}>
                <CopyIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        {elementInfo.cssSelector && (
          <div>
            <strong className="text-xs text-muted-foreground block">CSS Selector:</strong>
            <div className="flex items-center justify-between">
              <span className="truncate font-mono bg-muted px-1 py-0.5 rounded text-xs" title={elementInfo.cssSelector}>{elementInfo.cssSelector}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(elementInfo.cssSelector!, "CSS Selector")}>
                <CopyIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        {elementInfo.xpath && (
          <div>
            <strong className="text-xs text-muted-foreground block">XPath:</strong>
            <div className="flex items-center justify-between">
              <span className="truncate font-mono bg-muted px-1 py-0.5 rounded text-xs" title={elementInfo.xpath}>{elementInfo.xpath}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(elementInfo.xpath!, "XPath")}>
                <CopyIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
         <p className="text-xs text-muted-foreground pt-1">This is a mock popup demonstrating element identification.</p>
      </CardContent>
    </Card>
  );
}
