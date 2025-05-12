import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SurveyForm from '@/components/surveys/SurveyForm'; // Adjust path as needed
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TakeSurveyPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();

  if (!surveyId) {
    return <p>Survey ID is missing.</p>;
  }

  const handleSurveyComplete = () => {
    // Navigate to a thank you page, or back to dashboard, or show a message
    alert('Thank you for completing the survey!');
    navigate('/customer/dashboard'); // Example navigation
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <SurveyForm surveyId={surveyId} onSurveyComplete={handleSurveyComplete} />
    </div>
  );
};

export default TakeSurveyPage;

