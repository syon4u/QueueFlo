import React, { useEffect, useState } from 'react';
import { useServices, Service } from '@/hooks/useServices'; // Adjust path as needed
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface ServiceSelectionStepProps {
  selectedLocationId: string;
  onServiceSelect: (service: Service) => void;
  selectedServiceId?: string;
}

const ServiceSelectionStep: React.FC<ServiceSelectionStepProps> = ({ selectedLocationId, onServiceSelect, selectedServiceId }) => {
  const { services, loading, error, fetchServices } = useServices();

  useEffect(() => {
    if (selectedLocationId) {
      fetchServices(selectedLocationId);
    }
  }, [selectedLocationId, fetchServices]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error loading services: {error.message || 'Unknown error'}</p>;
  }

  if (!services || services.length === 0) {
    return <p>No services available for this location.</p>;
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Select a Service</CardTitle>
        <CardDescription>Choose the service you require.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service) => (
          <Button
            key={service.id}
            variant={selectedServiceId === service.id ? "default" : "outline"}
            className="w-full justify-start text-left h-auto py-3"
            onClick={() => onServiceSelect(service)}
          >
            <div className="flex flex-col">
              <span className="font-semibold">{service.name}</span>
              {service.description && <span className="text-sm text-muted-foreground">{service.description}</span>}
              {service.duration_minutes && <span className="text-sm text-muted-foreground">Duration: {service.duration_minutes} minutes</span>}
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default ServiceSelectionStep;

