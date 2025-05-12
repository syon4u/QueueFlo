
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
  error: Error | unknown;
  onRetry?: () => void;
}

export const ErrorAlert = ({ error, onRetry }: ErrorAlertProps) => {
  let errorMessage = 'An unknown error occurred';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null) {
    errorMessage = JSON.stringify(error);
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Loading Users</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{errorMessage}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="self-start mt-2"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
