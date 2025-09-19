import React from 'react';
import { SupabaseConnectionTest } from '../components/SupabaseConnectionTest';
export const TestSupabase: React.FC = () => {
  return <div className="py-8">
      <h1 className="text-2xl font-bold text-center mb-8 text-white">
        Supabase Connection Testing
      </h1>
      <SupabaseConnectionTest />
    </div>;
};
export default TestSupabase;