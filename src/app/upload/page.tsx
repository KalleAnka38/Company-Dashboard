import React from 'react';
import { Upload } from '@/components/pages/Upload';
import { NavBar } from '@/components/NavBar';
export default function UploadPage() {
  return <>
      <NavBar />
      <main className="container mx-auto px-4 py-6">
        <Upload />
      </main>
    </>;
}