"use client";

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { downloadService, type DownloadStatus } from '@/services/downloadService';
import toast from 'react-hot-toast';

interface DownloadButtonProps {
  assetId: string;
}

export default function DownloadButton({ assetId }: DownloadButtonProps) {
  const { user, refreshUser } = useUserStore();
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const result = await downloadService.downloadAsset(assetId);
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.asset.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Download started for ${result.asset.name}`);
      
      // Refresh download status after successful download
      await fetchDownloadStatus();
      refreshUser();
    } catch (error: any) {
      let errorMsg = 'Unknown error occurred';
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      // Handle different types of errors with appropriate styling and actions
      if (error.response?.status === 403) {
        if (errorMsg.includes('download limit')) {
          toast.error(errorMsg, {
            duration: 6000,
            style: {
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              fontSize: '14px',
              fontWeight: '500',
            },
            icon: '⚠️',
          });
        } else if (errorMsg.includes('subscription')) {
          toast.error(errorMsg, {
            duration: 5000,
            style: {
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              fontSize: '14px',
              fontWeight: '500',
            },
            icon: '💳',
          });
        } else {
          toast.error(errorMsg, {
            duration: 4000,
            icon: '🚫',
          });
        }
      } else if (error.response?.status === 429) {
        toast.error(errorMsg, {
          duration: 6000,
          style: {
            background: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #fecaca',
          },
          icon: '⚠️',
        });
      } else {
        toast.error(`Download failed: ${errorMsg}`);
      }
      
      // Refresh status after error to get updated info
      await fetchDownloadStatus();
    } finally {
      setDownloading(false);
    }
  };
  
  const fetchDownloadStatus = async () => {
    if (!user) {
      setLoadingStatus(false);
      return;
    }
    
    try {
      const status = await downloadService.getDownloadStatus();
      setDownloadStatus(status);
    } catch (error) {
      console.error('Failed to fetch download status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchDownloadStatus();
  }, [user]);

  if (!user) {
    return (
      <Button variant="default" onClick={() => router.push('/signin')}>
        Login to Download
      </Button>
    );
  }

  if (loadingStatus) {
    return (
      <Button variant="default" disabled>
        Checking...
      </Button>
    );
  }

  // Show download status info
  if (downloadStatus) {
    // Admin users have unlimited access
    if (downloadStatus.isAdmin) {
      return (
        <Button
          variant="default"
          onClick={handleDownload}
          disabled={downloading}
          title="Admin - Unlimited Downloads"
        >
          {downloading ? 'Downloading...' : 'Download'}
        </Button>
      );
    }

    // User doesn't have subscription
    if (!downloadStatus.hasSubscription) {
      return (
        <Button 
          variant="outline" 
          onClick={() => router.push('/packages')}
          title={downloadStatus.message}
        >
          Subscribe to Download
        </Button>
      );
    }

    // User has subscription but no downloads left
    if (!downloadStatus.canDownload && downloadStatus.remainingDownloads === 0) {
      return (
        <Button 
          variant="destructive" 
          disabled
          title={`${downloadStatus.message}${downloadStatus.resetsAt ? ` Resets at ${new Date(downloadStatus.resetsAt).toLocaleTimeString()}` : ''}`}
        >
          Daily Limit Reached
        </Button>
      );
    }

    // User can download
    if (downloadStatus.canDownload) {
      const remainingText = downloadStatus.remainingDownloads === 'unlimited' 
        ? 'Unlimited' 
        : `${downloadStatus.remainingDownloads} left today`;
      
      return (
        <Button
          variant="default"
          onClick={handleDownload}
          disabled={downloading}
          title={`${remainingText}${downloadStatus.subscription ? ` (${downloadStatus.subscription.planName})` : ''}`}
        >
          {downloading ? 'Downloading...' : 'Download'}
        </Button>
      );
    }
  }

  // Fallback if no download status
  return (
    <Button
      variant="default"
      onClick={handleDownload}
      disabled={downloading}
    >
      {downloading ? 'Downloading...' : 'Download'}
    </Button>
  );
} 