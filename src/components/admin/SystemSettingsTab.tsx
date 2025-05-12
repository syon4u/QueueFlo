
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useSystemSettings, type SystemSetting } from '@/hooks/admin/use-system-settings';

const generalSettingsSchema = z.object({
  systemName: z.string().min(1, "System name is required"),
  businessHoursStart: z.string().min(1, "Business hours start time is required"),
  businessHoursEnd: z.string().min(1, "Business hours end time is required"),
  defaultLocation: z.string().min(1, "Default location is required"),
  language: z.string().min(1, "Language is required"),
});

const queueSettingsSchema = z.object({
  defaultWaitTime: z.string().min(1, "Default wait time is required"),
  maxQueueSize: z.string().min(1, "Maximum queue size is required"),
  priorityEnabled: z.boolean().default(false),
  autoAssignment: z.boolean().default(true),
});

const notificationSettingsSchema = z.object({
  notificationMethod: z.enum(["email", "sms", "both"]),
  emailTemplates: z.boolean().default(false),
  smsTemplates: z.boolean().default(false),
  waitTimeAlertThreshold: z.string().min(1, "Wait time threshold is required"),
});

const displaySettingsSchema = z.object({
  theme: z.string().min(1, "Theme is required"),
  showEstimatedTime: z.boolean().default(true),
  showQueuePosition: z.boolean().default(true),
  customLogoUrl: z.string().optional(),
});

