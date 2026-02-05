import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, ArrowUpDown } from 'lucide-react';

interface ResidentFilterSortBarProps {
  rooms: string[];
  selectedRoom: string;
  onRoomChange: (room: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function ResidentFilterSortBar({
  rooms,
  selectedRoom,
  onRoomChange,
  sortBy,
  onSortChange,
}: ResidentFilterSortBarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Filter by Room:</span>
        <Select value={selectedRoom} onValueChange={onRoomChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room} value={room}>
                {room}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Sort by:</span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="room">Room Number & Bed</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="age">Age</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
