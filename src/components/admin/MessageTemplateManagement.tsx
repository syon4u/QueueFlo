import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Adjust path
import { Database } from '@/integrations/supabase/types'; // Adjust path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export type MessageTemplate = Database["public"]["Tables"]["message_templates"]["Row"];
export type MessageTemplateCreatePayload = Database["public"]["Tables"]["message_templates"]["Insert"];
export type MessageTemplateUpdatePayload = Database["public"]["Tables"]["message_templates"]["Update"];

// Define available event types for templates
const templateEventTypes = [
  { id: 'appointment_confirmation', name: 'Appointment Confirmation' },
  { id: 'appointment_reminder', name: 'Appointment Reminder' },
  { id: 'appointment_cancellation_customer', name: 'Appointment Cancellation (Customer)' },
  { id: 'appointment_cancellation_staff', name: 'Appointment Cancellation (Staff)' },
  { id: 'queue_update', name: 'Queue Position Update' },
  { id: 'service_completion_survey', name: 'Service Completion & Survey Link' },
  // Add more as needed
];

const messageTemplateSchema = z.object({
  template_name: z.string().min(1, "Template name is required"),
  event_type: z.string().min(1, "Event type is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  is_active: z.boolean().default(true),
});

type MessageTemplateFormData = z.infer<typeof messageTemplateSchema>;

// useMessageTemplates hook was created earlier, assuming it's available and functional.
// If not, it would need to be created similar to other management hooks.
import { useMessageTemplates } from '@/hooks/useMessageTemplates';

const MessageTemplateManagement: React.FC = () => {
  const { templates, loading, error, fetchTemplates, createTemplate, updateTemplate, deleteTemplate } = useMessageTemplates();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const form = useForm<MessageTemplateFormData>({
    resolver: zodResolver(messageTemplateSchema),
    defaultValues: {
      template_name: '',
      event_type: '',
      subject: '',
      body: '',
      is_active: true,
    }
  });

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (editingTemplate) {
      form.reset({
        template_name: editingTemplate.template_name,
        event_type: editingTemplate.event_type,
        subject: editingTemplate.subject,
        body: editingTemplate.body,
        is_active: editingTemplate.is_active,
      });
    } else {
      form.reset({
        template_name: '',
        event_type: '',
        subject: '',
        body: '',
        is_active: true,
      });
    }
  }, [editingTemplate, form]);

  const handleFormSubmit = async (data: MessageTemplateFormData) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, data as MessageTemplateUpdatePayload);
      } else {
        await createTemplate(data as MessageTemplateCreatePayload);
      }
      fetchTemplates();
      setIsDialogOpen(false);
      setEditingTemplate(null);
    } catch (e: any) {
      console.error("Failed to save message template:", e);
      alert(`Error saving template: ${e.message || 'Please try again.'}`);
    }
  };

  const openEditDialog = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingTemplate(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleDelete = async (templateId: string) => {
    if (window.confirm("Are you sure you want to delete this message template?")) {
      try {
        await deleteTemplate(templateId);
        fetchTemplates();
      } catch (e: any) {
        console.error("Failed to delete template:", e);
        alert(`Error deleting template: ${e.message || 'Please try again.'}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Manage Message Templates</h2>
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Template
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold"><AlertCircle className="inline mr-2" />Error: </strong>
          <span className="block sm:inline">{error.message || "Could not load message templates."}</span>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Message Template' : 'Add New Message Template'}</DialogTitle>
            <DialogDescription>
              Placeholders like {{customerName}}, {{appointmentDate}}, {{queuePosition}} can be used in subject and body.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <div>
              <label htmlFor="template_name" className="block text-sm font-medium text-gray-700">Template Name</label>
              <Input id="template_name" {...form.register("template_name")} className="mt-1" />
              {form.formState.errors.template_name && <p className="text-xs text-red-600 mt-1">{form.formState.errors.template_name.message}</p>}
            </div>
            <div>
              <label htmlFor="event_type" className="block text-sm font-medium text-gray-700">Event Type</label>
              <Select onValueChange={(value) => form.setValue('event_type', value)} defaultValue={form.getValues('event_type')}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select an event type" />
                </SelectTrigger>
                <SelectContent>
                  {templateEventTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.event_type && <p className="text-xs text-red-600 mt-1">{form.formState.errors.event_type.message}</p>}
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <Input id="subject" {...form.register("subject")} className="mt-1" />
              {form.formState.errors.subject && <p className="text-xs text-red-600 mt-1">{form.formState.errors.subject.message}</p>}
            </div>
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700">Body (Email/SMS Content)</label>
              <Textarea id="body" {...form.register("body")} className="mt-1" rows={6} />
              {form.formState.errors.body && <p className="text-xs text-red-600 mt-1">{form.formState.errors.body.message}</p>}
            </div>
             <div className="flex items-center space-x-2">
                <input type="checkbox" id="is_active" {...form.register("is_active")} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                 <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {editingTemplate ? 'Save Changes' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loading && !templates.length ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="ml-2">Loading templates...</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.template_name}</TableCell>
                  <TableCell>{templateEventTypes.find(t => t.id === template.event_type)?.name || template.event_type}</TableCell>
                  <TableCell>{template.subject}</TableCell>
                  <TableCell>{template.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(template)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && templates.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                        No message templates found. Add a new one to get started.
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

export default MessageTemplateManagement;

