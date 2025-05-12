import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Adjust path as needed
import { Database } from '@/integrations/supabase/types'; // Adjust path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Assuming a simplified staff profile for now. Expand as needed.
// This might involve joining with a 'users' table if staff are also app users.
export type StaffProfile = Database["public"]["Tables"]["staff_profiles"]["Row"];
export type StaffProfileCreatePayload = Database["public"]["Tables"]["staff_profiles"]["Insert"];
export type StaffProfileUpdatePayload = Database["public"]["Tables"]["staff_profiles"]["Update"];

// Placeholder for roles - in a real app, these might come from a DB table or config
const staffRoles = [
  { id: 'staff', name: 'Staff' },
  { id: 'manager', name: 'Manager' },
  { id: 'admin', name: 'Administrator' },
];

const staffFormSchema = z.object({
  user_id: z.string().uuid("Valid User ID is required (must be an existing user in auth.users)"), // Assuming this links to auth.users.id
  full_name: z.string().min(1, "Full name is required"),
  role: z.string().min(1, "Role is required"), // e.g., 'staff', 'manager'
  // location_id: z.string().uuid("Location is required").optional(), // If staff are tied to a single location
  // Add other fields like contact_info, specializations, etc.
});

type StaffFormData = z.infer<typeof staffFormSchema>;

const useStaffManagement = () => {
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('staff_profiles') // Ensure this table exists
        .select('*'); // Adjust columns as needed, e.g., join with users table for email
      if (error) throw error;
      setStaffList(data || []);
    } catch (e) {
      setError(e);
      console.error("Failed to fetch staff:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStaffMember = async (payload: StaffProfileCreatePayload) => {
    const { data, error } = await supabase
      .from('staff_profiles')
      .insert(payload)
      .select();
    if (error) throw error;
    return data;
  };

  const updateStaffMember = async (id: string, payload: StaffProfileUpdatePayload) => {
    const { data, error } = await supabase
      .from('staff_profiles')
      .update(payload)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  };

  const deleteStaffMember = async (id: string) => {
    const { error } = await supabase
      .from('staff_profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  };

  return { staffList, loading, error, fetchStaff, createStaffMember, updateStaffMember, deleteStaffMember };
};

const StaffManagement: React.FC = () => {
  const { staffList, loading, error, fetchStaff, createStaffMember, updateStaffMember, deleteStaffMember } = useStaffManagement();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffProfile | null>(null);

  // TODO: Fetch actual users from auth.users to populate a dropdown for user_id selection
  // For now, user_id will be a manual input, which is not ideal for UX.

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      user_id: '',
      full_name: '',
      role: '',
    }
  });

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    if (editingStaff) {
      form.reset({
        user_id: editingStaff.user_id || '', // user_id should always exist if it's a FK
        full_name: editingStaff.full_name || '',
        role: editingStaff.role || '',
      });
    } else {
      form.reset();
    }
  }, [editingStaff, form]);

  const handleFormSubmit = async (data: StaffFormData) => {
    try {
      if (editingStaff) {
        // For update, user_id typically shouldn't change. Only other profile details.
        const updatePayload: StaffProfileUpdatePayload = { ...data };
        delete (updatePayload as any).user_id; // Prevent trying to update user_id if it's part of the form but not updatable here
        await updateStaffMember(editingStaff.id, updatePayload);
      } else {
        await createStaffMember(data as StaffProfileCreatePayload);
      }
      fetchStaff();
      setIsDialogOpen(false);
      setEditingStaff(null);
    } catch (e: any) {
      console.error("Failed to save staff member:", e);
      alert(`Error saving staff member: ${e.message || 'Please try again.'}`);
    }
  };

  const openEditDialog = (staff: StaffProfile) => {
    setEditingStaff(staff);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingStaff(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleDelete = async (staffId: string) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await deleteStaffMember(staffId);
        fetchStaff();
      } catch (e: any) {
        console.error("Failed to delete staff member:", e);
        alert(`Error deleting staff member: ${e.message || 'Please try again.'}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Manage Staff</h2>
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Staff
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold"><AlertCircle className="inline mr-2" />Error: </strong>
          <span className="block sm:inline">{error.message || "Could not load staff list."}</span>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
            <DialogDescription>
              {editingStaff ? 'Update the details of this staff member.' : 'Fill in the details for the new staff member.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <div>
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">User ID (from Auth)</label>
              <Input id="user_id" {...form.register("user_id")} className="mt-1" placeholder="Enter existing auth.users UUID" disabled={!!editingStaff} />
              {form.formState.errors.user_id && <p className="text-xs text-red-600 mt-1">{form.formState.errors.user_id.message}</p>}
              <p className="text-xs text-gray-500 mt-1">This should be the ID of an existing user in the system's authentication table.</p>
            </div>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <Input id="full_name" {...form.register("full_name")} className="mt-1" />
              {form.formState.errors.full_name && <p className="text-xs text-red-600 mt-1">{form.formState.errors.full_name.message}</p>}
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <Select onValueChange={(value) => form.setValue('role', value)} defaultValue={form.getValues('role')}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {staffRoles.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.role && <p className="text-xs text-red-600 mt-1">{form.formState.errors.role.message}</p>}
            </div>
            {/* Add fields for location assignment, services they can perform, etc. */}
            <DialogFooter>
              <DialogClose asChild>
                 <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingStaff ? 'Save Changes' : 'Create Staff Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loading && !staffList.length ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="ml-2">Loading staff...</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                {/* <TableHead>Location</TableHead> */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.full_name}</TableCell>
                  <TableCell>{staff.user_id}</TableCell>
                  <TableCell>{staffRoles.find(r => r.id === staff.role)?.name || staff.role}</TableCell>
                  {/* <TableCell>{staff.location_id || '-'}</TableCell> */}
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(staff)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(staff.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && staffList.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                        No staff members found. Add a new one to get started.
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

export default StaffManagement;

