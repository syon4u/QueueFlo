
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserRoleSelectorProps {
  currentRole: string;
  userId: string;
  onRoleChange: (userId: string, role: string) => void;
}

export const UserRoleSelector = ({ 
  currentRole, 
  userId, 
  onRoleChange 
}: UserRoleSelectorProps) => {
  return (
    <Select
      defaultValue={currentRole || 'customer'}
      onValueChange={(value) => onRoleChange(userId, value)}
    >
      <SelectTrigger className="w-[130px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="customer">Customer</SelectItem>
        <SelectItem value="staff">Staff</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
};
