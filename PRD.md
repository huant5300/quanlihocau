# TECHNICAL SPECIFICATION & PRD: QUẢN LÝ HỒ CÂU CÁ SAAS

## 1. 🎯 Tổng quan sản phẩm

### 1.1 Mục tiêu

Xây dựng một hệ thống web app (SaaS) giúp:

- Quản lý hoạt động hồ câu cá chuyên nghiệp.
- Theo dõi khách hàng, vé câu, doanh thu.
- Tối ưu vận hành (nhân sự, kho cá, sản phẩm dịch vụ).
- Có khả năng triển khai Multi-tenant, cho phép bán dưới dạng dịch vụ (SaaS) cho nhiều chủ hồ khác nhau.

### 1.2 Đối tượng sử dụng

- **Chủ hồ (OWNER):** Quản lý toàn diện hồ câu của mình.
- **Nhân viên (STAFF & CASHIER):** Vận hành hàng ngày tại hồ.
- **Super Admin:** Quản trị viên hệ thống (sở hữu SaaS), quản lý thuê bao các chủ hồ.

### 1.3 Kiến trúc hệ thống & Công nghệ

🔹 **Stack Công nghệ chính:**

- **Framework:** Next.js 15/16 (App Router)
- **Database:** PostgreSQL (Managed Database)
- **ORM:** Prisma Client
- **Styling:** TailwindCSS + Shadcn/UI (Hỗ trợ Dark/Light mode)
- **State Management:** Zustand (Client state) & Tanstack Query (Server state)
- **Offline Cache:** Dexie.js (IndexedDB) để lưu trữ phiên và dữ liệu offline khi rớt mạng.

### 1.4 Authentication (Xác thực)

Hệ thống sử dụng NextAuth.js với 2 phương thức đăng nhập:

1. **Đăng nhập Google (OAuth Google):** Tự động liên kết tài khoản.
2. **Đăng nhập thông thường (Credentials):** Đăng nhập bằng Email/SĐT và Mật khẩu (được mã hóa mật khẩu bằng bcrypt).

---

## 2. 🔐 BẢO MẬT & BẢO VỆ DỮ LIỆU ĐA HỘ (Multi-Tenant Security Architecture)

### 2.1 Cách ly dữ liệu (Data Isolation)

Mỗi chủ hồ (OWNER) khi đăng ký sẽ sở hữu một `FishingLake` độc lập. Dữ liệu của các hồ được phân tách rõ ràng bằng `lakeId`.

- **Quy định bắt buộc:** Mọi truy vấn database (Prisma) và Server Action / API Route đều **phải** đi qua tệp kiểm tra Context Middleware. Hệ thống sẽ tự động append điều kiện `where: { lakeId: currentSession.lakeId }` để đảm bảo tuyệt đối không có việc truy cập chéo dữ liệu giữa các chủ hồ.

### 2.2 Cơ chế Soft Delete (Xóa mềm)

- **Bắt buộc:** Tất cả các bảng dữ liệu lõi (Vé câu, Khách hàng, Sản phẩm, Hóa đơn) không được phép xóa cứng (`DELETE`).
- Phải sử dụng trường `deletedAt` (Soft Delete) để tránh mất dữ liệu nghiêm trọng và hỗ trợ khôi phục khi cần thiết.
- Mọi truy vấn đọc (GET) phải luôn kèm điều kiện `deletedAt: null`.

### 2.3 Phân quyền RBAC (Role-Based Access Control)

Hệ thống chia làm 4 cấp độ quyền hạn chặt chẽ:

- **SUPER_ADMIN (`huant5300@gmail.com`):** Toàn quyền hệ thống SaaS. Có quyền khóa/mở tài khoản chủ hồ, quản lý gói cước, xem thống kê doanh thu toàn hệ thống.
- **OWNER (Chủ hồ):** Toàn quyền đối với hồ câu của mình. Được phép cấu hình hồ, xem toàn bộ báo cáo, quản lý nhân viên, sửa giá vé, sửa sản phẩm.
- **CASHIER (Thu ngân):** Được phép tạo vé câu, tính tiền, thu cá, in hóa đơn, chốt ca. **Không** được phép sửa giá vé niêm yết, **không** được xem báo cáo tổng doanh thu của chủ hồ.
- **STAFF (Nhân viên):** Chỉ có quyền tạo vé, thao tác phiên câu, thêm dịch vụ. **Không** được phép tính tiền, **không** được xem báo cáo.

---

## 3. 💳 QUẢN LÝ VÒNG ĐỜI GÓI CƯỚC SAAS (Subscription Lifecycle)

### 3.1 Trạng thái vòng đời của Hồ câu

Mỗi hồ câu (Tenant) sẽ có các trạng thái (Status) như sau:

