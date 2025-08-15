"use client";

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { assetService } from '@/services/assetService';
import { subscriptionService } from '@/services/subscriptionService';
import toast from 'react-hot-toast';

interface DownloadButtonProps {
  assetId: string;
}

export default function DownloadButton({ assetId }: DownloadButtonProps) {
  const { user, decrementDownload, refreshUser } = useUserStore();
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const result = await assetService.downloadAsset(Number(assetId));
      decrementDownload();
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.asset.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Download started for ${result.asset.name}`);
    } catch (error: any) {
      let errorMsg = 'Unknown error occurred';
      
      if (error.response?.data?.message) {
        // Handle API error response
        errorMsg = error.response.data.message;
      } else if (error.message) {
        // Handle general error
        errorMsg = error.message;
      }
      
      // Handle different types of errors with appropriate styling and actions
      if (error.response?.status === 403) {
        if (errorMsg.includes('download limit')) {
          // Download limit reached
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
          // Refresh user data to update download counts
          refreshUser();
        } else if (errorMsg.includes('subscription')) {
          // Subscription required
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
          // Other forbidden errors
          toast.error(errorMsg, {
            duration: 4000,
            icon: '🚫',
          });
        }
      } else {
        toast.error(`Download failed: ${errorMsg}`);
      }
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setCheckingSubscription(false);
        return;
      }

      try {
        // Admins have unlimited access
        if (user.role === 'ADMIN') {
          setHasActiveSubscription(true);
          setCheckingSubscription(false);
          return;
        }

        const activeSubscription = await subscriptionService.getMyActiveSubscription();
        setHasActiveSubscription(!!activeSubscription);
      } catch (error) {
        console.error('Failed to check subscription:', error);
        setHasActiveSubscription(false);
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [user]);

  if (!user) {
    return (
      <Button variant="default" onClick={() => router.push('/signin')}>
        Login to Download
      </Button>
    );
  }

  if (checkingSubscription) {
    return (
      <Button variant="default" disabled>
        Checking...
      </Button>
    );
  }

  // Admins have unlimited access
  if (user.role === 'ADMIN') {
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

  // Regular users need active subscription
  if (!hasActiveSubscription) {
    return (
      <Button variant="outline" onClick={() => router.push('/packages')}>
        Subscribe to Download
      </Button>
    );
  }

  if (user.downloadsLeft !== undefined && user.downloadsLeft <= 0) {
    return (
      <Button variant="destructive" disabled>
        Daily Limit Reached
      </Button>
    );
  }

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