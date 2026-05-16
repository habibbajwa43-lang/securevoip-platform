'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Phone, MessageSquare, Hash, Wallet, Settings,
  LogOut, ChevronLeft, ChevronRight, Bell, User, Menu, X,
  Shield, HelpCircle, Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/calls', icon: Phone, label: 'Calls' },
  { href: '/messages', icon: MessageSquare, label: 'Messages', badge: 3 },
  { href: '/numbers', icon: Hash, label: 'Numbers' },
  { href: '/billing', icon: Wallet, label: 'Billing' },
  { href: '/analytics', icon: Activity, label: 'Analytics' },
];

const bottomItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/security', icon: Shield, label: 'Security' },
  { href: '/help', icon: HelpCircle, label: 'Help' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b shrink-0',
        collapsed ? 'justify-center' : 'gap-3',
      )}>
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Phone className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-sm tracking-tight">SecureVoIP</span>
            <p className="text-[10px] text-muted-foreground leading-none">Enterprise</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn('sidebar-item', isActive && 'active')}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="p-3 border-t space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="sidebar-item"
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {/* User Profile */}
        <div className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg mt-2',
          'bg-muted/50',
        )}>
          <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col h-screen bg-card border-r transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60',
      )}>
        <SidebarContent />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border shadow-sm
                     flex items-center justify-center hover:bg-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b z-40 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
            <Phone className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-sm">SecureVoIP</span>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute left-0 top-0 bottom-0 w-64 bg-card shadow-2xl"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 p-1.5 hover:bg-muted rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </motion.div>
        </div>
      )}
    </>
  );
}

