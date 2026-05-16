'use client';
import { Shield } from 'lucide-react';
export default function SecurityPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Security</h1>
      <div className="bg-card rounded-2xl border p-12 text-center shadow-sm">
        <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">Security settings available in Settings page</p>
      </div>
    </div>
  );
}
