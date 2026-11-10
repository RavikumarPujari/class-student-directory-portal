import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notificationsService, Notification } from "@/services/notifications.service";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pollingInterval = useRef<NodeJS.Timeout>();

  const loadNotifications = async () => {
    try {
      const data = await notificationsService.getNotifications();
      setNotifications(data);
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Poll every 30 seconds
    pollingInterval.current = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await notificationsService.markAsRead(notification.id);
        setNotifications(notifications.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setOpen(false);

      if (notification.referenceId) {
        if (notification.type === "TEAM_INVITATION") {
          navigate("/student/invitations");
        } else if (
          notification.type === "INVITATION_ACCEPTED" || 
          notification.type === "INVITATION_DECLINED" || 
          notification.type === "TEAM_MEMBER_JOINED" || 
          notification.type === "TEAM_MESSAGE"
        ) {
          navigate(`/student/teams/${notification.referenceId}`);
        }
      }
    } catch (err) {
      console.error("Failed to handle notification click", err);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive flex items-center justify-center">
              {unreadCount > 9 && <span className="absolute -top-1 -right-1 text-[8px] text-white"></span>}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 mt-2 bg-card border-border z-[100] shadow-lg shadow-black/50 overflow-hidden" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground" onClick={handleMarkAllRead}>
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm font-medium leading-none ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 mt-1 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

