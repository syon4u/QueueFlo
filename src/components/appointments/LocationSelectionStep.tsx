import React, { useEffect } from 'react';
import { useLocations, Location } from '@/hooks/useLocations'; // Assuming this path is correct
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface LocationSelectionStepProps {
  onLocationSelect: (location: Location) => void;
  selectedLocationId?: string;
}

const LocationSelectionStep: React.FC<LocationSelectionStepProps> = ({ onLocationSelect, selectedLocationId }) => {
  const { locations, loading, error, fetchLocations } = useLocations();

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">Loading locations...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error loading locations: {error.message || 'Unknown error'}</p>;
  }

  if (!locations || locations.length === 0) {
    return <p>No locations available at the moment.</p>;
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Select a Location</CardTitle>
        <CardDescription>Choose the location where you'd like to book your appointment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {locations.map((location) => (
          <Button
            key={location.id}
            variant={selectedLocationId === location.id ? "default" : "outline"}
            className="w-full justify-start text-left h-auto py-3"
            onClick={() => onLocationSelect(location)}
          >
            <div className="flex flex-col">
              <span className="font-semibold">{location.name}</span>
              {location.address && <span className="text-sm text-muted-foreground">{location.address}</span>}
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default LocationSelectionStep;

