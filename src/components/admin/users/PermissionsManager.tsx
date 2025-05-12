
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Shield, Users, Briefcase, UserCog } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Permission {
  role: string;
  customer_access: boolean;
  staff_access: boolean;
  admin_access: boolean;
}

export const PermissionsManager = () => {
  const queryClient = useQueryClient();
  
  // Fetch role permissions
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('*');
        
        if (error) throw error;
        
        // If no permissions exist yet, return default ones
        if (!data || data.length === 0) {
          return [
            { role: 'customer', customer_access: true, staff_access: false, admin_access: false },
            { role: 'staff', customer_access: true, staff_access: true, admin_access: false },
            { role: 'admin', customer_access: true, staff_access: true, admin_access: true }
          ];
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching permissions:', error);
        // Return default permissions if fetching fails
        return [
          { role: 'customer', customer_access: true, staff_access: false, admin_access: false },
          { role: 'staff', customer_access: true, staff_access: true, admin_access: false },
          { role: 'admin', customer_access: true, staff_access: true, admin_access: true }
        ];
      }
    },
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ role, field, value }: { role: string; field: string; value: boolean }) => {
      // Check if permission exists
      const { data: existingPermission, error: checkError } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role', role)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        // Error other than "no rows returned"
        throw checkError;
      }
      
      if (existingPermission) {
        // Update existing permission
        const { error } = await supabase
          .from('role_permissions')
          .update({ [field]: value })
          .eq('role', role);
          
        if (error) throw error;
      } else {
        // Insert new permission with defaults
        const newPermission: any = {
          role,
          customer_access: field === 'customer_access' ? value : true,
          staff_access: field === 'staff_access' ? value : false,
          admin_access: field === 'admin_access' ? value : false
        };
        
        const { error } = await supabase
          .from('role_permissions')
          .insert(newPermission);
          
        if (error) throw error;
      }
      
      return { role, field, value };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast({
        title: 'Permissions updated',
        description: 'Role permissions have been updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permissions',
        variant: 'destructive',
      });
    }
  });

  const handlePermissionChange = (role: string, field: string, checked: boolean) => {
    updatePermissionMutation.mutate({ role, field, value: checked });
  };

  const getIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-5 w-5 text-purple-500" />;
      case 'staff':
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      default:
        return <Users className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          Role-Based Access Control
        </CardTitle>
        <CardDescription>
          Configure which pages different user roles can access
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Role</TableHead>
                <TableHead>Customer Pages</TableHead>
                <TableHead>Staff Pages</TableHead>
                <TableHead>Admin Pages</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.role}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getIcon(permission.role)}
                      <span className="capitalize">{permission.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Checkbox 
                      checked={permission.customer_access}
                      onCheckedChange={(checked) => handlePermissionChange(permission.role, 'customer_access', !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox 
                      checked={permission.staff_access}
                      onCheckedChange={(checked) => handlePermissionChange(permission.role, 'staff_access', !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox 
                      checked={permission.admin_access}
                      onCheckedChange={(checked) => handlePermissionChange(permission.role, 'admin_access', !!checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
