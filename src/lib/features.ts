
/**
 * Feature Tracking List
 * This file tracks the implementation status of all required features
 * Use this as a reference when implementing new features or enhancing existing ones
 */

interface Feature {
  id: string;
  name: string;
  description: string;
  implemented: boolean;
  inProgress?: boolean;
  notes?: string;
}

export const features: Feature[] = [
  {
    id: "4.2.0",
    name: "Wait Time Measurement on Check-in",
    description: "Wait time measurement begins only when the customer checks in",
    implemented: true,
    notes: "Current implementation tracks wait time from check-in"
  },
  {
    id: "4.3.0",
    name: "Multi-language Support",
    description: "Support for English, Spanish, Haitian Creole, and Portuguese",
    implemented: true,
    notes: "i18n implementation supports all required languages"
  },
  {
    id: "4.4.0",
    name: "Mobile & Web Appointments",
    description: "Customers can make appointments via mobile app or web browser",
    implemented: true,
    notes: "Current app is responsive and works on both mobile and web"
  },
  {
    id: "4.5.0",
    name: "Customer Visit History",
    description: "Staff can review past customer visit history",
    implemented: true,
    notes: "CustomerHistoryDialog component enables this functionality"
  },
  {
    id: "4.6.0", 
    name: "Advanced Queue Scheduling",
    description: "Schedule queue changes more than 30 days in advance",
    implemented: true,
    notes: "QueueSchedulingDialog component provides this functionality"
  },
  {
    id: "4.7.0",
    name: "Customizable Data Fields",
    description: "Customizable data fields, roles, permissions, and workflow processes",
    implemented: false,
    inProgress: true,
    notes: "Basic role system implemented, need to add customizable fields"
  },
  {
    id: "4.8.0",
    name: "Role-based Access Control",
    description: "Different roles have different access permissions",
    implemented: true,
    notes: "Admin/Staff/Customer roles implemented with appropriate access"
  },
  {
    id: "4.9.0",
    name: "Security Standards Compliance",
    description: "Compliance with highest security standards and safeguards",
    implemented: true,
    notes: "Using Supabase for auth with RLS policies"
  },
  {
    id: "4.10.0",
    name: "Extended Character Messaging",
    description: "Messaging with character limits exceeding 500 characters",
    implemented: true,
    notes: "No artificial character limits in messaging components"
  },
  {
    id: "4.11.0",
    name: "Customer Survey Capability",
    description: "Integrated customer survey capability",
    implemented: false,
    notes: "Not yet implemented"
  },
  {
    id: "4.12.0",
    name: "Queue Administration",
    description: "Create/edit queue names, messages, and service wait times",
    implemented: true,
    notes: "Admin dashboard provides these capabilities"
  },
  {
    id: "4.13.0",
    name: "Reason for Visit Field",
    description: "Freeform reason for visit field for customers",
    implemented: true,
    notes: "Appointment forms include reason for visit field"
  },
  {
    id: "4.14.0",
    name: "Employee Schedule Mapping",
    description: "Map employee schedules to specific service availability",
    implemented: false,
    notes: "Basic staff status tracking implemented, but no schedule mapping yet"
  },
  {
    id: "4.15.0",
    name: "Service Availability Limits",
    description: "Ability to limit availability of a specific service",
    implemented: false,
    notes: "Not yet implemented"
  },
  {
    id: "4.16.0",
    name: "Service-Location-Staff Linking",
    description: "Link services to specific locations and staff schedules",
    implemented: true,
    notes: "Basic implementation exists in service and staff management"
  },
  {
    id: "4.17.0",
    name: "Customer View Preview",
    description: "Staff preview of customer's view at different times of day",
    implemented: false,
    notes: "Not yet implemented"
  },
  {
    id: "4.18.0",
    name: "Blackout Periods",
    description: "Stop new appointments until backlog clears",
    implemented: true,
    notes: "BlackoutPeriodControl component provides this functionality"
  },
  {
    id: "4.19.0",
    name: "Multi-section Integration",
    description: "Integration of multiple sections with different times/staffing",
    implemented: false,
    notes: "Not yet implemented"
  },
  {
    id: "4.20.0",
    name: "Parallel Customer Servicing",
    description: "Work on more than one customer at a time",
    implemented: false,
    notes: "Current implementation only handles one customer at a time"
  },
  {
    id: "4.21.0",
    name: "High-volume Intake",
    description: "Set up 30+ appointments simultaneously",
    implemented: false,
    notes: "Not yet implemented"
  },
  {
    id: "4.22.0",
    name: "Staff Break Status",
    description: "Break status with handover visibility",
    implemented: true,
    notes: "StaffBreakDialog component provides this functionality"
  },
  {
    id: "4.23.0",
    name: "Cross-location Appointments",
    description: "Make appointments at any interconnected location",
    implemented: true,
    notes: "LocationSelector component enables this functionality"
  },
  {
    id: "4.24.0",
    name: "Flexible Kiosk Actions",
    description: "Appointment booking only, check-in only, or both",
    implemented: false,
    notes: "Not yet implemented"
  },
  {
    id: "4.25.0",
    name: "Configurable Display",
    description: "Split-screen/kiosk display showing multiple data sets",
    implemented: false,
    notes: "Not yet implemented"
  },
  {
    id: "4.26.0",
    name: "Concurrent Appointment Creation",
    description: "Make new appointments while serving another customer",
    implemented: false,
    notes: "Not yet implemented"
  },
  {
    id: "4.27.0",
    name: "Accessibility Compliance",
    description: "Full ADA (WCAG 2.1) compliance",
    implemented: true,
    notes: "Using shadcn/ui components which have accessibility built-in"
  }
];

/**
 * Get implementation status summary
 */
export const getFeatureStats = () => {
  const total = features.length;
  const implemented = features.filter(f => f.implemented).length;
  const inProgress = features.filter(f => f.inProgress).length;
  const notStarted = total - implemented - inProgress;
  
  return {
    total,
    implemented,
    inProgress,
    notStarted,
    percentComplete: Math.round((implemented / total) * 100)
  };
};

/**
 * Get features by implementation status
 */
export const getFeaturesByStatus = (status: 'implemented' | 'inProgress' | 'notStarted') => {
  switch (status) {
    case 'implemented':
      return features.filter(f => f.implemented);
    case 'inProgress':
      return features.filter(f => f.inProgress && !f.implemented);
    case 'notStarted':
      return features.filter(f => !f.implemented && !f.inProgress);
    default:
      return features;
  }
};
