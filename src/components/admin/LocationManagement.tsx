import React, { useState, useEffect, useCallback } from 'react';
import { useLocations, Location, LocationCreatePayload, LocationUpdatePayload } from '@/hooks/useLocations'; // Adjust path as needed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  phone_number: z.string().optional(),
  operating_hours: z.string().optional(), // Could be JSON or structured text
});

type LocationFormData = z.infer<typeof locationSchema>;

const LocationManagement: React.FC = () => {
  const { locations, loading, error, fetchLocations, createLocation, updateLocation, deleteLocation } = useLocations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      address: '',
      phone_number: '',
      operating_hours: '',
    }
  });

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    if (editingLocation) {
      form.reset({
        name: editingLocation.name,
        address: editingLocation.address || '',
        phone_number: editingLocation.phone_number || '',
        operating_hours: editingLocation.operating_hours || '',
      });
    } else {
      form.reset();
    }
  }, [editingLocation, form]);

  const handleFormSubmit = async (data: LocationFormData) => {
    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, data as LocationUpdatePayload);
      } else {
        await createLocation(data as LocationCreatePayload);
      }
      fetchLocations();
      setIsDialogOpen(false);
      setEditingLocation(null);
    } catch (e) {
      console.error("Failed to save location:", e);
      // Display error to user, e.g., using a toast
      alert("Error saving location. Please try again.");
    }
  };

  const openEditDialog = (location: Location) => {
    setEditingLocation(location);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingLocation(null);
    form.reset(); // Ensure form is cleared for new entry
    setIsDialogOpen(true);
  };

  const handleDelete = async (locationId: string) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await deleteLocation(locationId);
        fetchLocations();
      } catch (e) {
        console.error("Failed to delete location:", e);
        alert("Error deleting location. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Manage Locations</h2>
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Location
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold"><AlertCircle className="inline mr-2" />Error: </strong>
          <span className="block sm:inline">{error.message || "Could not load locations."}</span>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
            <DialogDescription>
              {editingLocation ? 'Update the details of this location.' : 'Fill in the details for the new location.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <Input id="name" {...form.register("name")} className="mt-1" />
              {form.formState.errors.name && <p className="text-xs text-red-600 mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <Textarea id="address" {...form.register("address")} className="mt-1" />
            </div>
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <Input id="phone_number" {...form.register("phone_number")} className="mt-1" />
            </div>
            <div>
              <label htmlFor="operating_hours" className="block text-sm font-medium text-gray-700">Operating Hours</label>
              <Input id="operating_hours" {...form.register("operating_hours")} placeholder="e.g., Mon-Fri: 9am-5pm" className="mt-1" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                 <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingLocation ? 'Save Changes' : 'Create Location'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loading && !locations.length ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="ml-2">Loading locations...</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Operating Hours</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.address || '-'}</TableCell>
                  <TableCell>{location.phone_number || '-'}</TableCell>
                  <TableCell>{location.operating_hours || '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(location)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(location.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && locations.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                        No locations found. Add a new one to get started.
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

export default LocationManagement;

