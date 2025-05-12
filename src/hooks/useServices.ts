import { useCallback, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import type { Database, Tables, TablesInsert } from "../integrations/supabase/types";

export type Service = Tables<"services">;
export type LocationService = Tables<"location_services">;

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [locationServices, setLocationServices] = useState<LocationService[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchServices = useCallback(async (locationId?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (locationId) {
        // Fetch services offered at a specific location
        const { data, error: fetchError } = await supabase
          .from("location_services")
          .select(`
            location_id,
            service_id,
            is_offered,
            specific_operating_hours,
            services (*)
          `)
          .eq("location_id", locationId)
          .eq("is_offered", true);

        if (fetchError) throw fetchError;
        // Extract the service details from the nested structure
        const servicesForLocation = data?.map(ls => ls.services).filter(s => s !== null) as Service[] || [];
        setServices(servicesForLocation);
        setLocationServices(data || []);
      } else {
        // Fetch all services (e.g., for admin management)
        const { data, error: fetchError } = await supabase
          .from("services")
          .select("*");
        if (fetchError) throw fetchError;
        setServices(data || []);
      }
    } catch (e) {
      setError(e);
      console.error("Error fetching services:", e);
      setServices([]);
      setLocationServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = async (newServiceData: TablesInsert<"services">) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("services")
        .insert(newServiceData)
        .select();
      
      if (insertError) throw insertError;
      if (data) {
        setServices(prevServices => [...prevServices, ...data]);
        return data[0];
      }
      return null;
    } catch (e) {
      setError(e);
      console.error("Error creating service:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const linkServiceToLocation = async (linkData: TablesInsert<"location_services">) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: linkError } = await supabase
        .from("location_services")
        .insert(linkData)
        .select();
      if (linkError) throw linkError;
      // Optionally refetch or update local state for locationServices
      if (data) {
        setLocationServices(prev => [...prev, ...data]);
      }
      return data ? data[0] : null;
    } catch (e) {
      setError(e);
      console.error("Error linking service to location:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Add updateService, deleteService, unlinkServiceFromLocation as needed

  return { services, locationServices, loading, error, fetchServices, createService, linkServiceToLocation };
};

