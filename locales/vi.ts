export const vi = {
  sidebar: {
    dashboard: "Tổng quan",
    sessions: "Phiên câu",
    customers: "Khách hàng",
    products: "Sản phẩm",
    reports: "Báo cáo",
    settings: "Cài đặt",
    management: "Quản lý hồ câu",
    logout: "Đăng xuất",
  },
  mobileNav: {
    home: "Trang chủ",
    sessions: "Phiên câu",
    add: "Thêm",
    products: "Sản phẩm",
    customers: "Khách hàng",
  },
  realtime: {
    offline: "Ngoại tuyến",
    syncing: "Đang đồng bộ...",
    pendingSuffix: "chờ đồng bộ",
    synced: "Đã đồng bộ",
    internetConnected: "Internet Kết nối",
    internetDisconnected: "Mất kết nối Internet",
    realtimeStable: "Realtime Ổn định",
    reconnecting: "Đang kết nối lại...",
  },
  huts: {
    status: {
      available: "Trống",
      occupied: "Đang sử dụng",
      maintenance: "Bảo trì",
    },
  },
  payment: {
    methods: {
      cash: "Tiền mặt",
      bankTransfer: "Chuyển khoản",
      qrPayment: "Quét mã QR",
    },
  },
} as const;

export type ViLocale = typeof vi;
