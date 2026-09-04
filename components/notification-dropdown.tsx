"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, GitBranch, AlertCircle, Info, CreditCard, Users, ExternalLink, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/actions/notifications";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
};

const iconMap: Record<string, React.ReactNode> = {
  system: <Info className="h-4 w-4 text-[var(--brand)]" />,
  flow: <GitBranch className="h-4 w-4 text-[var(--lilac)]" />,
  billing: <CreditCard className="h-4 w-4 text-[var(--coral)]" />,
  contact: <Users className="h-4 w-4 text-[var(--success)]" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
};

const colorMap: Record<string, string> = {
  system: "bg-[var(--brand-soft)]",
  flow: "bg-[var(--lilac)]/20",
  billing: "bg-[var(--coral)]/10",
  contact: "bg-[var(--success-soft)]",
  error: "bg-red-500/10",
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifs = async () => {
      const data = await getNotifications();
      // @ts-ignore
      setNotifications(data || []);
    };
    fetchNotifs();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
    }
    
    setOpen(false);
    if (notification.link_url) {
      router.push(notification.link_url);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="p-2 text-[var(--ink-2)] hover:text-[var(--ink)] relative transition-colors rounded-full hover:bg-[var(--surface-2)]">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--coral)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--coral)] border-2 border-[var(--paper)]"></span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 md:w-96 p-0" align="end" forceMount>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <DropdownMenuLabel className="p-0 font-semibold text-sm">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs font-medium text-[var(--brand)] hover:text-[var(--brand-hover)] transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--ink-3)] flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center">
                <Bell className="h-5 w-5 text-[var(--ink-3)]" />
              </div>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <DropdownMenuGroup className="p-0">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-[var(--surface-2)] transition-colors border-b border-[var(--border)] last:border-0 relative ${!notification.is_read ? 'bg-[var(--brand-soft)]/30' : ''}`}
                >
                  {!notification.is_read && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
                  )}
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorMap[notification.type] || colorMap.system}`}>
                    {iconMap[notification.type] || iconMap.system}
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <p className={`text-sm font-medium leading-none ${!notification.is_read ? 'text-[var(--ink)]' : 'text-[var(--ink-2)]'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-[var(--ink-2)] leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] font-medium text-[var(--ink-3)] pt-1 uppercase tracking-wider">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {notification.link_url && (
                     <div className="shrink-0 pt-1">
                        <ExternalLink className="h-3 w-3 text-[var(--ink-3)]" />
                     </div>
                  )}
                </div>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
