
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable, Column } from './DataTable';

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'admin' | 'staff';
  location_id: string | null;
}

interface StaffFormData {
  id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'admin' | 'staff';
  location_id: string;
}

export const StaffTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    first_name: '',
    last_name: '',
    phone: '',
    role: 'staff',
    location_id: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch staff
  const { data: staffMembers, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*, locations(name)');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch locations for select dropdown
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      // Generate UUID for new staff member
      const id = crypto.randomUUID();
      
      const { error } = await supabase
        .from('staff')
        .insert([{ 
          id, // Add the id field here
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || null,
          role: data.role,
          location_id: data.location_id || null
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({ title: "Success", description: "Staff member created successfully" });
      closeDialog();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to create staff member: ${error.message}`, 
        variant: "destructive" 
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      const { error } = await supabase
        .from('staff')
        .update({ 
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || null,
          role: data.role,
          location_id: data.location_id || null
        })
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({ title: "Success", description: "Staff member updated successfully" });
      closeDialog();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to update staff member: ${error.message}`, 
        variant: "destructive" 
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({ title: "Success", description: "Staff member deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to delete staff member: ${error.message}`, 
        variant: "destructive" 
      });
    }
  });

  const columns: Column[] = [
    { 
      key: 'name', 
      header: 'Name',
      cell: (row) => `${row.first_name} ${row.last_name}`
    },
    { key: 'role', header: 'Role' },
    { 
      key: 'location_id', 
      header: 'Location',
      cell: (row) => row.locations?.name || 'Unassigned'
    },
    { key: 'phone', header: 'Phone' }
  ];

  const handleAddClick = () => {
    // Set default location if available
    const defaultLocationId = locations && locations.length > 0 ? locations[0].id : '';
    
    setFormData({
      first_name: '',
      last_name: '',
      phone: '',
      role: 'staff',
      location_id: defaultLocationId
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditClick = (staff: Staff) => {
    setFormData({
      id: staff.id,
      first_name: staff.first_name,
      last_name: staff.last_name,
      phone: staff.phone || '',
      role: staff.role,
      location_id: staff.location_id || ''
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (staff: Staff) => {
    if (window.confirm(`Are you sure you want to delete ${staff.first_name} ${staff.last_name}?`)) {
      deleteMutation.mutate(staff.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Staff Members</h1>
      
      <DataTable
        data={staffMembers || []}
        columns={columns}
        isLoading={isLoading}
        onAddClick={handleAddClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Staff Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location_id">Location</Label>
                <select
                  id="location_id"
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Unassigned</option>
                  {locations?.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
