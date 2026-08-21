import React from 'react';

interface LoadingOverlayProps {
  message: string;
}

/**
 * Simple overlay that blocks UI and displays a loading message.
 * Uses the project's design system colors and spacing.
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-slate-800 rounded-md p-6 shadow-lg flex flex-col items-center">
      {/* Spinner can be a simple CSS animation */}
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-600 mb-4" />
      <p className="text-slate-800 dark:text-slate-200 text-lg font-medium">{message}</p>
    </div>
  </div>
);
