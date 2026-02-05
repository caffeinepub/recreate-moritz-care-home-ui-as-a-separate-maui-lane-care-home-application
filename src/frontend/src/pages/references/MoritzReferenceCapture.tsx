import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Camera, Link as LinkIcon, Palette, Layout } from 'lucide-react';

export function MoritzReferenceCapture() {
  const referenceCategories = [
    {
      id: 'overview',
      title: 'Application Overview',
      icon: Layout,
      status: 'required',
      items: [
        'Full application URL or access instructions',
        'Login credentials (if needed for reference capture)',
        'Overall application structure and navigation flow',
        'List of all main pages/routes in the application',
      ],
    },
    {
      id: 'dashboard',
      title: 'Dashboard / Home Page',
      icon: Layout,
      status: 'required',
      items: [
        'Full-page screenshot of the dashboard in desktop view',
        'Mobile/tablet responsive views if applicable',
        'All visible widgets, cards, and content sections',
        'Navigation menu (expanded and collapsed states)',
        'Header and footer content',
      ],
    },
    {
      id: 'pages',
      title: 'Additional Pages',
      icon: Camera,
      status: 'required',
      items: [
        'Screenshots of all major pages (residents, staff, facilities, etc.)',
        'Detail views (e.g., individual resident profile, facility details)',
        'List/grid views with multiple items',
        'Empty states (what shows when no data exists)',
      ],
    },
    {
      id: 'forms',
      title: 'Forms & Data Entry',
      icon: Camera,
      status: 'required',
      items: [
        'All form layouts (create, edit, search)',
        'Input field types and validation messages',
        'Form submission success/error states',
        'Multi-step forms or wizards (if any)',
      ],
    },
    {
      id: 'interactions',
      title: 'Interactive Elements',
      icon: Camera,
      status: 'required',
      items: [
        'Modal/dialog designs',
        'Dropdown menus and select inputs',
        'Buttons in all states (default, hover, active, disabled)',
        'Tooltips and popovers',
        'Loading indicators and progress bars',
      ],
    },
    {
      id: 'design',
      title: 'Design System Details',
      icon: Palette,
      status: 'required',
      items: [
        'Color palette (primary, secondary, accent colors)',
        'Typography (font families, sizes, weights)',
        'Spacing and layout grid system',
        'Border radius and shadow styles',
        'Icon set used throughout the application',
      ],
    },
    {
      id: 'data',
      title: 'Data & Content Examples',
      icon: Camera,
      status: 'optional',
      items: [
        'Sample data shown in tables and lists',
        'Text content and copy used in the UI',
        'Image placeholders or actual images used',
        'Chart and graph examples (if any)',
      ],
    },
    {
      id: 'special',
      title: 'Special Features',
      icon: Camera,
      status: 'optional',
      items: [
        'Calendar or scheduling interfaces',
        'File upload/download interfaces',
        'Print views or export functionality',
        'Settings or configuration pages',
        'User profile and account management',
      ],
    },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Moritz Care Home Reference Capture</h1>
        <p className="text-muted-foreground">
          To accurately recreate the Moritz Care Home UI for Maui Lane Care Home, we need comprehensive
          reference materials. This page outlines all required screenshots, design details, and information.
        </p>
      </div>

      <Alert className="mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>How to Provide References</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            <li>Take high-resolution screenshots of each page and component state</li>
            <li>Include both desktop and mobile views where applicable</li>
            <li>Capture interactive states (hover, active, disabled) when possible</li>
            <li>Document color codes, font names, and spacing measurements</li>
            <li>Provide URLs or navigation paths for each page</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Reference Checklist</CardTitle>
          <CardDescription>
            Expand each section below to see the detailed list of required reference materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {referenceCategories.map((category) => {
              const Icon = category.icon;
              return (
                <AccordionItem key={category.id} value={category.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{category.title}</span>
                      <Badge variant={category.status === 'required' ? 'default' : 'secondary'}>
                        {category.status}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pl-8">
                      {category.items.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Screenshot Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Resolution:</strong> Capture at actual size (100% zoom) for accurate measurements
            </p>
            <p>
              <strong>Format:</strong> PNG or JPEG with high quality settings
            </p>
            <p>
              <strong>Naming:</strong> Use descriptive names (e.g., "dashboard-desktop.png",
              "resident-profile-modal.png")
            </p>
            <p>
              <strong>States:</strong> Capture different states of interactive elements separately
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>URLs:</strong> Document the URL path for each page/view
            </p>
            <p>
              <strong>Interactions:</strong> Note any animations, transitions, or hover effects
            </p>
            <p>
              <strong>Responsive:</strong> Indicate breakpoints where layout changes occur
            </p>
            <p>
              <strong>Accessibility:</strong> Note any accessibility features (ARIA labels, keyboard navigation)
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert className="mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Next Steps</AlertTitle>
        <AlertDescription>
          Once reference materials are provided, the Maui Lane Care Home UI will be implemented to match the
          Moritz Care Home design while maintaining Maui Lane branding (name, logo, colors).
        </AlertDescription>
      </Alert>
    </div>
  );
}
