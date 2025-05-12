import { useCallback, useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from "../integrations/supabase/types";

export type MessageTemplate = Tables<"message_templates">;

export const useMessageTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchMessageTemplates = useCallback(async (type?: Enums<"message_template_type">) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("message_templates").select("*");

      if (type) {
        query = query.eq("type", type);
      }
      query = query.order("name", { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }
      setTemplates(data || []);
    } catch (e) {
      setError(e);
      console.error("Error fetching message templates:", e);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMessageTemplate = async (newTemplateData: TablesInsert<"message_templates">) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("message_templates")
        .insert(newTemplateData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
      if (data) {
        setTemplates(prevTemplates => [...prevTemplates, data].sort((a,b) => a.name.localeCompare(b.name)));
        return data;
      }
      return null;
    } catch (e) {
      setError(e);
      console.error("Error creating message template:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMessageTemplate = async (templateId: string, updates: TablesUpdate<"message_templates">) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from("message_templates")
        .update(updates)
        .eq("id", templateId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }
      if (data) {
        setTemplates(prevTemplates => 
          prevTemplates.map(tmpl => tmpl.id === templateId ? data : tmpl)
                         .sort((a,b) => a.name.localeCompare(b.name))
        );
        return data;
      }
      return null;
    } catch (e) {
      setError(e);
      console.error("Error updating message template:", e);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteMessageTemplate = async (templateId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from("message_templates")
        .delete()
        .eq("id", templateId);

      if (deleteError) {
        throw deleteError;
      }
      setTemplates(prevTemplates => prevTemplates.filter(tmpl => tmpl.id !== templateId));
      return true;
    } catch (e) {
      setError(e);
      console.error("Error deleting message template:", e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessageTemplates(); // Initial fetch all
  }, [fetchMessageTemplates]);

  return { templates, loading, error, fetchMessageTemplates, createMessageTemplate, updateMessageTemplate, deleteMessageTemplate };
};

