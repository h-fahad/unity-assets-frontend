"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, Package } from "lucide-react";

interface DownloadConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  assetName?: string;
  remainingDownloads?: number | 'unlimited';
  isDownloading?: boolean;
}

export default function DownloadConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  assetName,
  remainingDownloads,
  isDownloading = false,
}: DownloadConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const getRemainingText = () => {
    if (remainingDownloads === 'unlimited') {
      return 'unlimited downloads';
    }
    if (remainingDownloads === 1) {
      return '1 download remaining today';
    }
    return `${remainingDownloads} downloads remaining today`;
  };

  const showWarning = remainingDownloads !== 'unlimited' && typeof remainingDownloads === 'number' && remainingDownloads <= 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogClose onClick={() => onOpenChange(false)} />

        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-left">Confirm Download</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-left">
            {assetName ? (
              <>
                You are about to download <span className="font-semibold text-gray-900">{assetName}</span>
              </>
            ) : (
              'You are about to download this asset'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Download Info */}
        <div className="py-4 space-y-3">
          {remainingDownloads !== undefined && (
            <div className={`flex items-start gap-3 p-3 rounded-lg ${
              showWarning ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'
            }`}>
              {showWarning ? (
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Package className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${showWarning ? 'text-amber-900' : 'text-gray-900'}`}>
                  {getRemainingText()}
                </p>
                {showWarning && typeof remainingDownloads === 'number' && (
                  <p className="text-xs text-amber-700 mt-1">
                    Your download limit will reset tomorrow. Use your remaining downloads wisely.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1 px-1">
            <p>• Downloads are tracked per your subscription plan</p>
            <p>• Download limits reset daily at midnight</p>
            <p>• Make sure you have sufficient storage space</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDownloading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isDownloading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Confirm Download
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