- `ACTIVE`: Gói cước đang có hiệu lực, sử dụng full tính năng.
- `GRACE_PERIOD`: Hết hạn nhưng cho phép nợ/dùng thử thêm 3 ngày. Chức năng hoạt động bình thường nhưng hiện banner cảnh báo đỏ.
- `SUSPENDED`: Đã qua thời gian Grace Period hoặc bị Super Admin khóa.
- `EXPIRED`: Hết hạn hoàn toàn.

### 3.2 Xử lý Edge Cases khi Gói hết hạn

- **Chuyển đổi giao diện `READ_ONLY`:** Khi hồ câu rơi vào trạng thái `EXPIRED` hoặc `SUSPENDED`, toàn bộ giao diện chuyển sang chế độ Chỉ xem.
- **Khóa thao tác ghi:** Người dùng VẪN CÓ THỂ xem lại lịch sử, báo cáo cũ nhưng **KHÔNG ĐƯỢC BẤM** "Bắt đầu phiên câu", "Tạo hóa đơn" hoặc "Thêm nhân viên". Mọi Server Action cập nhật sẽ trả về lỗi `SUBSCRIPTION_EXPIRED`.
- **Nâng cấp gói (Pro-rata Upgrade):** Khi chủ hồ nâng cấp từ gói Basic lên Premium khi vẫn còn hạn, hệ thống tự động quy đổi số ngày còn lại của gói Basic thành số ngày tương đương của gói Premium dựa trên chênh lệch giá, cộng dồn vào thời hạn mới.

### 3.3 Webhook & Automation

- **CronJob nhắc nhở:** Hệ thống chạy CronJob tự động kiểm tra mỗi ngày vào lúc 08:00 AM.
- Tự động gửi thông báo báo sắp hết hạn trước **7 ngày, 3 ngày và 1 ngày** qua hệ thống In-app Notification, Email (và Zalo ZNS nếu có).

---

## 4. 🌐 ĐỒNG BỘ DỮ LIỆU OFFLINE & GIẢI QUYẾT XUNG ĐỘT (Offline-First)

### 4.1 Chiến lược đồng bộ Dexie.js (IndexedDB) & PostgreSQL

Do đặc thù hồ câu có thể mất sóng 4G/Wifi, ứng dụng phải hoạt động trơn tru ở chế độ Offline.

- Khi mất mạng, thao tác "Bắt đầu phiên", "Thêm sản phẩm" được ghi thẳng vào Dexie.js (trạng thái `syncStatus = 'PENDING'`).
- Khi có lại mạng (Network Reconnected sự kiện `online`), hệ thống sẽ chạy Background Sync Worker lấy toàn bộ queue đẩy lên PostgreSQL.

### 4.2 Nguyên tắc giải quyết xung đột (Conflict Resolution)

- Áp dụng nguyên tắc **"Last-Write-Wins"** dựa trên `updatedAt` (Timestamp UTC).
- **Nhật ký Queue Sync:** Mỗi transaction lưu offline sẽ đính kèm `uuid` duy nhất (`clientMutationId`) và timestamp. Backend khi nhận được sẽ kiểm tra, nếu dữ liệu PostgreSQL có timestamp mới hơn dữ liệu đẩy lên từ client của thiết bị khác (trường hợp 2 nhân viên sửa cùng 1 vé), hệ thống giữ lại bản ghi mới nhất, tránh ghi đè làm mất đơn câu.

---

## 5. 🗄️ CẤU TRÚC PRISMA SCHEMA MẪU (Database Schema Spec)

Đoạn mã Prisma mẫu đảm bảo chuẩn hóa cho Multi-tenant và Soft Delete:

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ------------------------------------------------------
// ENUMS
// ------------------------------------------------------
enum Role {
  SUPER_ADMIN
  OWNER
  CASHIER
  STAFF
}

enum SubscriptionStatus {
  ACTIVE
  GRACE_PERIOD
  EXPIRED
  SUSPENDED
}

enum SessionStatus {
  FISHING
  COMPLETED
  CANCELLED
}

// ------------------------------------------------------
// MODELS
// ------------------------------------------------------

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  phone         String?   @unique
  passwordHash  String?
  role          Role      @default(STAFF)
  
  // Quan hệ Multi-tenant
  lakeId        String?
  lake          FishingLake? @relation(fields: [lakeId], references: [id])
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? 

  @@index([lakeId])
}

model FishingLake {
  id                 String             @id @default(uuid())
  name               String
  phone              String             @unique // 1 Hồ = 1 SĐT Duy nhất
  address            String
  subStatus          SubscriptionStatus @default(ACTIVE)
  expiresAt          DateTime?
  
  users              User[]
  sessions           FishingSession[]
  invoices           Invoice[]
  
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
  deletedAt          DateTime?
}

