import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

interface MissingItem {
  category: string;
  items: string[];
}

interface MissingReferencePlaceholderProps {
  title?: string;
  description?: string;
  missingItems: MissingItem[];
}

export function MissingReferencePlaceholder({
  title = 'Reference Materials Required',
  description = 'This section cannot be implemented without reference materials from the Moritz Care Home application.',
  missingItems,
}: MissingReferencePlaceholderProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-muted p-3">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Reference Materials</AlertTitle>
          <AlertDescription>
            To implement this section accurately, we need the following information from the Moritz Care Home
            application:
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {missingItems.map((section, index) => (
            <div key={index} className="rounded-lg border bg-card p-4">
              <h4 className="mb-2 font-semibold text-foreground">{section.category}</h4>
              <ul className="space-y-1.5 pl-5">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="list-disc text-sm text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button asChild>
            <Link to="/moritz-reference">
              <FileQuestion className="mr-2 h-4 w-4" />
              View Complete Reference Checklist
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
