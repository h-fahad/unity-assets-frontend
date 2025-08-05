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
  const { user, decrementDownload } = useUserStore();
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
      const errorMsg = error.response?.data?.message || 'Unknown error';
      toast.error(`Download failed: ${errorMsg}`);
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