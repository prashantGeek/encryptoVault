'use client';

import { useState } from 'react';
import { fileApi } from '@/src/lib/api';
import { toast } from 'react-hot-toast';

interface FileCardProps {
  file: {
    id: number;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
  };
  onDelete: () => void;
}

export default function FileCard({ file, onDelete }: FileCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
    if (mimeType.includes('text')) return '📝';
    return '📁';
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fileApi.getDownloadUrl(file.id);
      const { downloadUrl } = response.data;

      // Open download URL in new tab (browser will download the file)
      window.open(downloadUrl, '_blank');
      
      toast.success('Download started');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(error?.response?.data?.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${file.fileName}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      await fileApi.deleteFile(file.id);
      toast.success('File deleted successfully');
      onDelete();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="clean-card" style={{ padding: '20px', transition: 'all 0.2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {/* File Icon */}
        <div style={{ fontSize: '32px', flexShrink: 0 }}>
          {getFileIcon(file.mimeType)}
        </div>

        {/* File Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={file.fileName}
          >
            {file.fileName}
          </h3>
          <p style={{ fontSize: '14px', color: 'hsl(var(--color-text-secondary))' }}>
            {formatFileSize(file.fileSize)} • {formatDate(file.createdAt)}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={handleDownload}
            disabled={downloading || deleting}
            style={{
              padding: '8px 16px',
              background: 'hsl(var(--color-accent))',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: downloading || deleting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: downloading || deleting ? 0.5 : 1,
            }}
          >
            {downloading ? '...' : '⬇ Download'}
          </button>
          <button
            onClick={handleDelete}
            disabled={downloading || deleting}
            style={{
              padding: '8px 16px',
              background: 'white',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: downloading || deleting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: downloading || deleting ? 0.5 : 1,
            }}
          >
            {deleting ? '...' : '🗑️ Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
