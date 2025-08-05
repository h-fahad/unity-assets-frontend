import { Button } from "@/components/ui/button";

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    price: number;
    dailyDownloadLimit: number;
    features: string[];
  };
  onSubscribe?: (planId: string) => void;
}

export default function PlanCard({ plan, onSubscribe }: PlanCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border p-6 flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
      <div className="text-3xl font-extrabold mb-2">{plan.price === 0 ? 'Free' : `$${plan.price}/mo`}</div>
      <div className="text-sm text-gray-600 mb-2">Daily Download Limit: <span className="font-semibold">{plan.dailyDownloadLimit}</span></div>
      <ul className="text-sm text-gray-700 mb-4 list-disc list-inside w-full">
        {plan.features.map(f => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <Button className="w-full" onClick={() => onSubscribe?.(plan.id)}>
        Subscribe
      </Button>
    </div>
  );
} 