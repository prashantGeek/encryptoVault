'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { fileApi, uploadToS3 } from '@/src/lib/api';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface FileUploadProps {
  onUploadComplete: () => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFileSelect = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large. Maximum size is 50MB');
      return;
    }

    if (file.size === 0) {
      toast.error('File is empty');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Get signed upload URL from backend
      const response = await fileApi.generateUploadUrl({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
      });

      const { uploadUrl, fileId, key } = response.data;

      // Step 2: Upload file directly to S3
      setProgress(50);
      await uploadToS3(uploadUrl, file);
      setProgress(80);

      // Step 3: Manually call webhook to mark file as completed
      // (This simulates what Lambda would do)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await axios.post(`${API_URL}/files/webhook`, {
        key: key,
        size: file.size
      }, {
        headers: {
          'x-webhook-secret': 'abc123'
        }
      });
      
      setProgress(100);
      toast.success(`${file.name} uploaded successfully!`);
      
      // Wait for database to update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh file list
      onUploadComplete();
      
      setTimeout(() => setProgress(0), 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="clean-card" style={{ padding: '32px' }}>
      <div
        onClick={uploading ? undefined : handleClick}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={uploading ? undefined : handleDrop}
        style={{
          border: `2px dashed ${dragActive ? 'hsl(var(--color-accent))' : 'hsl(var(--color-border))'}`,
          borderRadius: '8px',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          background: dragActive ? 'hsl(0 0% 98%)' : 'transparent',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
            <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>
              Uploading... {progress}%
            </p>
            <div
              style={{
                width: '100%',
                maxWidth: '300px',
                height: '8px',
                background: 'hsl(var(--color-border))',
                borderRadius: '4px',
                margin: '0 auto',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'hsl(var(--color-accent))',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📁</div>
            <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
              Click to upload or drag and drop
            </p>
            <p style={{ fontSize: '14px', color: 'hsl(var(--color-text-secondary))' }}>
              Maximum file size: 50MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}