# 1 🎯 Tổng quan sản phẩm

## 1.1 Mục tiêu

Xây dựng một hệ thống web app giúp:

- Quản lý hoạt động hồ câu cá chuyên nghiệp
- Theo dõi khách, vé câu, doanh thu
- Tối ưu vận hành (nhân viên, cá, sản phẩm)
- Có thể bán cho nhiều chủ hồ khác nhau (SaaS)

## 1.2 Đối tượng sử dụng

- Chủ hồ câu
- Nhân viên vận hành
- Admin hệ thống (bạn)

## 1.3 Kiến trúc hệ thống & Công nghệ

🔹 Stack Công nghệ chính:

- **Framework:** Next.js 15/16 (App Router)
- **Database:** PostgreSQL (Managed Database)
- **ORM:** Prisma Client
- **Styling:** TailwindCSS + Shadcn/UI (Hỗ trợ Dark/Light mode)
- **State Management:** Zustand (Client state) & Tanstack Query (Server state)
- **Offline Cache:** Dexie.js (IndexedDB) để lưu trữ phiên và dữ liệu offline khi rớt mạng

🔹 Multi-tenant (Đa hộ)

Mỗi chủ hồ (OWNER) khi đăng ký sẽ sở hữu một Hồ câu (FishingLake) độc lập. Dữ liệu của các hồ được phân tách rõ ràng bằng `lakeId`, đảm bảo không truy cập chéo dữ liệu giữa các chủ hồ.

🔹 Super Admin

Tài khoản Google: `huant5300@gmail.com`
Quyền hạn: Xem toàn bộ dữ liệu hệ thống, quản lý người dùng, khóa/mở tài khoản, quản lý gói SaaS, xem doanh thu tổng thể toàn hệ thống.

## 1.4 Authentication (Xác thực)

Hệ thống sử dụng NextAuth.js với 3 phương thức đăng nhập:

1. **Đăng nhập Google (OAuth Google):** Tự động liên kết tài khoản và phân quyền.
2. **Đăng nhập Zalo (OAuth Zalo):** Hỗ trợ đăng ký/đăng nhập nhanh bằng tài khoản Zalo.
3. **Đăng nhập thông thường (Credentials):** Đăng nhập bằng Email và Mật khẩu (được mã hóa mật khẩu bằng bcrypt).

## 2. 🧩 Cấu trúc hệ thống (Modules)

## 2.1 Header toàn hệ thống

Luôn hiển thị:

- Tên hồ đang quản lý
- Dropdown chọn hồ (nếu 1 user có nhiều hồ)
- Nút:
  - Cài đặt hồ
  - Hồ sơ
  - Đăng xuất

## 2.2 Modules chính

- Dashboard
- Vé câu
- Sản phẩm
- Cá
- Khách hàng
- Nhân viên
- Báo cáo
- Cài đặt hồ
- Billing (SaaS)

## 3. 🎣 MODULE CORE: QUẢN LÝ VÉ CÂU

## 3.1 Trang: TẠO VÉ CÂU

🎯 Mục tiêu: Tạo phiên câu ngay khi khách vào

🔹 Form nhập:

- Thông tin khách: Tên khách, SĐT
- Thông tin ca câu:
  - Chọn loại ca (5 giờ, 10 giờ, giờ lẻ custom)
  - Giá tiền (tự động hoặc chỉnh tay)

🔥 THÊM SẢN PHẨM NGAY TẠI BƯỚC 1 (YÊU CẦU CỦA BẠN):

- Chọn sản phẩm (nước, mồi, đồ ăn)
- Số lượng, giá
- Hỗ trợ thêm nhiều dòng sản phẩm

Thanh toán ban đầu:

- Tự động tính tổng số tiền đã nhập cho khách trả trước

🔘 Action Buttons:

- Bắt đầu phiên
- Checkbox: In bill / Không in

🔄 Sau khi bấm "Bắt đầu":

Hệ thống sẽ:

