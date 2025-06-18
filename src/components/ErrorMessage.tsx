import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-3 text-red-600">
        <AlertCircle className="w-6 h-6" />
        <span>{message}</span>
      </div>
    </div>
  );
};