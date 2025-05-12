
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { type Database } from '@/integrations/supabase/types';

export interface UserData {
  id: string;
  email: string;
  role: string;
  created_at?: string;
  last_sign_in_at?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  location_id?: string;
}

// Define a type for user roles that matches the Supabase enum
type UserRole = Database['public']['Enums']['user_role'];

export const useUserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch all users with their roles
  const { 
    data: users = [], 
    isLoading: isLoadingUsers, 
    error: usersError 
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        // Get all auth users via staff list
        const { data: staffData, error: staffError } = await supabase
          .from('temp_staff')
          .select('id, first_name, last_name, phone, location_id, role, created_at');
        
        if (staffError) throw staffError;
        
        // Get all user_roles entries
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*');
        
        if (rolesError) throw rolesError;
        
        // Create a unified list with user details and their roles
        const mergedUsers: UserData[] = staffData.map(staff => {
          const roleRecord = userRoles?.find(r => r.user_id === staff.id);
          return {
            id: staff.id,
            email: `${staff.first_name.toLowerCase()}.${staff.last_name.toLowerCase()}@example.com`,
            role: roleRecord?.role || staff.role || 'customer',
            first_name: staff.first_name,
            last_name: staff.last_name,
            phone: staff.phone,
            location_id: staff.location_id,
            created_at: staff.created_at,
            last_sign_in_at: new Date().toISOString()
          };
        });
        
        // Add some more mock users for testing
        mergedUsers.push(
          {
            id: 'mock-admin-1',
            email: 'admin@example.com',
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User',
            created_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString()
          },
          {
            id: 'mock-staff-1',
            email: 'staff@example.com',
            role: 'staff',
            first_name: 'Staff',
            last_name: 'Member',
            created_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString()
          },
          {
            id: 'mock-customer-1',
            email: 'customer@example.com',
            role: 'customer',
            first_name: 'Regular',
            last_name: 'Customer',
            created_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString()
          }
        );
        
        return mergedUsers;
      } catch (error) {
        console.error('Error in user management:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Fetch staff members specifically
  const { 
    data: staffMembers = [], 
    isLoading: isLoadingStaff,
    error: staffError
  } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('*, locations(name)');
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching staff:', error);
        return [];
      }
    }
  });

  // Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      // First check if the user has a role record
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);
      
      if (checkError) throw checkError;
      
      if (existingRole && existingRole.length > 0) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
          
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
          
        if (error) throw error;
      }
      
      // Also update in staff table if the user exists there
      const { data: staffUser } = await supabase
        .from('temp_staff')
        .select('id')
        .eq('id', userId);
        
      if (staffUser && staffUser.length > 0) {
        await supabase
          .from('temp_staff')
          .update({ role: role as UserRole })
          .eq('id', userId);
      }
      
      return { userId, role };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: 'Role updated',
        description: `User role has been updated to ${data.role}`,
      });
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  });

  // Add temporary data for analytics
  const addTemporaryDataMutation = useMutation({
    mutationFn: async () => {
      // Add some temporary staff for analytics
      const staffData = [
        { id: 'temp-staff-1', first_name: 'John', last_name: 'Doe', role: 'staff' as UserRole, location_id: null },
        { id: 'temp-staff-2', first_name: 'Jane', last_name: 'Smith', role: 'staff' as UserRole, location_id: null },
        { id: 'temp-staff-3', first_name: 'Alex', last_name: 'Johnson', role: 'admin' as UserRole, location_id: null }
      ];

      // Insert staff data if they don't exist
      for (const staff of staffData) {
        const { error: checkError, data: existingStaff } = await supabase
          .from('temp_staff')
          .select('id')
          .eq('id', staff.id);

        if (!checkError && (!existingStaff || existingStaff.length === 0)) {
          const { error } = await supabase.from('temp_staff').insert(staff);
          if (error) throw error;
        }
      }
      
      // Add user roles for analytics
      const roleData = [
        { user_id: 'temp-staff-1', role: 'staff' },
        { user_id: 'temp-staff-2', role: 'staff' },
        { user_id: 'temp-staff-3', role: 'admin' }
      ];

      for (const role of roleData) {
        const { error: checkError, data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', role.user_id);

        if (!checkError && (!existingRole || existingRole.length === 0)) {
          const { error } = await supabase.from('user_roles').insert(role);
          if (error) throw error;
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({
        title: 'Test data added',
        description: 'Temporary data for analytics has been created',
      });
    },
    onError: (error) => {
      console.error('Error adding temporary data:', error);
      toast({
        title: 'Error',
        description: 'Failed to add temporary data',
        variant: 'destructive',
      });
    }
  });

  // Filter users based on search query
  const filteredUsers = users?.filter(user => {
    const searchContent = [
      user.email?.toLowerCase(),
      user.first_name?.toLowerCase(),
      user.last_name?.toLowerCase(),
      user.role?.toLowerCase()
    ].join(' ');
    
    return searchContent.includes(searchQuery.toLowerCase());
  }) || [];

  const handleRoleChange = (userId: string, role: string) => {
    updateRoleMutation.mutate({ userId, role });
  };

  const addTemporaryData = () => {
    addTemporaryDataMutation.mutate();
  };

  const isLoading = isLoadingUsers || isLoadingStaff;
  const error = usersError || staffError;

  return {
    users: filteredUsers,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    handleRoleChange,
    addTemporaryData,
    staffMembers
  };
};