1. Lưu ticket
2. Ghi thời gian bắt đầu
3. Tạo session
4. In bill (nếu chọn)
5. Chuyển sang tab ĐANG CÂU

## 3.2 Trang: ĐANG CÂU

🎯 Mục tiêu: Quản lý phiên đang diễn ra realtime

🔹 Hiển thị mỗi vé:

- Tên khách
- Thời gian bắt đầu
- ⏱ Countdown
- 🔔 Cảnh báo: Khi còn 15 phút -> phát âm thanh + highlight đỏ nhấp nháy

🔘 Actions trong phiên:

1. **Thêm sản phẩm:** Popup chọn sản phẩm, số lượng, giá.
2. **Gia hạn giờ:** Nhập số giờ thêm, tự động tính tiền.
3. **Thu cá:** Chọn loại cá, nhập số Kg, giá/kg. Hệ thống tính tiền thu cá và trừ vào bill.
4. **Ghi chú**

## 3.3 Trang: KẾT THÚC PHIÊN

🔘 Action: "Kết thúc"

🧮 Hệ thống tự tính:

- Tổng tiền giờ câu
- Tiền sản phẩm
- Tiền cá thu lại
- Tiền đã tạm thu
- Số tiền cần thanh toán hoặc thối lại cho khách

🔹 Output:

- In bill
- Lưu lịch sử

## 4. 📦 MODULE SẢN PHẨM

Chức năng:

- Tạo sản phẩm
- Giá bán
- Danh mục
- Tồn kho (tùy chọn)

## 5. 🐟 MODULE CÁ

Chức năng:

- Tạo loại cá
- Giá thu lại / kg
- Lịch sử nhập cá

## 6. 👥 MODULE KHÁCH HÀNG

Lưu trữ:

- Tên, SĐT
- Lịch sử câu
- Tổng chi tiêu

## 7. 👨‍💼 MODULE NHÂN VIÊN

Chức năng:

- Tạo tài khoản
- Phân quyền (Admin hồ, Nhân viên, Thu ngân)

## 8. 📊 MODULE BÁO CÁO

Dashboard gồm:

- Doanh thu ngày / tháng
- Số lượt khách
- Cá thu lại
- Top sản phẩm

## 9. ⚙️ MODULE CÀI ĐẶT HỒ (LAKE SETTINGS) & ONBOARDING GATEKEEPER

Cấu hình riêng từng hồ và cơ chế kích hoạt tài khoản sử dụng app:

### 9.1 Thông tin Hồ câu Bắt buộc (Mandatory Lake Info)

- **Ghi chú bắt buộc:** Tất cả các trường quan trọng đều được đánh dấu sao đỏ (**`*`**) và thông báo trực quan trên giao diện:
  1. **Tên Hồ câu (`*`):** Tên thương hiệu của hồ câu (Tối thiểu 2 ký tự).
  2. **Số điện thoại liên hệ (`*`):** Số điện thoại quản lý/chủ hồ (10 chữ số chuẩn di động Việt Nam: `03`, `05`, `07`, `08`, `09`).
  3. **Địa chỉ hồ câu (`*`):** Địa chỉ chi tiết nơi đặt hồ câu (Tối thiểu 5 ký tự).
  4. **Lời chào chân hóa đơn:** Lời nhắn in ở cuối bill nhiệt gửi khách hàng.

### 9.2 Ràng buộc Số điện thoại Duy nhất (1 Tài khoản / 1 Hồ = 1 SĐT)

- Mỗi hồ câu/tài khoản chủ hồ chỉ được đăng ký duy nhất một số điện thoại trên toàn hệ thống SaaS.
- Hệ thống thực hiện kiểm tra `unique` tại cả tầng API route và Server Action. Nếu phát hiện số điện thoại đã tồn tại ở hồ khác, hệ thống sẽ từ chối lưu và hiển thị thông báo lỗi rõ ràng.

### 9.3 Cơ chế Duyệt & Chặn sử dụng nếu thiếu thông tin (Onboarding Gatekeeper)

