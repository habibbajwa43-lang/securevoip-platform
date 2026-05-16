'use client';
import { BarChart2, TrendingUp, Phone, MessageSquare } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      <div className="bg-card rounded-2xl border p-12 text-center shadow-sm">
        <BarChart2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">Analytics dashboard coming soon</p>
        <p className="text-sm text-muted-foreground mt-1">Connect Twilio to see real call & SMS data</p>
      </div>
    </div>
  );
}
