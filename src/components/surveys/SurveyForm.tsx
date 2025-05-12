import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // For potential future use, e.g., text input for 'other' option
import { useSurveys, Survey, SurveyQuestion, SurveyResponse } from '@/hooks/useSurveys'; // Adjust path as needed
import { Loader2, Send } from 'lucide-react';

// Define a schema for a single question's answer based on its type
const createAnswerSchema = (questionType: SurveyQuestion['question_type']) => {
  switch (questionType) {
    case 'rating':
      return z.number().min(1).max(5); // Assuming a 1-5 rating scale for simplicity
    case 'text':
      return z.string().min(1, { message: "Please provide an answer." }).max(500, { message: "Answer too long." });
    case 'multiple_choice':
      return z.string().min(1, { message: "Please select an option." });
    default:
      return z.any();
  }
};

interface SurveyFormProps {
  surveyId: string; // To fetch the specific survey
  appointmentId?: string; // Optional: to link response to an appointment
  onSurveyComplete: () => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ surveyId, appointmentId, onSurveyComplete }) => {
  const { survey, questions, loading, error, submitting, fetchSurveyWithQuestions, submitSurveyResponse } = useSurveys();
  const [formSchema, setFormSchema] = useState<z.ZodObject<any> | null>(null);

  useEffect(() => {
    fetchSurveyWithQuestions(surveyId);
  }, [fetchSurveyWithQuestions, surveyId]);

  // Dynamically build Zod schema based on fetched questions
  useEffect(() => {
    if (questions.length > 0) {
      const schemaShape: { [key: string]: z.ZodTypeAny } = {};
      questions.forEach(q => {
        schemaShape[q.id] = createAnswerSchema(q.question_type);
      });
      setFormSchema(z.object(schemaShape));
    }
  }, [questions]);

  const form = useForm<Record<string, any>>({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
  });

  const onSubmit = async (data: Record<string, any>) => {
    if (!survey) return;

    const answers = Object.entries(data).map(([question_id, answer]) => ({
      question_id,
      answer,
    }));

    const response: SurveyResponse = {
      survey_id: survey.id,
      appointment_id: appointmentId,
      answers,
    };

    try {
      await submitSurveyResponse(response);
      // alert('Survey submitted successfully!'); // Or use a toast notification
      onSurveyComplete();
    } catch (err) {
      console.error("Survey submission failed:", err);
      // alert('Failed to submit survey. Please try again.'); // Or use a toast notification
      form.setError("root.serverError", { type: "manual", message: "Failed to submit survey. Please try again." });
    }
  };

  if (loading || !formSchema) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-2">Loading survey...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">Error loading survey: {error.message || 'Unknown error'}</p>;
  }

  if (!survey || questions.length === 0) {
    return <p className="text-center text-gray-500">Survey not found or no questions available.</p>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{survey.title || 'Feedback Survey'}</CardTitle>
        {survey.description && <CardDescription>{survey.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {questions.map((question) => (
              <FormField
                key={question.id}
                control={form.control}
                name={question.id}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">{question.question_text}</FormLabel>
                    <FormControl>
                      <>
                        {question.question_type === 'rating' && (
                          // Simple 1-5 rating, could be stars or radio buttons
                          <RadioGroup
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                            className="flex space-x-2"
                          >
                            {[1, 2, 3, 4, 5].map(num => (
                              <FormItem key={num} className="flex items-center space-x-1 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={num.toString()} />
                                </FormControl>
                                <FormLabel className="font-normal">{num}</FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        )}
                        {question.question_type === 'text' && (
                          <Textarea placeholder="Your answer..." {...field} />
                        )}
                        {question.question_type === 'multiple_choice' && question.options && (
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            {question.options.map((option, index) => (
                              <FormItem key={index} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={option} />
                                </FormControl>
                                <FormLabel className="font-normal">{option}</FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        )}
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            {form.formState.errors.root?.serverError && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.root.serverError.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit Survey</>}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SurveyForm;

