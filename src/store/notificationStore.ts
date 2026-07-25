"use client";

import { create } from "zustand";
import { AppNotification, NotificationType } from "@/types";

interface NotificationState {
  notifications: AppNotification[];
  push: (type: NotificationType, title: string, message: string) => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  push: (type, title, message) => {
    const notification: AppNotification = {
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
    };
    set((s) => ({ notifications: [notification, ...s.notifications].slice(0, 20) }));
  },

  dismiss: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  clearAll: () => set({ notifications: [] }),
}));