export const SystemSettingsTab = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { settings, isLoading, updateSettings, isUpdating } = useSystemSettings();

  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      systemName: "County Queue Management System",
      businessHoursStart: "08:00",
      businessHoursEnd: "17:00",
      defaultLocation: "main",
      language: "en",
    },
  });

  const queueForm = useForm<z.infer<typeof queueSettingsSchema>>({
    resolver: zodResolver(queueSettingsSchema),
    defaultValues: {
      defaultWaitTime: "15",
      maxQueueSize: "50",
      priorityEnabled: true,
      autoAssignment: true,
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      notificationMethod: "both",
      emailTemplates: true,
      smsTemplates: true,
      waitTimeAlertThreshold: "30",
    },
  });

  const displayForm = useForm<z.infer<typeof displaySettingsSchema>>({
    resolver: zodResolver(displaySettingsSchema),
    defaultValues: {
      theme: "light",
      showEstimatedTime: true,
      showQueuePosition: true,
      customLogoUrl: "",
    },
  });

  // Type guard functions to safely access values
  const getBusinessHours = (setting?: SystemSetting) => {
    if (!setting) return null;
    if (typeof setting.value === 'object' && 'start' in setting.value && 'end' in setting.value) {
      return setting.value as { start: string; end: string };
    }
    return null;
  };

  const getQueueSettings = (setting?: SystemSetting) => {
    if (!setting) return null;
    if (typeof setting.value === 'object' && 'default_wait_time' in setting.value) {
      return setting.value as {
        default_wait_time: number;
        max_queue_size: number;
        priority_enabled: boolean;
        auto_assignment: boolean;
      };
    }
    return null;
  };

  const getNotificationSettings = (setting?: SystemSetting) => {
    if (!setting) return null;
    if (typeof setting.value === 'object' && 'method' in setting.value) {
      return setting.value as {
        method: 'email' | 'sms' | 'both';
        email_templates: boolean;
        sms_templates: boolean;
        wait_time_threshold: number;
      };
    }
    return null;
  };

  const getDisplaySettings = (setting?: SystemSetting) => {
    if (!setting) return null;
    if (typeof setting.value === 'object' && 'theme' in setting.value) {
      return setting.value as {
        theme: string;
        show_estimated_time: boolean;
        show_queue_position: boolean;
        custom_logo_url: string;
      };
    }
    return null;
  };

  // Initialize form values from database
  useEffect(() => {
    if (settings && settings.length > 0) {
      // Find general settings
      const systemNameSetting = settings.find(s => s.key === 'system_name');
      const businessHoursSetting = settings.find(s => s.key === 'business_hours');
      const defaultLocationSetting = settings.find(s => s.key === 'default_location');
      const languageSetting = settings.find(s => s.key === 'language');
      
      if (systemNameSetting && typeof systemNameSetting.value === 'string') {
        generalForm.setValue('systemName', systemNameSetting.value);
      }
      
      const businessHours = getBusinessHours(businessHoursSetting);
      if (businessHours) {
        generalForm.setValue('businessHoursStart', businessHours.start);
        generalForm.setValue('businessHoursEnd', businessHours.end);
      }
      
      if (defaultLocationSetting && typeof defaultLocationSetting.value === 'string') {
        generalForm.setValue('defaultLocation', defaultLocationSetting.value);
      }
      
      if (languageSetting && typeof languageSetting.value === 'string') {
        generalForm.setValue('language', languageSetting.value);
      }

      // Find queue settings
      const queueSettingObj = getQueueSettings(settings.find(s => s.key === 'queue_settings'));
      if (queueSettingObj) {
        queueForm.setValue('defaultWaitTime', queueSettingObj.default_wait_time.toString());
        queueForm.setValue('maxQueueSize', queueSettingObj.max_queue_size.toString());
        queueForm.setValue('priorityEnabled', queueSettingObj.priority_enabled);
        queueForm.setValue('autoAssignment', queueSettingObj.auto_assignment);
      }

      // Find notification settings
      const notificationSettingObj = getNotificationSettings(settings.find(s => s.key === 'notification_settings'));
      if (notificationSettingObj) {
        notificationForm.setValue('notificationMethod', notificationSettingObj.method);
        notificationForm.setValue('emailTemplates', notificationSettingObj.email_templates);
        notificationForm.setValue('smsTemplates', notificationSettingObj.sms_templates);
        notificationForm.setValue('waitTimeAlertThreshold', notificationSettingObj.wait_time_threshold.toString());
      }

      // Find display settings
      const displaySettingObj = getDisplaySettings(settings.find(s => s.key === 'display_settings'));
      if (displaySettingObj) {
        displayForm.setValue('theme', displaySettingObj.theme);
        displayForm.setValue('showEstimatedTime', displaySettingObj.show_estimated_time);
        displayForm.setValue('showQueuePosition', displaySettingObj.show_queue_position);
        displayForm.setValue('customLogoUrl', displaySettingObj.custom_logo_url || '');
      }
    }
  }, [settings, generalForm, queueForm, notificationForm, displayForm]);

  const onSubmitGeneral = (data: z.infer<typeof generalSettingsSchema>) => {
    updateSettings({
      'system_name': data.systemName,
      'business_hours': {
        start: data.businessHoursStart,
        end: data.businessHoursEnd
      },
      'default_location': data.defaultLocation,
      'language': data.language
    }, 'general');
  };

  const onSubmitQueue = (data: z.infer<typeof queueSettingsSchema>) => {
    updateSettings({
      'queue_settings': {
        default_wait_time: parseInt(data.defaultWaitTime),
        max_queue_size: parseInt(data.maxQueueSize),
        priority_enabled: data.priorityEnabled,
        auto_assignment: data.autoAssignment
      }
    }, 'queue');
  };

  const onSubmitNotification = (data: z.infer<typeof notificationSettingsSchema>) => {
    updateSettings({
      'notification_settings': {
        method: data.notificationMethod,
        email_templates: data.emailTemplates,
        sms_templates: data.smsTemplates,
        wait_time_threshold: parseInt(data.waitTimeAlertThreshold)
      }
    }, 'notification');
  };

  const onSubmitDisplay = (data: z.infer<typeof displaySettingsSchema>) => {
    updateSettings({
      'display_settings': {
        theme: data.theme,
        show_estimated_time: data.showEstimatedTime,
        show_queue_position: data.showQueuePosition,
        custom_logo_url: data.customLogoUrl || ''
      }
    }, 'display');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground">
          Configure global system preferences and parameters
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="queue">Queue Management</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic system configuration and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-4">
                  <FormField
                    control={generalForm.control}
                    name="systemName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your queue management system
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={generalForm.control}
                      name="businessHoursStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Hours Start</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="businessHoursEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Hours End</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={generalForm.control}
                    name="defaultLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a default location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="main">Main Office</SelectItem>
                            <SelectItem value="north">North Branch</SelectItem>
                            <SelectItem value="south">South Branch</SelectItem>
                            <SelectItem value="east">East Branch</SelectItem>
                            <SelectItem value="west">West Branch</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The default location for new appointments
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="zh">Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The primary language for the system interface
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save General Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle>Queue Management Settings</CardTitle>
              <CardDescription>
                Configure how queues are managed and processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...queueForm}>
                <form onSubmit={queueForm.handleSubmit(onSubmitQueue)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={queueForm.control}
                      name="defaultWaitTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Wait Time (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            The estimated wait time for new appointments
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={queueForm.control}
                      name="maxQueueSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Queue Size</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Maximum number of customers allowed in queue
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={queueForm.control}
                    name="priorityEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Enable Priority Queue</FormLabel>
                          <FormDescription>
                            Allow certain customers to receive priority service
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={queueForm.control}
                    name="autoAssignment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Auto-assign to Staff</FormLabel>
                          <FormDescription>
                            Automatically assign customers to available staff members
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Queue Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how notifications are sent to customers and staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onSubmitNotification)} className="space-y-4">
                  <FormField
                    control={notificationForm.control}
                    name="notificationMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Primary Notification Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="email" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Email Only
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="sms" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                SMS Only
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="both" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Both Email and SMS
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="emailTemplates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Use Custom Email Templates</FormLabel>
                          <FormDescription>
                            Use customized email templates for notifications
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="smsTemplates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Use Custom SMS Templates</FormLabel>
                          <FormDescription>
                            Use customized SMS templates for notifications
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="waitTimeAlertThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wait Time Alert Threshold (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Send alerts when wait times exceed this threshold
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Notification Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Configure display options for customer-facing screens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...displayForm}>
                <form onSubmit={displayForm.handleSubmit(onSubmitDisplay)} className="space-y-4">
                  <FormField
                    control={displayForm.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UI Theme</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System Default</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the visual theme for the interface
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={displayForm.control}
                    name="showEstimatedTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Show Estimated Wait Time</FormLabel>
                          <FormDescription>
                            Display estimated wait times to customers
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={displayForm.control}
                    name="showQueuePosition"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Show Queue Position</FormLabel>
                          <FormDescription>
                            Display customer position in queue
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={displayForm.control}
                    name="customLogoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Logo URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/logo.png" />
                        </FormControl>
                        <FormDescription>
                          URL for your organization's logo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Display Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettingsTab;
