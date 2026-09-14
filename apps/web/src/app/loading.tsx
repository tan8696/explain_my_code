import React from 'react';
import { LoadingState } from '@/components/LoadingState';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <LoadingState />
      </div>
    </div>
  );
}
