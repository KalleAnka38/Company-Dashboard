import React from 'react';
import { Finder } from '@/components/pages/Finder';
import { NavBar } from '@/components/NavBar';
export default function FinderPage() {
  return <>
      <NavBar />
      <main className="container mx-auto px-4 py-6">
        <Finder />
      </main>
    </>;
}