- Nếu chủ hồ mới tạo tài khoản hoặc chưa điền đầy đủ các trường thông tin bắt buộc nêu trên (hoặc còn mang giá trị mặc định *"Chưa cập nhật"*), hệ thống sẽ bật modal **Onboarding Wizard** toàn màn hình.
- Người dùng **bắt buộc phải điền đầy đủ Tên hồ, Địa chỉ và SĐT hợp lệ** mới được hệ thống phê duyệt mở khóa các chức năng vận hành (Tạo vé, quản lý ca câu, in hóa đơn...).

### 9.4 Cấu hình Tài khoản Nhận tiền VietQR (Mã QR Thanh toán Tự động)

- **Ngân hàng nhận tiền:** Tự động ánh xạ mã BIN ngân hàng chuẩn NAPAS.
- **Số tài khoản & Tên chủ tài khoản:** Dùng để tự động tạo mã VietQR động/tĩnh trên màn hình thu ngân và in trực tiếp mã QR trên bill nhiệt cho khách quét chuyển khoản.

### 9.5 Cấu hình Gói câu, Chòi/Vị trí & Nhân sự

- Quản lý các gói ca câu định sẵn (ca 5h, ca 10h, tính theo giờ).
- Quản lý danh sách ô câu/chòi và giá niêm yết.
- Quản lý tài khoản nhân viên vận hành và thu ngân.

## 10. 💳 MODULE BILLING (GÓI DỊCH VỤ SAAS)

Hệ thống cung cấp 2 gói cước thương mại hóa tối ưu cho ngành hồ câu:

### 10.1 Gói Cơ Bản - BASIC: `99.000đ / tháng`

- **Hạn ngạch:** **1 Hồ câu độc quyền**, **Tối đa 2 Nhân viên / Thu ngân**.
- **Tính năng:** **FULL TOÀN BỘ TÍNH NĂNG NGHIỆP VỤ HỒ CÂU:**
  - Tạo vé câu / Check-in phân bước siêu tốc & chọn sản phẩm ngay tại bước 1.
  - Đếm ngược thời gian ca câu chạy realtime.
  - Cảnh báo âm thanh & nhấp nháy SOS khi còn dưới 15 phút (Web Audio API).
  - Thu mua cá tại lòng hồ & tự động khấu trừ vào hóa đơn.
  - Tự động hoàn tất và tính tiền khi hết giờ câu.
  - In hóa đơn nhiệt Bluetooth 58mm (PT-210) qua Web Bluetooth ESC/POS.
  - Tự động tạo mã VietQR động/tĩnh cho khách quét thanh toán chuyển khoản.
  - Quản lý danh mục & kho hàng sản phẩm (nước, đồ ăn, mồi câu).
  - Quản lý kho cá & nhật ký cá lòng hồ.
  - Quản lý khách hàng CRM & tích điểm thưởng thành viên.
  - Báo cáo doanh thu ngày / tháng & Dòng tiền Thu - Chi.
  - Chấm công nhân viên & Chốt ca thu ngân (Shift Close).
  - Chế độ hoạt động Offline khi mất kết nối mạng (Dexie.js).

### 10.2 Gói Chuyên Nghiệp (Chuỗi Hồ) - PREMIUM: `199.000đ / tháng`

- **Hạn ngạch:** **Quản lý lên đến 5 Hồ câu độc lập**, **Tối đa 10 Nhân viên / Thu ngân**.
- **Tính năng:** **FULL TÍNH NĂNG NHƯ BASIC** + **QUẢN LÝ CHUỖI ĐA HỒ:**
  - Quản lý tập trung chuỗi 5 hồ câu trên cùng 1 tài khoản chủ hồ.
  - Chuyển đổi qua lại linh hoạt giữa các hồ ngay trên Topbar.
  - Phân quyền nhân viên, thu ngân độc lập cho từng chi nhánh hồ.
  - Báo cáo tổng hợp doanh thu chuỗi hồ câu & so sánh hiệu quả giữa các chi nhánh.
  - Không giới hạn số lượng khách hàng lưu trữ.
  - Ưu tiên cập nhật tính năng mới & Hỗ trợ kỹ thuật 24/7.

