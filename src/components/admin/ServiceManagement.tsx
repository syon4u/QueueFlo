import React, { useState, useEffect, useCallback } from 'react';
import { useServices, Service, ServiceCreatePayload, ServiceUpdatePayload } from '@/hooks/useServices'; // Adjust path as needed
import { useLocations } from '@/hooks/useLocations'; // To link services to locations
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  duration_minutes: z.coerce.number().int().positive("Duration must be a positive number"),
  price: z.coerce.number().nonnegative("Price cannot be negative").optional(),
  // category: z.string().optional(), // Add if needed
  // location_ids: z.array(z.string()).min(1, "At least one location must be selected"), // If linking services to multiple locations directly
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const ServiceManagement: React.FC = () => {
  const { services, loading: servicesLoading, error: servicesError, fetchServices, createService, updateService, deleteService } = useServices();
  // const { locations, fetchLocations, loading: locationsLoading } = useLocations(); // If needed for selection
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      duration_minutes: 30,
      price: 0,
      // location_ids: [],
    }
  });

  useEffect(() => {
    fetchServices();
    // fetchLocations(); // Fetch locations if needed for a dropdown
  }, [fetchServices]); // add fetchLocations if used

  useEffect(() => {
    if (editingService) {
      form.reset({
        name: editingService.name,
        description: editingService.description || '',
        duration_minutes: editingService.duration_minutes,
        price: editingService.price || 0,
        // location_ids: editingService.location_ids || [], // Assuming service has location_ids
      });
    } else {
      form.reset();
    }
  }, [editingService, form]);

  const handleFormSubmit = async (data: ServiceFormData) => {
    try {
      if (editingService) {
        await updateService(editingService.id, data as ServiceUpdatePayload);
      } else {
        await createService(data as ServiceCreatePayload);
      }
      fetchServices();
      setIsDialogOpen(false);
      setEditingService(null);
    } catch (e) {
      console.error("Failed to save service:", e);
      alert("Error saving service. Please try again.");
    }
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingService(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteService(serviceId);
        fetchServices();
      } catch (e) {
        console.error("Failed to delete service:", e);
        alert("Error deleting service. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Manage Services</h2>
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
        </Button>
      </div>

      {servicesError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold"><AlertCircle className="inline mr-2" />Error: </strong>
          <span className="block sm:inline">{servicesError.message || "Could not load services."}</span>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'Update the details of this service.' : 'Fill in the details for the new service.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Service Name</label>
              <Input id="name" {...form.register("name")} className="mt-1" />
              {form.formState.errors.name && <p className="text-xs text-red-600 mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <Textarea id="description" {...form.register("description")} className="mt-1" />
            </div>
            <div>
              <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <Input id="duration_minutes" type="number" {...form.register("duration_minutes")} className="mt-1" />
              {form.formState.errors.duration_minutes && <p className="text-xs text-red-600 mt-1">{form.formState.errors.duration_minutes.message}</p>}
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (optional)</label>
              <Input id="price" type="number" step="0.01" {...form.register("price")} className="mt-1" />
               {form.formState.errors.price && <p className="text-xs text-red-600 mt-1">{form.formState.errors.price.message}</p>}
            </div>
            {/* Example for linking to locations - requires locations to be fetched and a multi-select component */}
            {/* <div>
              <label htmlFor="location_ids" className="block text-sm font-medium text-gray-700">Available at Locations</label>
              <Controller
                name="location_ids"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value?.join(',')}>
                     <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select locations" />
                     </SelectTrigger>
                     <SelectContent>
                        {locationsLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> :
                           locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)
                        }
                     </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.location_ids && <p className="text-xs text-red-600 mt-1">{form.formState.errors.location_ids.message}</p>}
            </div> */}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingService ? 'Save Changes' : 'Create Service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {servicesLoading && !services.length ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="ml-2">Loading services...</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.description || '-'}</TableCell>
                  <TableCell>{service.duration_minutes} min</TableCell>
                  <TableCell>${service.price !== null && service.price !== undefined ? service.price.toFixed(2) : '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(service)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!servicesLoading && services.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                        No services found. Add a new one to get started.
                    </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default ServiceManagement;

