import { useCallback, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import type { Database, Tables } from "../integrations/supabase/types";

export type Location = Tables<"locations">;

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("locations")
        .select("*");

      if (fetchError) {
        throw fetchError;
      }
      setLocations(data || []);
    } catch (e) {
      setError(e);
      console.error("Error fetching locations:", e);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add more functions for create, update, delete as needed for admin UI
  // Example: Create Location
  const createLocation = async (newLocationData: TablesInsert<"locations">) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("locations")
        .insert(newLocationData)
        .select();
      
      if (insertError) {
        throw insertError;
      }
      if (data) {
        setLocations(prevLocations => [...prevLocations, ...data]);
        return data[0];
      }
      return null;
    } catch (e) {
      setError(e);
      console.error("Error creating location:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };


  return { locations, loading, error, fetchLocations, createLocation };
};