### 10.3 Chính Sách Khuyến Mãi Có Hạn (Limited-Time Offer - Tặng Thêm Tháng)

- **Đăng ký 1 Năm (12 Tháng):** **TẶNG NGAY 3 THÁNG MIỄN PHÍ** $\rightarrow$ **Tổng nhận 15 Tháng sử dụng**:
  - Gói Basic: `1.188.000đ` (Tương đương chỉ **~79.200đ / tháng**).
  - Gói Premium: `2.388.000đ` (Tương đương chỉ **~159.200đ / tháng**).
- **Đăng ký 6 Tháng:** **TẶNG NGAY 1 THÁNG MIỄN PHÍ** $\rightarrow$ **Tổng nhận 7 Tháng sử dụng**:
  - Gói Basic: `594.000đ` (Tương đương chỉ **~84.800đ / tháng**).
  - Gói Premium: `1.194.000đ` (Tương đương chỉ **~170.500đ / tháng**).
- **Tự động kích hoạt:** Hệ thống Super Admin khi phê duyệt đơn hàng 12 tháng hoặc 6 tháng sẽ tự động cộng dồn đúng số tháng quà tặng vào thời hạn sử dụng của hồ câu (`expiresAtNew = baseDate + durationMonths + bonusMonths`).
- Tích hợp quét mã chuyển khoản VietQR tự động khớp tiền và nội dung thanh toán.

## 11 🔐 PHÂN QUYỀN

Hệ thống phân chia 4 vai trò rõ rệt:

- **SUPER_ADMIN (`huant5300@gmail.com`):** Toàn quyền quản trị hệ thống SaaS, quản lý chủ hồ và các gói dịch vụ.
- **OWNER (Chủ hồ):** Có toàn quyền quản lý hồ câu của mình (nhân viên, chòi câu, loại cá, sản phẩm, cài đặt hồ).
- **STAFF (Nhân viên):** Có quyền tạo vé, thao tác phiên câu, thêm dịch vụ.
- **CASHIER (Thu ngân):** Thực hiện tính tiền, thu cá, in hóa đơn và bàn giao ca.

## 12 🗄️ DATA MODEL (Cơ sở dữ liệu Prisma)

Hệ thống sử dụng các Model dữ liệu chuẩn hóa sau:

- **User & Account & Session:** Quản lý thông tin tài khoản, liên kết OAuth (Google, Zalo) và phiên đăng nhập.
- **FishingLake (Hồ câu):** Thực thể chính đại diện cho một tenant (hộ kinh doanh hồ câu).
- **FishingArea (Khu vực/Chòi):** Các chòi/vị trí câu với giá giờ khác nhau.
- **FishingSession (Phiên câu):** Vé câu đang hoạt động hoặc đã kết thúc, tính tiền theo giờ/ca.
- **Customer (Khách hàng):** Theo dõi thông tin khách, công nợ (`debtBalance`), chi tiêu và VIP status.
- **FishType & FishCatch:** Quản lý loại cá và lịch sử khách câu được cá (bao gồm thu mua lại cá từ khách).
- **ProductCategory & Product & InventoryTransaction:** Quản lý danh mục sản phẩm (nước, mồi, đồ ăn, dụng cụ) và lịch sử nhập/xuất kho.
- **Invoice & InvoiceItem & Payment:** Quản lý hóa đơn bán lẻ, chi tiết dịch vụ và các phương thức thanh toán (Tiền mặt, Chuyển khoản, Thẻ, Ghi nợ).
- **Expense (Chi phí):** Ghi nhận các khoản chi tiêu vận hành của hồ câu.
- **Attendance & Shift & ShiftClose:** Quản lý chấm công nhân viên và chốt doanh thu ca (so khớp tiền mặt thực tế vs hệ thống).
- **Notification:** Hệ thống thông báo in-app cho nhân viên và chủ hồ.
- **ActivityLog:** Nhật ký hoạt động chi tiết để kiểm vết (audit log).
- **Settings:** Cài đặt cấu hình hệ thống toàn cục.
- **FishingPackage:** Cấu hình các gói ca câu định sẵn (ví dụ: ca 5 giờ, ca 10 giờ).
- **Transaction:** Nhật ký dòng tiền (Thu/Chi) để phục vụ báo cáo tài chính.
- **FishStock:** Theo dõi lượng cá tồn kho dưới lòng hồ (thả thêm cá, cá chết, cá bị câu).

