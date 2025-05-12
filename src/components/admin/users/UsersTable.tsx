
import React from 'react';
import { User, Shield, Calendar, Clock, Briefcase, Phone, MapPin } from 'lucide-react';
import { UserData } from '@/hooks/admin/use-user-management';
import { UserRoleSelector } from './UserRoleSelector';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UsersTableProps {
  users: UserData[];
  onRoleChange: (userId: string, role: string) => void;
}

export const UsersTable = ({ users, onRoleChange }: UsersTableProps) => {
  // Function to get badge color based on role
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'staff':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get user icon based on role
  const getUserIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5 text-purple-500" />;
      case 'staff':
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      default:
        return <User className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="hidden md:table-cell">Contact</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            <TableHead className="hidden lg:table-cell">Last Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {getUserIcon(user.role)}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{user.email}</div>
                  {user.first_name && user.last_name && (
                    <div className="text-sm text-muted-foreground">
                      {user.first_name} {user.last_name}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={`${getRoleBadgeColor(user.role)}`}>
                    {user.role || 'customer'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.phone ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-3 w-3 mr-1" />
                      {user.phone}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No phone</span>
                  )}
                  
                  {user.location_id && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      Location assigned
                    </div>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(user.created_at)}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(user.last_sign_in_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <UserRoleSelector 
                          currentRole={user.role || 'customer'}
                          userId={user.id}
                          onRoleChange={onRoleChange}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Change user's role and permissions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
