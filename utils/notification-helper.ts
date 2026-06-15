/**
 * Tiện ích hỗ trợ quản lý và hiển thị thông báo PWA (Local/Push Notifications)
 */

/**
 * Yêu cầu cấp quyền hiển thị thông báo từ người dùng
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Trình duyệt không hỗ trợ thông báo hệ thống.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Lỗi khi yêu cầu quyền thông báo:", error);
      return false;
    }
  }

  return false;
}

interface ShowNotificationOptions {
  body?: string;
  url?: string;
  tag?: string;
}

/**
 * Hiển thị thông báo trên màn hình thiết bị thông qua Service Worker
 */
export function showNativeNotification(title: string, options: ShowNotificationOptions = {}) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const notificationOptions: any = {
    body: options.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [200, 100, 200],
    tag: options.tag || `fishing-notification-${Date.now()}`,
    renotify: true,
    data: {
      url: options.url || "/dashboard/sessions",
    },
  };

  // Sử dụng Service Worker để hiển thị thông báo (bắt buộc đối với PWA trên thiết bị di động)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.showNotification(title, notificationOptions);
      })
      .catch((err) => {
        console.warn("Service Worker chưa sẵn sàng, dùng Notification dự phòng:", err);
        new Notification(title, notificationOptions);
      });
  } else {
    new Notification(title, notificationOptions);
  }
}