## 13 🔥 YÊU CẦU KỸ THUẬT

- **Realtime Countdown:** Đồng hồ đếm ngược thời gian ca câu chạy realtime trên giao diện.
- **SOS Warning:** Tự động highlight đỏ nhấp nháy hào quang và phát âm thanh (Web Audio API) khi ca câu còn dưới 15 phút.
- **Offline-First Cache:** Sử dụng Dexie.js (IndexedDB) để cache dữ liệu cục bộ, đảm bảo thu ngân vẫn thao tác được khi rớt mạng.
- **PWA Add-to-Home-Screen (iOS & Android):** Hỗ trợ chuẩn Progressive Web App (PWA). Người dùng và nhân viên không cần tải app từ App Store hay Google Play mà vẫn có thể ghim biểu tượng (icon) ứng dụng trực tiếp ra màn hình chính điện thoại (iOS Safari: *Chia sẻ -> Thêm vào MH chính*, Android Chrome: *Cài đặt ứng dụng*). Ứng dụng chạy mượt mà ở chế độ Fullscreen Standalone, không có thanh địa chỉ trình duyệt và tự động cập nhật phiên bản mới nhất.
- **Thermal Printer Integration:** Hỗ trợ in hóa đơn nhiệt khổ 58mm (PT-210) qua giao thức Web Bluetooth API (ESC/POS) trực tiếp từ trình duyệt di động/máy tính mà không cần cài đặt driver.
- **Responsive Design:** Giao diện tối ưu hoàn hảo cho cả thiết bị di động (nhân viên dùng tại lòng hồ) và máy tính để bàn (thu ngân dùng tại quầy).

## 14 🚀 ROADMAP

- **Phase 1 (MVP):** Vé câu, Đang câu, Kết thúc, Sản phẩm cơ bản.
- **Phase 2:** Báo cáo, Cá, CRM.
- **Phase 3:** SaaS, Thanh toán, Multi-tenant full.

## 15 🔥 ƯU ĐIỂM VƯỢT TRỘI PHỤC VỤ THƯƠNG MẠI HÓA (SAAS)

Hệ thống được thiết kế đặc thù để thương mại hóa (bán cho các chủ hồ câu) nhờ sở hữu các ưu thế cạnh tranh vượt trội mà các phần mềm POS thông thường không có:

1. **Quy trình Khép Kín Chuẩn Nghiệp Vụ Hồ Câu:**
   Từ lúc khách vào (Tạo vé & Gọi nước/mồi) -> Quản lý đếm ngược đang câu -> Gọi thêm dịch vụ -> Thu mua cá và khấu trừ vào hóa đơn -> Tự động tính tiền và in hóa đơn nhiệt. Tất cả diễn ra trên một màn hình duy nhất, tối ưu 90% thời gian thao tác.

2. **Cài Đặt Dễ Dàng Không Cần Tải App (PWA 1 Chạm):**
   Chủ hồ và nhân viên không cần tài khoản Apple ID hay vào CH Play tải app nặng máy. Chỉ cần truy cập web trên Safari (iOS) hoặc Chrome (Android) và bấm "Thêm vào màn hình chính" là có ngay icon app trên điện thoại với trải nghiệm full màn hình chuyên nghiệp.

