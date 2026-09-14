import { api } from "./api";

export interface Notification {
  id: string;
  recipientId: string;
  type: "TEAM_INVITATION" | "INVITATION_ACCEPTED" | "INVITATION_DECLINED" | "TEAM_MEMBER_JOINED" | "TEAM_MESSAGE";
  title: string;
  message: string;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationsService = {
  getNotifications: async (limit: number = 50) => {
    const response = await api.get<{ success: boolean; data: Notification[] }>(`/notifications?limit=${limit}`);
    return response.data.data;
  },

  getUnreadCount: async () => {
    const response = await api.get<{ success: boolean; data: { unreadCount: number } }>("/notifications/unread-count");
    return response.data.data.unreadCount;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch<{ success: boolean; data: Notification }>(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch<{ success: boolean; message: string }>("/notifications/read-all");
    return response.data;
  }
};

