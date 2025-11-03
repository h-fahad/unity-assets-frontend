"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { packageService } from "@/services/packageService";
import { paymentService, CurrentSubscription } from "@/services/paymentService";
import api from "@/lib/axios";
import { SubscriptionPackage, BillingCycle } from "@/types/subscription";
import {
  Check,
  Star,
  DollarSign,
  Calendar,
  Download,
  Crown,
  Zap,
  Shield,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import SubscriptionChangeModal from "@/components/SubscriptionChangeModal";

export default function SubscriptionPackages() {
  const { user } = useUserStore();
  const router = useRouter();
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBillingCycle, setSelectedBillingCycle] =
    useState<BillingCycle>("MONTHLY");
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState<SubscriptionPackage | null>(null);
  const [changingSubscription, setChangingSubscription] = useState(false);

  // Calculate maximum yearly discount for the badge
  const maxYearlyDiscount = packages.length > 0
    ? Math.max(...packages.map(pkg => pkg.yearlyDiscount))
    : 0;

  useEffect(() => {
    loadPackages();
    if (user) {
      loadCurrentSubscription();
    }
  }, [user]);

  const loadPackages = async () => {
    try {
      const packagesData = await packageService.getActivePackages();
      setPackages(packagesData);
    } catch (error) {
      console.error("Failed to load packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentSubscription = async () => {
    try {
      const subscriptionData = await paymentService.getCurrentSubscription();
      setCurrentSubscription(subscriptionData);
    } catch (error) {
      console.error("Failed to load current subscription:", error);
    }
  };

  const calculatePrice = (pkg: SubscriptionPackage, cycle: BillingCycle) => {
    if (cycle === "YEARLY" && pkg.billingCycle === "MONTHLY") {
      // If showing yearly price for a monthly package
      const yearlyBase = pkg.basePrice * 12;
      return yearlyBase * (1 - pkg.yearlyDiscount / 100);
    }
    return pkg.basePrice;
  };

  const getYearlySavings = (pkg: SubscriptionPackage) => {
    if (pkg.billingCycle === "MONTHLY" && pkg.yearlyDiscount > 0) {
      const monthlyTotal = pkg.basePrice * 12;
      const yearlyPrice = monthlyTotal * (1 - pkg.yearlyDiscount / 100);
      return monthlyTotal - yearlyPrice;
    }
    return 0;
  };

  const getButtonText = (pkg: SubscriptionPackage) => {
    if (!user) return "Sign In to Subscribe";
    if (!currentSubscription?.hasSubscription) return "Subscribe Now";

    const currentPlan = currentSubscription.subscription?.plan;
    if (!currentPlan) return "Subscribe Now";

    // Check if this is the current plan (comparing by plan ID and billing cycle)
    if (currentPlan._id === pkg.id) {
      return "Current Plan";
    }

    // Check if upgrade or downgrade based on price
    if (pkg.basePrice > currentPlan.basePrice) {
      return "Upgrade";
    } else if (pkg.basePrice < currentPlan.basePrice) {
      return "Downgrade";
    }

    return "Switch Plan";
  };

  const isCurrentPlan = (pkg: SubscriptionPackage) => {
    if (!currentSubscription?.hasSubscription) return false;
    return currentSubscription.subscription?.plan._id === pkg.id;
  };

  const handlePlanAction = async (pkg: SubscriptionPackage) => {
    if (!user) {
      router.push("/signin");
      return;
    }

    if (user.role === "ADMIN") {
      toast.error("Admins cannot subscribe to packages. You have unlimited access.");
      return;
    }

    // If user has no subscription, create new one
    if (!currentSubscription?.hasSubscription) {
      handleSubscribe(pkg);
      return;
    }

    // If this is the current plan, do nothing
    if (isCurrentPlan(pkg)) {
      return;
    }

    // Show change modal for upgrade/downgrade
    setSelectedNewPlan(pkg);
    setChangeModalOpen(true);
  };

  const handleConfirmChange = async () => {
    if (!selectedNewPlan) return;

    setChangingSubscription(true);
    try {
      const result = await paymentService.changeSubscription(selectedNewPlan.id);

      toast.success(result.message);

      // Reload current subscription
      await loadCurrentSubscription();

      setChangeModalOpen(false);
      setSelectedNewPlan(null);
    } catch (error: unknown) {
      console.error("Failed to change subscription:", error);
      const errorMsg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to change subscription";
      toast.error(errorMsg);
    } finally {
      setChangingSubscription(false);
    }
  };

  const handleSubscribe = async (pkg: SubscriptionPackage) => {
    if (!user) {
      router.push("/signin");
      return;
    }

    // Prevent admins from subscribing
    if (user.role === "ADMIN") {
      toast.error(
        "Admins cannot subscribe to packages. You have unlimited access."
      );
      return;
    }

    try {
      const session = await paymentService.createCheckoutSession({
        planId: pkg.id,
        billingCycle: selectedBillingCycle,
      });

      // Redirect to Stripe checkout
      window.location.href = session.url;
    } catch (error: unknown) {
      console.error("Failed to create checkout session:", error);
      const errorMsg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to start payment process";
      toast.error(errorMsg);
    }
  };

  const handleManualSubscribe = async (pkg: SubscriptionPackage) => {
    if (!user) {
      router.push("/signin");
      return;
    }

    // Prevent admins from subscribing
    if (user.role === "ADMIN") {
      toast.error(
        "Admins cannot subscribe to packages. You have unlimited access."
      );
      return;
    }

    try {
      await api.post("/payments/create-subscription-manual", {
        planId: pkg.id,
        billingCycle: selectedBillingCycle,
      });

      toast.success("Subscription created manually for testing!");

      // Refresh the page to update subscription status
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: unknown) {
      console.error("Failed to create manual subscription:", error);
      const errorMsg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to create subscription";
      toast.error(errorMsg);
    }
  };

  const getPackageIcon = (index: number) => {
    const icons = [Shield, Zap, Crown];
    const Icon = icons[index % icons.length];
    return <Icon className="w-6 h-6" />;
  };

  const getPackageGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-gold-500 to-gold-600",
    ];
    return gradients[index % gradients.length];
  };

  const isPopular = (index: number) => index === 1; // Make middle package popular

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Loading Packages...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 mb-8">
          Unlock premium Unity assets with our flexible subscription plans
        </p>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {(["MONTHLY", "YEARLY"] as BillingCycle[]).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setSelectedBillingCycle(cycle)}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                selectedBillingCycle === cycle
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {cycle === "MONTHLY" ? "Monthly" : "Yearly"}
              {cycle === "YEARLY" && maxYearlyDiscount > 0 && (
                <Badge className="ml-2 bg-green-100 text-green-800">
                  Save up to {maxYearlyDiscount}%
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages
          .filter(pkg => pkg.billingCycle === selectedBillingCycle)
          .map((pkg, index) => {
          const price = calculatePrice(pkg, selectedBillingCycle);
          const savings = getYearlySavings(pkg);
          const popular = isPopular(index);

          const isCurrent = isCurrentPlan(pkg);

          return (
            <Card
              key={pkg.id}
              className={`relative transition-all duration-300 hover:shadow-lg flex flex-col h-full ${
                popular ? "ring-2 ring-purple-500 scale-105" : ""
              } ${isCurrent ? "ring-2 ring-green-500" : ""}`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-4 py-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Current Plan
                  </Badge>
                </div>
              )}
              {!isCurrent && popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader
                className={`text-center ${
                  popular
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                    : ""
                }`}
              >
                <div className="flex justify-center mb-2">
                  {getPackageIcon(index)}
                </div>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <p
                  className={`${popular ? "text-purple-100" : "text-gray-600"}`}
                >
                  {pkg.description}
                </p>
              </CardHeader>

              <CardContent className="text-center space-y-6 flex-1">
                {/* Pricing */}
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <span className="text-4xl font-bold">
                      {price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    per {selectedBillingCycle.toLowerCase().slice(0, -2)}
                  </p>

                  {selectedBillingCycle === "YEARLY" && savings > 0 && (
                    <Badge className="bg-green-100 text-green-800 mt-2">
                      Save ${savings.toFixed(2)} per year
                    </Badge>
                  )}
                </div>

                {/* Key Features */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>{pkg.dailyDownloadLimit} downloads per day</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>Billed {selectedBillingCycle.toLowerCase()}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="text-left">
                  <h4 className="font-semibold mb-3 text-center">
                    What&apos;s included:
                  </h4>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="space-y-2">
                <Button
                  className={`w-full ${
                    isCurrent
                      ? "bg-green-600 hover:bg-green-700"
                      : popular
                      ? "bg-purple-600 hover:bg-purple-700"
                      : ""
                  }`}
                  onClick={() => handlePlanAction(pkg)}
                  disabled={isCurrent}
                >
                  {getButtonText(pkg)}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {packages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Star className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No packages available
            </h3>
            <p className="text-gray-600">
              Check back later for subscription options.
            </p>
          </CardContent>
        </Card>
      )}

      {/* FAQ or Additional Info */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-6">Why Choose Our Platform?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">Premium Quality</h3>
            <p className="text-gray-600">
              Hand-picked, high-quality Unity assets from top creators
            </p>
          </div>
          <div className="text-center">
            <Zap className="w-12 h-12 mx-auto text-purple-600 mb-4" />
            <h3 className="font-semibold mb-2">Instant Access</h3>
            <p className="text-gray-600">
              Download assets immediately after subscription
            </p>
          </div>
          <div className="text-center">
            <Crown className="w-12 h-12 mx-auto text-gold-600 mb-4" />
            <h3 className="font-semibold mb-2">Exclusive Content</h3>
            <p className="text-gray-600">
              Access to exclusive assets not available elsewhere
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Change Modal */}
      {selectedNewPlan && currentSubscription?.subscription && (
        <SubscriptionChangeModal
          isOpen={changeModalOpen}
          onClose={() => {
            setChangeModalOpen(false);
            setSelectedNewPlan(null);
          }}
          onConfirm={handleConfirmChange}
          currentPlan={currentSubscription.subscription.plan}
          newPlan={selectedNewPlan}
          isUpgrade={selectedNewPlan.basePrice > currentSubscription.subscription.plan.basePrice}
          loading={changingSubscription}
        />
      )}
    </main>
  );
}
