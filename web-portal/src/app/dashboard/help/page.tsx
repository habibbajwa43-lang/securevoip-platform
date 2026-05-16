'use client';
import { HelpCircle } from 'lucide-react';
export default function HelpPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
      <div className="bg-card rounded-2xl border p-12 text-center shadow-sm">
        <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">Need help? Contact support@securevoip.com</p>
      </div>
    </div>
  );
}
