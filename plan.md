# Kế hoạch Triển khai Kiến trúc SaaS Quản lý Hồ câu

Mục tiêu là thiết lập nền tảng kiến trúc sẵn sàng cho sản xuất (production-ready) cho hệ thống SaaS Quản lý Hồ câu cá.

## Các Công nghệ Sử dụng
*   **Framework:** Next.js 15 (App Router)
*   **Ngôn ngữ:** TypeScript
*   **Styling:** TailwindCSS + Shadcn/UI
*   **Quản lý trạng thái:** Zustand
*   **Backend/Auth:** Supabase
*   **Data Fetching:** Tanstack Query (React Query)
*   **Thông báo:** Sonner Toast
*   **Animation:** Framer Motion
*   **Icons:** Lucide Icons

## Cấu trúc Thư mục Đề xuất

Chúng ta sẽ xây dựng một cấu trúc mô-đun, dễ mở rộng:

### 1. Cấu hình Cơ bản (Root)
*   `package.json`: Chứa tất cả dependencies (Next.js 15, React 19, v.v.)
*   `tsconfig.json`: Cấu hình TypeScript với path aliases `@/*`.
*   `tailwind.config.ts` & `postcss.config.mjs`: Cấu hình giao diện và Dark Mode.

### 2. Thư mục `app/` (Next.js App Router)
*   `layout.tsx`: Layout gốc, tích hợp các Provider.
*   `providers.tsx`: Bao gồm ThemeProvider, QueryClientProvider, và Sonner Toaster.
*   `globals.css`: Chứa Tailwind directives và hệ màu của Shadcn (Dark mode ready).
*   `(dashboard)/`: Nhóm route cho phần quản trị.
*   `(auth)/`: Nhóm route cho đăng nhập/đăng ký.

### 3. Các Thư mục Chức năng (Core Directories)
*   `modules/`: Chứa các domain logic theo từng tính năng (ví dụ: `lakes`, `bookings`, `users`).
*   `components/`:
    *   `ui/`: Các component cơ bản từ Shadcn.
    *   `layouts/`: Sidebar, Topbar, MainLayout.
    *   `shared/`: Các component dùng chung giữa các module.
*   `services/`: Các hàm gọi API và giao tiếp với Supabase.
*   `stores/`: Các Zustand stores để quản lý state toàn cục.
*   `hooks/`: Các custom hooks dùng chung.
*   `types/`: Định nghĩa các interfaces và types TypeScript.
*   `utils/`: Các hàm tiện ích (ví dụ: `cn.ts` cho Tailwind, cấu hình Supabase client).

## Các bước Thực hiện

1.  **Khởi tạo tệp cấu hình:** Tạo `package.json`, `tsconfig.json`, và cấu hình Tailwind.
2.  **Thiết lập Tiện ích:** Tạo hàm `cn` và cấu hình Supabase Client/Server.
3.  **Xây dựng Hệ thống Provider:** Thiết lập Dark Mode và Tanstack Query.
4.  **Thiết lập Layout:** Tạo Sidebar (Mobile-first), Topbar và MainLayout sử dụng Framer Motion.
5.  **Tạo thư mục rỗng:** Đảm bảo tất cả các thư mục yêu cầu (`modules/`, `services/`, v.v.) đều hiện diện.

## Kế hoạch Kiểm tra
*   Kiểm tra tính đúng đắn của các import.
*   Đảm bảo Dark Mode hoạt động mượt mà.
*   Xác nhận Sidebar đáp ứng tốt trên thiết bị di động.

---
Bạn có đồng ý với kế hoạch này không? Nếu có, tôi sẽ bắt đầu tạo các tệp ngay lập tức.
