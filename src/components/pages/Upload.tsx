import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { UploadIcon, FileIcon, AlertCircleIcon, CheckCircleIcon, XIcon, ShieldIcon } from 'lucide-react';
import { bulkUpload } from '@/lib/api';
import { validateFile, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/security/fileValidation';
import { useSecurity } from '@/lib/security/SecurityContext';
import { getApiKey } from '@/lib/security/apiKeyValidation';
import { logSecurityEvent } from '@/lib/security/logger';
export const Upload: React.FC = () => {
  const {
    csrfToken
  } = useSecurity();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadStats, setUploadStats] = useState<{
    created: number;
    updated: number;
    total: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setFileError('');
    setUploadSuccess(false);
    if (selectedFile) {
      // Validate the file
      const validationResult = await validateFile(selectedFile);
      if (!validationResult.valid) {
        setFileError(validationResult.error || 'Invalid file');
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setFile(null);
      }
    }
  };
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0] || null;
    if (droppedFile) {
      // Validate the file
      const validationResult = await validateFile(droppedFile);
      if (validationResult.valid) {
        setFile(droppedFile);
        setFileError('');
        setUploadSuccess(false);
      } else {
        setFileError(validationResult.error || 'Invalid file');
        setFile(null);
      }
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const handleUpload = async () => {
    if (!file) {
      setFileError('Please select a file to upload');
      return;
    }
    const apiKey = getApiKey();
    if (!apiKey) {
      toast.error('API key is required. Please set it in Settings.');
      return;
    }
    setIsUploading(true);
    setFileError('');
    try {
      // Log the upload attempt
      logSecurityEvent({
        type: 'FILE',
        level: 'INFO',
        message: 'File upload initiated',
        data: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          csrfTokenPresent: !!csrfToken
        }
      });
      // Upload the file
      const result = await bulkUpload(file, true, apiKey);
      // Set success state and stats
      setUploadSuccess(true);
      setUploadStats(result);
      setFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Upload successful!');
      // Log the successful upload
      logSecurityEvent({
        type: 'FILE',
        level: 'INFO',
        message: 'File upload completed successfully',
        data: {
          created: result.created,
          updated: result.updated,
          total: result.total
        }
      });
    } catch (error) {
      const errorMessage = (error as Error).message || 'Upload failed';
      setFileError(errorMessage);
      toast.error(errorMessage);
      // Log the upload failure
      logSecurityEvent({
        type: 'FILE',
        level: 'WARNING',
        message: 'File upload failed',
        data: {
          error: errorMessage,
          fileName: file.name
        }
      });
    } finally {
      setIsUploading(false);
    }
  };
  const handleCancel = () => {
    setFile(null);
    setFileError('');
    setUploadSuccess(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  // Format file size for display
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  return <div className="max-w-4xl mx-auto">
      <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center">
            <UploadIcon size={24} className="mr-2 text-emerald-500" />
            Bulk Upload
          </h2>
          <p className="mt-2 text-gray-400">
            Upload a CSV or JSON file to add or update multiple companies at
            once.
          </p>
        </div>
        <div className="p-6">
          {/* Security Notice */}
          <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start">
              <ShieldIcon size={20} className="text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-300 mb-1">
                  Security Notice
                </h3>
                <p className="text-sm text-gray-400">
                  Files are scanned for security threats before processing. Only
                  CSV and JSON formats are accepted, with a maximum file size of{' '}
                  {formatFileSize(MAX_FILE_SIZE)}.
                </p>
              </div>
            </div>
          </div>
          {/* File Upload Area */}
          <div onDrop={handleDrop} onDragOver={handleDragOver} className={`border-2 border-dashed rounded-lg p-8 text-center ${fileError ? 'border-red-500 bg-red-500/10' : file ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-gray-600'} transition-colors duration-200`}>
            {!file ? <div className="py-4">
                <div className="mb-4 bg-gray-700 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                  <UploadIcon size={28} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Drag & Drop or Select File
                </h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Supported formats: CSV, JSON
                  <br />
                  Maximum size: {formatFileSize(MAX_FILE_SIZE)}
                </p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={ALLOWED_FILE_TYPES.join(',')} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg cursor-pointer inline-flex items-center transition-colors duration-200">
                  <FileIcon size={16} className="mr-2" />
                  Browse Files
                </label>
              </div> : <div className="py-4">
                <div className="mb-4 bg-emerald-900 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                  <FileIcon size={28} className="text-emerald-300" />
                </div>
                <h3 className="text-lg font-medium text-emerald-400 mb-1">
                  File Selected
                </h3>
                <p className="text-gray-400 font-medium">{file.name}</p>
                <p className="text-gray-500 text-sm mb-4">
                  {formatFileSize(file.size)} • {file.type}
                </p>
                <div className="flex justify-center space-x-3">
                  <button onClick={handleCancel} className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-lg inline-flex items-center transition-colors duration-200" disabled={isUploading}>
                    <XIcon size={16} className="mr-2" />
                    Cancel
                  </button>
                  <button onClick={handleUpload} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg inline-flex items-center transition-colors duration-200" disabled={isUploading}>
                    {isUploading ? <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Uploading...
                      </> : <>
                        <UploadIcon size={16} className="mr-2" />
                        Upload File
                      </>}
                  </button>
                </div>
              </div>}
          </div>
          {/* Error Message */}
          {fileError && <div className="mt-4 bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-400 flex items-start">
              <AlertCircleIcon size={20} className="mr-3 flex-shrink-0 mt-0.5" />
              <span>{fileError}</span>
            </div>}
          {/* Success Message */}
          {uploadSuccess && uploadStats && <div className="mt-4 bg-emerald-900/30 border border-emerald-800 rounded-lg p-4 text-emerald-400 flex items-start">
              <CheckCircleIcon size={20} className="mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Upload successful!</p>
                <p className="text-sm mt-1">
                  Processed {uploadStats.total} companies: {uploadStats.created}{' '}
                  created, {uploadStats.updated} updated
                </p>
              </div>
            </div>}
          {/* CSRF Token for form submission */}
          <input type="hidden" name="csrf_token" value={csrfToken} />
        </div>
        <div className="bg-gray-850 p-6 border-t border-gray-800">
          <h3 className="font-medium text-gray-300 mb-3">
            File Format Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-emerald-400 mb-2">
                CSV Format
              </h4>
              <p className="text-sm text-gray-400 mb-2">
                CSV files must include a header row with the following columns:
              </p>
              <code className="text-xs bg-gray-900 p-2 rounded block font-mono text-gray-300 whitespace-pre-wrap">
                name,sector,website,employees,growth_rate,recent_funding,stale_design,clarity_score,churn_indicators,hq
              </code>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-emerald-400 mb-2">
                JSON Format
              </h4>
              <p className="text-sm text-gray-400 mb-2">
                JSON files must contain an array of objects with the following
                structure:
              </p>
              <code className="text-xs bg-gray-900 p-2 rounded block font-mono text-gray-300 whitespace-pre-wrap">
                {`[
  {
    "name": "Company Name",
    "sector": "Industry",
    "website": "https://example.com",
    ...
  }
]`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>;
};