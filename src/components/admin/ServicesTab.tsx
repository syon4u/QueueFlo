
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

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  location_id: string;
}

interface ServiceFormData {
  id?: string;
  name: string;
  description: string;
  duration: number;
  location_id: string;
}

export const ServicesTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    duration: 30,
    location_id: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch services
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
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
    mutationFn: async (data: ServiceFormData) => {
      const { error } = await supabase
        .from('services')
        .insert([{ 
          name: data.name,
          description: data.description || null,
          duration: data.duration,
          location_id: data.location_id
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: "Success", description: "Service created successfully" });
      closeDialog();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to create service: ${error.message}`, 
        variant: "destructive" 
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const { error } = await supabase
        .from('services')
        .update({ 
          name: data.name,
          description: data.description || null,
          duration: data.duration,
          location_id: data.location_id
        })
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: "Success", description: "Service updated successfully" });
      closeDialog();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to update service: ${error.message}`, 
        variant: "destructive" 
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: "Success", description: "Service deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `Failed to delete service: ${error.message}`, 
        variant: "destructive" 
      });
    }
  });

  const columns: Column[] = [
    { key: 'name', header: 'Name' },
    { 
      key: 'location_id', 
      header: 'Location',
      cell: (row) => row.locations?.name || 'Unknown'
    },
    { 
      key: 'duration', 
      header: 'Duration (min)',
      cell: (row) => `${row.duration} min`
    },
    { key: 'description', header: 'Description' }
  ];

  const handleAddClick = () => {
    // Set default location if available
    const defaultLocationId = locations && locations.length > 0 ? locations[0].id : '';
    
    setFormData({
      name: '',
      description: '',
      duration: 30,
      location_id: defaultLocationId
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditClick = (service: Service) => {
    setFormData({
      id: service.id,
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      location_id: service.location_id
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (service: Service) => {
    if (window.confirm(`Are you sure you want to delete ${service.name}?`)) {
      deleteMutation.mutate(service.id);
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
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'duration' ? parseInt(value, 10) || 0 : value 
    }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Services</h1>
      
      <DataTable
        data={services || []}
        columns={columns}
        isLoading={isLoading}
        onAddClick={handleAddClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Service Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location_id">Location</Label>
                <select
                  id="location_id"
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Select a location</option>
                  {locations?.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
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