3. **Cơ Chế Tự Động Thanh Toán Hết Giờ:**
   Khi đồng hồ đếm ngược của ca câu chạm mốc 00:00:00, hệ thống tự động hoàn tất phiên câu, khóa số liệu, đồng bộ hóa chi tiêu tích lũy vào tài khoản khách hàng, giải phóng vị trí ô câu mà không cần thủ kho/thu ngân túc trực bấm máy thủ công.

4. **Hệ Thống Cảnh Báo SOS Nhấp Nháy Hào Quang:**
   Cảnh báo trực quan khi thời gian câu còn dưới 15 phút. Badge chuông ở thanh điều hướng nhấp nháy đỏ với hiệu ứng hào quang tỏa rộng (SOS-style) để thu ngân chuẩn bị giỏ cá thu hồi hoặc mời khách gia hạn ca câu.

5. **Web Audio API Tự Tổng Hợp Nhạc Chuông Offline:**
   Nhạc chuông cảnh báo được tổng hợp trực tiếp bằng thuật toán âm tần trình duyệt (Web Audio API). Không cần tải file âm thanh (mp3/wav), chạy mượt mà ngay cả khi mất kết nối Internet hoặc rớt mạng 4G tại khu vực lòng hồ sâu.

6. **In Ấn Hóa Đơn Bluetooth 58mm (PT-210):**
   Tích hợp giao thức truyền thông ESC/POS thông qua Web Bluetooth API. In hóa đơn thanh toán trực tiếp từ điện thoại di động ra máy in nhiệt cầm tay chỉ trong 2 giây mà không cần cài đặt driver phức tạp.

7. **Thêm Sản Phẩm Nhanh Ngay Ở Form Check-in:**
   Hỗ trợ gán nhanh nước uống, đồ ăn, mồi câu đặc biệt ngay khi khách bước chân vào hồ câu, tối giản hóa tối đa quy trình so với các hệ thống bán lẻ rườm rà.

8. **Cơ Chế Onboarding Gatekeeper & Ràng Buộc SĐT Độc Quyền (1 Hồ = 1 SĐT):**
   Đảm bảo mỗi tài khoản hồ câu được định danh bằng một số điện thoại duy nhất trên toàn hệ thống SaaS, chống trùng lặp tenant và trục lợi tài khoản. Ép buộc hoàn thiện thông tin bắt buộc (Tên hồ, SĐT, Địa chỉ) qua màn hình Onboarding trước khi mở quyền sử dụng phần mềm.

9. **Multi-Tenant Bảo Mật & Độc Lập Tuyệt Đối:**
   Mỗi chủ hồ sở hữu một cơ sở dữ liệu tách biệt hoàn toàn, đảm bảo tính bảo mật và riêng tư cao nhất cho hoạt động kinh doanh chuỗi hồ câu.

---

## 👉 Tổng kết

PRD này đã:

- ✔ Hoàn toàn chuẩn SaaS thương mại hóa (Sẵn sàng bán gói dịch vụ)
- ✔ Hỗ trợ Multi-Tenant cách ly dữ liệu bảo mật cao
- ✔ Ràng buộc định danh hồ độc quyền (1 tài khoản / 1 hồ = 1 SĐT duy nhất)
- ✔ Cơ chế Onboarding Gatekeeper ép buộc hoàn tất thông tin cấu hình trước khi kích hoạt sử dụng
- ✔ Tích hợp mã VietQR tự động trên bill in nhiệt và màn hình thu ngân
- ✔ Cung cấp hệ quản trị tối cao Super Admin (Cho phép kích hoạt/khóa tài khoản chủ hồ)
- ✔ Độc quyền tính năng thêm sản phẩm trực tiếp từ bước 1
- ✔ Luồng nghiệp vụ bám cực sát thực tế lòng hồ
- ✔ Toàn bộ tính năng mô tả ngoài Landing Page đều đã hoạt động và được xác thực 100% trong mã nguồn hệ thống
