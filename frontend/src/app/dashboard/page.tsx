'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { fileApi } from '@/src/lib/api';
import Navbar from '@/src/components/Navbar';
import FileUpload from '@/src/components/FileUpload';
import FileCard from '@/src/components/FileCard';
import { toast } from 'react-hot-toast';

interface File {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const fetchFiles = async () => {
    try {
      const response = await fileApi.getFiles();
      setFiles(response.data.files);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  const handleUploadComplete = () => {
    fetchFiles();
  };

  const handleFileDelete = () => {
    fetchFiles();
  };

  if (isLoading || !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--color-bg))' }}>
      <Navbar />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            My Files
          </h1>
          <p style={{ fontSize: '16px', color: 'hsl(var(--color-text-secondary))' }}>
            Upload and manage your encrypted files
          </p>
        </div>

        {/* Upload Section */}
        <div style={{ marginBottom: '40px' }}>
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>

        {/* Files List */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
            Your Files ({files.length})
          </h2>

          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '40px',
              }}
            >
              <div className="spinner" style={{ width: '32px', height: '32px' }} />
            </div>
          ) : files.length === 0 ? (
            <div
              className="clean-card"
              style={{
                padding: '60px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                No files yet
              </h3>
              <p style={{ fontSize: '14px', color: 'hsl(var(--color-text-secondary))' }}>
                Upload your first file to get started
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {files.map((file) => (
                <FileCard key={file.id} file={file} onDelete={handleFileDelete} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}