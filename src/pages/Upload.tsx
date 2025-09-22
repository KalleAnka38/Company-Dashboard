// src/pages/Upload.tsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UploadIcon, FileTextIcon, FileJsonIcon, CheckCircleIcon } from 'lucide-react';
import { bulkUpload } from '../api/companies_api';

export const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    created: number;
    updated: number;
    total: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      // Only allow CSV or JSON
      const allowed = ['text/csv', 'application/json'];
      if (!allowed.includes(selectedFile.type)) {
        toast.error('Please select a CSV or JSON file');
        return;
      }

      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];

      const allowed = ['text/csv', 'application/json'];
      if (!allowed.includes(droppedFile.type)) {
        toast.error('Please drop a CSV or JSON file');
        return;
      }

      setFile(droppedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      // Your companiesApi.ts returns: { inserted, updated?, ... }
      const result = await bulkUpload(file);

      const created = result?.inserted ?? 0;
      const updated = result?.updated ?? 0;

      setUploadResult({
        created,
        updated,
        total: created + updated,
      });

      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-medium text-white mb-6">
          Upload Company Data
        </h2>

        {/* File Upload Area */}
        <div
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.json"
            className="hidden"
          />

          {!file ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <UploadIcon size={48} className="text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-300">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  or click to browse (CSV or JSON only)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                {file.type === 'text/csv' ? (
                  <FileTextIcon size={48} className="text-blue-400" />
                ) : (
                  <FileJsonIcon size={48} className="text-green-400" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-300">{file.name}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {(file.size / 1024).toFixed(2)} KB • {file.type}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="mt-6 flex space-x-3">
          {file && !uploadResult && (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors flex items-center"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon size={16} className="mr-2" />
                    Upload
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Upload Results */}
        {uploadResult && (
          <div className="mt-8 bg-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircleIcon size={24} className="text-green-400 mr-2" />
              <h3 className="text-lg font-medium text-white">
                Upload Successful
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {uploadResult.created}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Companies Created
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">
                  {uploadResult.updated}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Companies Updated
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-300">
                  {uploadResult.total}
                </div>
                <div className="text-sm text-gray-400 mt-1">Total Records</div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-gray-300 rounded hover:bg-gray-500 transition-colors"
              >
                Upload Another File
              </button>
              <Link
                to="/"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
              >
                Go to Finder
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
