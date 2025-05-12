import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Adjust path
import { Database } from '@/integrations/supabase/types'; // Adjust path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, Save } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Assuming a single row in queue_configurations, or one per location_id if multi-location
// For simplicity, this example assumes a global configuration or a specific one (e.g., by ID 'default')
export type QueueConfiguration = Database["public"]["Tables"]["queue_configurations"]["Row"];
export type QueueConfigurationUpdatePayload = Database["public"]["Tables"]["queue_configurations"]["Update"];

const queueSettingsSchema = z.object({
  // id: z.string().uuid(), // Assuming we fetch/update a specific config row
  max_queue_size: z.coerce.number().int().positive("Max queue size must be a positive integer").optional().nullable(),
  auto_assign_staff: z.boolean().default(false),
  estimated_wait_time_factor: z.coerce.number().positive("Factor must be positive").optional().nullable(), // e.g., minutes per queue position
  allow_walk_ins: z.boolean().default(true),
  // Add other relevant settings like notification preferences, priority rules, etc.
});

type QueueSettingsFormData = z.infer<typeof queueSettingsSchema>;

const useQueueSettings = (configurationId: string = "default_config") => { // Assuming a default ID or passed in
  const [config, setConfig] = useState<QueueConfiguration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchQueueConfiguration = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('queue_configurations')
        .select('*')
        .eq('id', configurationId) // Or some other unique identifier if not 'id'
        .single(); // Assuming one global or specific config row
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: single row not found
        throw fetchError;
      }
      setConfig(data);
    } catch (e) {
      setError(e);
      console.error("Failed to fetch queue configuration:", e);
    } finally {
      setLoading(false);
    }
  }, [configurationId]);

  const updateQueueConfiguration = async (payload: QueueConfigurationUpdatePayload) => {
    if (!config && !payload.id) {
        // If no config exists and no ID is provided for upsert, this is an issue.
        // For this example, we'll assume an ID is always present or we're updating an existing one.
        // Or, handle creation if config is null:
        // const { data, error } = await supabase.from('queue_configurations').insert([{...payload, id: configurationId}]).select().single();
        console.error("No configuration ID to update and payload doesn't include one.");
        throw new Error("Configuration ID missing for update.");
    }
    setSaving(true);
    setError(null);
    try {
        // If config is null, it means we might be creating it for the first time with the given ID.
        const operation = config 
            ? supabase.from('queue_configurations').update(payload).eq('id', config.id)
            : supabase.from('queue_configurations').insert([{ ...payload, id: configurationId } as QueueConfiguration]); // Ensure 'id' is part of payload if creating

        const { data, error: updateError } = await operation.select().single();

        if (updateError) throw updateError;
        setConfig(data);
        return data;
    } catch (e) {
        setError(e);
        console.error("Failed to update queue configuration:", e);
        throw e;
    } finally {
        setSaving(false);
    }
  };

  return { config, loading, error, saving, fetchQueueConfiguration, updateQueueConfiguration };
};

const QueueSettings: React.FC = () => {
  // Assuming a single, global configuration for simplicity, identified by a known ID.
  // In a multi-tenant or multi-location setup, this ID might be dynamic.
  const CONFIG_ID = "default_queue_config"; // This ID must exist in your queue_configurations table or be creatable.
  const { config, loading, error, saving, fetchQueueConfiguration, updateQueueConfiguration } = useQueueSettings(CONFIG_ID);

  const form = useForm<QueueSettingsFormData>({
    resolver: zodResolver(queueSettingsSchema),
  });

  useEffect(() => {
    fetchQueueConfiguration();
  }, [fetchQueueConfiguration]);

  useEffect(() => {
    if (config) {
      form.reset({
        max_queue_size: config.max_queue_size,
        auto_assign_staff: config.auto_assign_staff || false,
        estimated_wait_time_factor: config.estimated_wait_time_factor,
        allow_walk_ins: config.allow_walk_ins === null ? true : config.allow_walk_ins, // Default to true if null
      });
    }
  }, [config, form]);

  const handleFormSubmit = async (data: QueueSettingsFormData) => {
    try {
      await updateQueueConfiguration({ ...data, id: CONFIG_ID }); // Ensure ID is passed if it's used for upserting
      alert("Queue settings updated successfully!");
      fetchQueueConfiguration(); // Refetch to confirm changes
    } catch (e) {
      console.error("Failed to save queue settings:", e);
      alert("Error saving queue settings. Please try again.");
    }
  };

  if (loading && !config) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">Loading queue settings...</p>
      </div>
    );
  }

  if (error && !config) { // Show error only if config couldn't be loaded at all
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold"><AlertCircle className="inline mr-2" />Error: </strong>
            <span className="block sm:inline">{error.message || "Could not load queue settings."} Consider creating default settings if none exist.</span>
        </div>
    );
  }
  
  // If config is null after loading and no error, it might mean no settings exist yet.
  // The form can still be used to create them if `updateQueueConfiguration` handles upsert.

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Queue Configuration</CardTitle>
        <CardDescription>Manage settings for the customer queue system.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="max_queue_size">Maximum Queue Size</Label>
            <Input id="max_queue_size" type="number" {...form.register("max_queue_size")} className="mt-1" />
            {form.formState.errors.max_queue_size && <p className="text-xs text-red-600 mt-1">{form.formState.errors.max_queue_size.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Leave blank for unlimited size.</p>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
                name="auto_assign_staff"
                control={form.control}
                render={({ field }) => <Switch id="auto_assign_staff" checked={field.value} onCheckedChange={field.onChange} />}
            />
            <Label htmlFor="auto_assign_staff">Automatically Assign Staff to Queued Customers</Label>
          </div>
          {form.formState.errors.auto_assign_staff && <p className="text-xs text-red-600 mt-1">{form.formState.errors.auto_assign_staff.message}</p>}

          <div>
            <Label htmlFor="estimated_wait_time_factor">Estimated Wait Time Factor</Label>
            <Input id="estimated_wait_time_factor" type="number" step="0.1" {...form.register("estimated_wait_time_factor")} className="mt-1" />
            {form.formState.errors.estimated_wait_time_factor && <p className="text-xs text-red-600 mt-1">{form.formState.errors.estimated_wait_time_factor.message}</p>}
            <p className="text-xs text-gray-500 mt-1">e.g., 5 (minutes per person in queue). Used for display purposes.</p>
          </div>

          <div className="flex items-center space-x-2">
             <Controller
                name="allow_walk_ins"
                control={form.control}
                render={({ field }) => <Switch id="allow_walk_ins" checked={field.value} onCheckedChange={field.onChange} />}
            />
            <Label htmlFor="allow_walk_ins">Allow Walk-in Customers to Join Queue</Label>
          </div>
          {form.formState.errors.allow_walk_ins && <p className="text-xs text-red-600 mt-1">{form.formState.errors.allow_walk_ins.message}</p>}

          <Button type="submit" className="w-full" disabled={saving || loading}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QueueSettings;

