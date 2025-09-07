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

  // Download Icon Component
  const DownloadIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
  );

  // Loading/Spinner Icon Component
  const LoadingIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Lock Icon Component
  const LockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  // Login Icon Component
  const LoginIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Check current download status before attempting download
      const currentStatus = await downloadService.getDownloadStatus();
      setDownloadStatus(currentStatus);
      
      // If user cannot download based on current status, prevent download
      if (!currentStatus.canDownload && !currentStatus.isAdmin) {
        let errorMsg = currentStatus.message;
        
        if (currentStatus.remainingDownloads === 0) {
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
        } else if (!currentStatus.hasSubscription) {
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
        setDownloading(false);
        return;
      }
      
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
      <Button 
        variant="default" 
        size="sm" 
        onClick={() => router.push('/signin')} 
        className="w-full h-full flex items-center justify-center gap-2"
      >
        <LoginIcon className="w-4 h-4" />
        Login to Download
      </Button>
    );
  }

  if (loadingStatus) {
    return (
      <Button 
        variant="default" 
        size="sm" 
        disabled 
        className="w-full h-full flex items-center justify-center gap-2"
      >
        <LoadingIcon className="w-4 h-4" />
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
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
          title="Admin - Unlimited Downloads"
          className="w-full h-full flex items-center justify-center gap-2"
        >
          {downloading ? (
            <>
              <LoadingIcon className="w-4 h-4" />
              Downloading...
            </>
          ) : (
            <>
              <DownloadIcon className="w-4 h-4" />
              Download
            </>
          )}
        </Button>
      );
    }

    // User doesn't have subscription
    if (!downloadStatus.hasSubscription) {
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/packages')}
          title={downloadStatus.message}
          className="w-full h-full flex items-center justify-center gap-2"
        >
          <LockIcon className="w-4 h-4" />
          Subscribe to Download
        </Button>
      );
    }

    // User has subscription but no downloads left
    if (!downloadStatus.canDownload && downloadStatus.remainingDownloads === 0) {
      return (
        <Button 
          variant="destructive" 
          size="sm"
          disabled
          title={`${downloadStatus.message}${downloadStatus.resetsAt ? ` Resets at ${new Date(downloadStatus.resetsAt).toLocaleTimeString()}` : ''}`}
          className="w-full h-full flex items-center justify-center gap-2"
        >
          <LockIcon className="w-4 h-4" />
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
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
          title={`${remainingText}${downloadStatus.subscription ? ` (${downloadStatus.subscription.planName})` : ''}`}
          className="w-full h-full flex items-center justify-center gap-2"
        >
          {downloading ? (
            <>
              <LoadingIcon className="w-4 h-4" />
              Downloading...
            </>
          ) : (
            <>
              <DownloadIcon className="w-4 h-4" />
              Download
            </>
          )}
        </Button>
      );
    }
  }

  // Fallback if no download status
  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleDownload}
      disabled={downloading}
      className="w-full h-full flex items-center justify-center gap-2"
    >
      {downloading ? (
        <>
          <LoadingIcon className="w-4 h-4" />
          Downloading...
        </>
      ) : (
        <>
          <DownloadIcon className="w-4 h-4" />
          Download
        </>
      )}
    </Button>
  );
} 