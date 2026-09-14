import { prisma } from "../config/prisma";
import { NotificationType } from "@prisma/client";

export const notificationsService = {
  createNotification: async (data: {
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    referenceId?: string;
  }) => {
    return prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        type: data.type,
        title: data.title,
        message: data.message,
        referenceId: data.referenceId
      }
    });
  }
};