model FishingSession {
  id            String        @id @default(uuid())
  lakeId        String
  lake          FishingLake   @relation(fields: [lakeId], references: [id])
  
  customerName  String
  customerPhone String?
  status        SessionStatus @default(FISHING)
  
  startTime     DateTime      @default(now())
  endTime       DateTime?
  durationHours Float
  price         Float
  
  invoice       Invoice?
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  deletedAt     DateTime?

  @@index([lakeId])
}

model Invoice {
  id            String         @id @default(uuid())
  lakeId        String
  lake          FishingLake    @relation(fields: [lakeId], references: [id])
  
  sessionId     String         @unique
  session       FishingSession @relation(fields: [sessionId], references: [id])
  
  totalAmount   Float
  paidAmount    Float
  paymentMethod String         // CASH, BANK_TRANSFER
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  deletedAt     DateTime?

  @@index([lakeId])
}
```

---

## 6. 🎨 TRẢI NGHIỆM NGƯỜI DÙNG & ONBOARDING (UX Flow & Error Handling)

### 6.1 Onboarding Wizard Flow (Chủ hồ lần đầu đăng nhập)

Cơ chế Onboarding Gatekeeper bắt buộc:

1. **Bước 1: Chào mừng:** Màn hình Welcome và giới thiệu ngắn.
2. **Bước 2: Thiết lập Hồ Câu:** Bắt buộc nhập `Tên hồ câu (*)`, `Số điện thoại liên hệ (*)` (Kiểm tra format chuẩn VN), `Địa chỉ (*)`. Nếu không điền, nút Next bị disable.
3. **Bước 3: Thiết lập Bảng giá & Khu vực:** Hướng dẫn tạo ca câu (vd 5 tiếng) và chòi câu. (Có thể bỏ qua nhưng cảnh báo).
4. **Bước 4: Hoàn tất:** Hệ thống tạo dữ liệu mặc định, mở khóa Dashboard và vinh danh hoàn tất.

### 6.2 Error Handling & Mã Lỗi Chuẩn

Các mã lỗi phải được chuẩn hóa từ Backend và hiển thị Toast Notification bằng tiếng Việt cực kỳ thân thiện cho người dùng:

- `ERR_MISSING_LAKE_CONTEXT`: "Lỗi hệ thống: Không xác định được hồ câu hiện tại. Vui lòng đăng nhập lại."
- `ERR_PHONE_EXISTS`: "Số điện thoại này đã được đăng ký cho một hồ câu khác. Vui lòng sử dụng số điện thoại khác."
- `ERR_SUBSCRIPTION_EXPIRED`: "Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng tính năng này."
- `ERR_PERMISSION_DENIED`: "Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ Chủ hồ."
- `ERR_OFFLINE_SYNC_FAILED`: "Mạng không ổn định, dữ liệu đã được lưu tạm trên máy và sẽ tự động đồng bộ khi có mạng lại."

---

## 7. 🎣 MODULE CORE: QUẢN LÝ VÉ CÂU

### 7.1 Trang: TẠO VÉ CÂU

🎯 Mục tiêu: Tạo phiên câu ngay khi khách vào.

- **Hỗ trợ thêm sản phẩm ngay tại bước 1:** Tối giản quy trình, gọi nước/mồi ngay lúc check-in.
- Tự động tính toán tổng tiền tạm ứng.

### 7.2 Trang: ĐANG CÂU

🎯 Mục tiêu: Quản lý phiên đang diễn ra realtime.

- **Realtime Countdown & Cảnh báo SOS:** Nhấp nháy đỏ, phát âm thanh qua Web Audio API khi ca câu còn dưới 15 phút.
- Hỗ trợ thêm sản phẩm, gia hạn giờ, thu mua cá trực tiếp vào hóa đơn.

### 7.3 Trang: KẾT THÚC PHIÊN

- Tự động tất toán, in bill nhiệt (Bluetooth ESC/POS).
- Tích hợp quét mã chuyển khoản VietQR tĩnh/động tự động khớp tiền.

---

## 8. 🔥 ƯU ĐIỂM VƯỢT TRỘI CỦA SẢN PHẨM

1. **Quy trình Khép Kín Chuẩn Nghiệp Vụ Hồ Câu.**
2. **Cài Đặt Dễ Dàng (PWA 1 Chạm):** Thêm icon ra màn hình chính, không cần App Store.
3. **Cơ Chế Tự Động Thanh Toán Hết Giờ.**
4. **Hệ Thống Cảnh Báo SOS Nhấp Nháy Hào Quang.**
5. **In Ấn Hóa Đơn Bluetooth 58mm (PT-210)** mà không cần cài driver.
6. **Multi-Tenant Bảo Mật & Độc Lập Tuyệt Đối.**
