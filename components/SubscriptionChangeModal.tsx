"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SubscriptionPackage } from "@/types/subscription";
import { TrendingUp, TrendingDown, Calendar, DollarSign, Download } from "lucide-react";

interface SubscriptionChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: SubscriptionPackage | null;
  newPlan: SubscriptionPackage;
  isUpgrade: boolean;
  loading?: boolean;
}

export default function SubscriptionChangeModal({
  isOpen,
  onClose,
  onConfirm,
  currentPlan,
  newPlan,
  isUpgrade,
  loading = false,
}: SubscriptionChangeModalProps) {
  if (!currentPlan) return null;

  const priceDifference = Math.abs(newPlan.basePrice - currentPlan.basePrice);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUpgrade ? (
              <>
                <TrendingUp className="w-5 h-5 text-green-600" />
                Upgrade to {newPlan.name}?
              </>
            ) : (
              <>
                <TrendingDown className="w-5 h-5 text-orange-600" />
                Downgrade to {newPlan.name}?
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isUpgrade
              ? "Your subscription will be upgraded immediately"
              : "Your current plan will remain active until the end of this billing period"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {/* Current Plan */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Current Plan</div>
            <div className="font-semibold text-lg">{currentPlan.name}</div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>${currentPlan.basePrice}/month</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{currentPlan.dailyDownloadLimit} downloads/day</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="text-center">
            {isUpgrade ? (
              <TrendingUp className="w-8 h-8 mx-auto text-green-600" />
            ) : (
              <TrendingDown className="w-8 h-8 mx-auto text-orange-600" />
            )}
          </div>

          {/* New Plan */}
          <div
            className={`p-4 rounded-lg ${
              isUpgrade
                ? "bg-green-50 border-2 border-green-200"
                : "bg-orange-50 border-2 border-orange-200"
            }`}
          >
            <div className="text-sm text-gray-600 mb-2">New Plan</div>
            <div className="font-semibold text-lg">{newPlan.name}</div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>${newPlan.basePrice}/month</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{newPlan.dailyDownloadLimit} downloads/day</span>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              {isUpgrade ? (
                <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
              ) : (
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              )}
              <div className="text-sm">
                {isUpgrade ? (
                  <>
                    <div className="font-medium text-blue-900 mb-1">
                      Immediate Upgrade with Proration
                    </div>
                    <div className="text-blue-700">
                      You&apos;ll be charged a prorated amount of approximately $
                      {priceDifference.toFixed(2)} for the remaining days in this billing
                      cycle. Your next full charge will be ${newPlan.basePrice}.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-medium text-blue-900 mb-1">
                      Downgrade at Period End
                    </div>
                    <div className="text-blue-700">
                      You&apos;ll keep access to {currentPlan.name} until your current billing
                      period ends. After that, you&apos;ll be charged ${newPlan.basePrice}
                      /month for {newPlan.name}.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={isUpgrade ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {loading
              ? "Processing..."
              : isUpgrade
              ? `Upgrade Now`
              : `Schedule Downgrade`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
