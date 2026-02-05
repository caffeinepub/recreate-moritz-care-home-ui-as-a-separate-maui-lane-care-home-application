import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import { Resident } from '@/pages/maui/residents/mockResidents';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

interface ResidentCardProps {
  resident: Resident;
}

export function ResidentCard({ resident }: ResidentCardProps) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate({ to: '/resident/$residentId', params: { residentId: String(resident.id) } });
  };

  const handleDischarge = () => {
    toast.info(`Discharge action for ${resident.name}`);
  };

  const handleDelete = () => {
    toast.info(`Delete action for ${resident.name}`);
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{resident.name}</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {resident.room}
              </Badge>
              <Badge
                variant={resident.status === 'Active' ? 'default' : 'outline'}
                className="gap-1 text-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {resident.status}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Age: {resident.age} years • ID: {resident.id}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Physicians</p>
            <p className="text-2xl font-bold text-foreground">{resident.physicians}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Medications</p>
            <p className="text-2xl font-bold text-foreground">{resident.medications}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleViewProfile}>
            <Eye className="h-4 w-4" />
            View Profile
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDischarge}>
            Discharge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
