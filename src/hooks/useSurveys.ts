import { useCallback, useState } from "react";
import { supabase } from "../integrations/supabase/client"; // Adjust path as needed
import { Database } from "../integrations/supabase/types"; // Adjust path as needed

export type Survey = Database["public"]["Tables"]["surveys"]["Row"];
export type SurveyQuestion = {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: "rating" | "text" | "multiple_choice"; // Example types
  options?: string[]; // For multiple_choice
  created_at: string;
};

export type SurveyResponse = {
  id?: string;
  survey_id: string;
  user_id?: string; // Or customer_id
  appointment_id?: string;
  answers: { question_id: string; answer: any }[];
  submitted_at?: string;
};

export const useSurveys = () => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchSurveyWithQuestions = useCallback(async (surveyId: string) => {
    setLoading(true);
    setError(null);
    try {
      // First, fetch the survey details
      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", surveyId)
        .single();

      if (surveyError) throw surveyError;
      setSurvey(surveyData);

      // Then, fetch the questions for that survey (assuming a related table or a JSONB field for questions)
      // This is a placeholder. You might have a separate `survey_questions` table.
      // For this example, let's assume questions are hardcoded or fetched differently.
      // In a real scenario, you would query `survey_questions` table where `survey_id` matches.
      const mockQuestions: SurveyQuestion[] = [
        {
          id: "q1",
          survey_id: surveyId,
          question_text: "How satisfied are you with our service?",
          question_type: "rating", // 1-5 stars
          created_at: new Date().toISOString(),
        },
        {
          id: "q2",
          survey_id: surveyId,
          question_text: "How likely are you to recommend us to a friend?",
          question_type: "rating", // 0-10 scale
          created_at: new Date().toISOString(),
        },
        {
          id: "q3",
          survey_id: surveyId,
          question_text: "Any additional comments or suggestions?",
          question_type: "text",
          created_at: new Date().toISOString(),
        },
      ];
      setQuestions(mockQuestions);

    } catch (e) {
      setError(e);
      console.error("Error fetching survey:", e);
      setSurvey(null);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitSurveyResponse = useCallback(async (response: SurveyResponse) => {
    setSubmitting(true);
    setError(null);
    try {
      // In a real app, you would get the user_id from auth state
      const { data: { user } } = await supabase.auth.getUser();
      response.user_id = user?.id;
      response.submitted_at = new Date().toISOString();

      // Assuming you have a `survey_responses` table
      // This is a placeholder for the actual table structure
      const { data, error: submissionError } = await supabase
        .from("survey_responses") // Replace with your actual table name for responses
        .insert([response])
        .select();

      if (submissionError) throw submissionError;
      return data;
    } catch (e) {
      setError(e);
      console.error("Error submitting survey response:", e);
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { survey, questions, loading, error, submitting, fetchSurveyWithQuestions, submitSurveyResponse };
};

