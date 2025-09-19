import React from 'react';
import { Views } from '@/components/pages/Views';
import { NavBar } from '@/components/NavBar';
export default function ViewsPage() {
  return <>
      <NavBar />
      <main className="container mx-auto px-4 py-6">
        <Views />
      </main>
    </>;
}