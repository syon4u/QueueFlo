
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UserSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export const UserSearchBox = ({ value, onChange }: UserSearchBoxProps) => {
  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search users by email..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
};
