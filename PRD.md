1. 🎯 Tổng quan sản phẩm
1.1 Mục tiêu

Xây dựng một hệ thống web app giúp:

Quản lý hoạt động hồ câu cá chuyên nghiệp
Theo dõi khách, vé câu, doanh thu
Tối ưu vận hành (nhân viên, cá, sản phẩm)
Có thể bán cho nhiều chủ hồ khác nhau (SaaS)
1.2 Đối tượng sử dụng
Chủ hồ câu
Nhân viên vận hành
Admin hệ thống (bạn)
1.3 Kiến trúc hệ thống
🔹 Multi-tenant
Mỗi user (chủ hồ) → 1 hệ dữ liệu riêng
Không truy cập chéo
🔹 Super Admin
Tài khoản Google: Huant5300@gmail.com
Có quyền:
Xem toàn bộ dữ liệu
Quản lý user
Khóa / mở tài khoản
Xem doanh thu toàn hệ thống
1.4 Authentication
Đăng nhập bằng Google (OAuth via Google)
Không cần tạo tài khoản thủ công
2. 🧩 Cấu trúc hệ thống (Modules)
2.1 Header toàn hệ thống

Luôn hiển thị:

Tên hồ đang quản lý
Dropdown chọn hồ (nếu 1 user có nhiều hồ)
Nút:
Cài đặt hồ
Hồ sơ
Đăng xuất
2.2 Modules chính
Dashboard
Vé câu
Sản phẩm
Cá
Khách hàng
Nhân viên
Báo cáo
Cài đặt hồ
Billing (SaaS)
3. 🎣 MODULE CORE: QUẢN LÝ VÉ CÂU
3.1 Trang: TẠO VÉ CÂU
🎯 Mục tiêu

Tạo phiên câu ngay khi khách vào

🔹 Form nhập
Thông tin khách
Tên khách
SĐT
Thông tin ca câu
Chọn loại ca:
5 giờ
10 giờ
Giờ lẻ (custom)
Giá tiền (auto hoặc chỉnh tay)
🔥 THÊM SẢN PHẨM NGAY TẠI BƯỚC 1 (YÊU CẦU CỦA BẠN)
Chọn sản phẩm:
nước
mồi
đồ ăn
Số lượng
Giá

👉 Có thể thêm nhiều dòng sản phẩm

Thanh toán ban đầu
Nhập số tiền khách trả trước
🔘 Action Buttons
Bắt đầu phiên
Checkbox:
 In bill
 Không in
🔄 Sau khi bấm "Bắt đầu"

Hệ thống:

Lưu ticket
Ghi thời gian bắt đầu
Tạo session
In bill (nếu chọn)
Chuyển sang tab ĐANG CÂU
3.2 Trang: ĐANG CÂU
🎯 Mục tiêu

Quản lý phiên đang diễn ra realtime

🔹 Hiển thị mỗi vé
Tên khách
Thời gian bắt đầu
⏱ Countdown
🔔 Cảnh báo
Khi còn 15 phút
→ phát âm thanh + highlight đỏ
🔘 Actions trong phiên
1. Thêm sản phẩm
Popup:
chọn sản phẩm
số lượng
giá
2. Gia hạn giờ
nhập số giờ thêm
tự tính tiền
3. Thu cá
Loại cá
Kg
Giá/kg

👉 hệ thống tính:

tiền thu cá → trừ vào bill
4. Ghi chú
3.3 Trang: KẾT THÚC PHIÊN
🔘 Action: "Kết thúc"
🧮 Hệ thống tự tính

Tổng tiền giờ câu

tiền sản phẩm
tiền cá thu lại
tiền đã tạm thu
= số tiền cần thanh toán / thối lại
🔹 Output
In bill
Lưu lịch sử
4. 📦 MODULE SẢN PHẨM
Chức năng
Tạo sản phẩm
Giá bán
Danh mục
Tồn kho (optional)
5. 🐟 MODULE CÁ
Chức năng
Tạo loại cá
Giá thu lại / kg
Lịch sử nhập cá
6. 👥 MODULE KHÁCH HÀNG
Lưu trữ
Tên
SĐT
Lịch sử câu
Tổng chi tiêu
7. 👨‍💼 MODULE NHÂN VIÊN
Chức năng
Tạo tài khoản
Phân quyền:
Admin hồ
Nhân viên
Thu ngân
8. 📊 MODULE BÁO CÁO
Dashboard gồm:
Doanh thu ngày / tháng
Số lượt khách
Cá thu lại
Top sản phẩm
9. ⚙️ MODULE CÀI ĐẶT HỒ
Cấu hình riêng từng hồ
Giá ca câu
Loại ca
Giá cá
Quy định

👉 Hiển thị ngay trên header

10. 💳 MODULE BILLING (ĐỂ BẠN BÁN)
Chức năng
Gói tháng
Gói năm
Giới hạn user
Thanh toán
11. 🔐 PHÂN QUYỀN
Vai trò
Super Admin
(Huant5300@gmail.com
)
full quyền
Chủ hồ
toàn quyền trong hồ
Nhân viên
tạo vé
thao tác phiên
12. 🗄️ DATA MODEL (TÓM TẮT)
users
ponds
tickets
sessions
products
fishes
transactions
payments
13. 🔥 YÊU CẦU KỸ THUẬT
Realtime
countdown
multi-user
Offline mode (future)
cache local
In bill
máy in nhiệt
PDF
14. 🚀 ROADMAP
Phase 1 (MVP)
Vé câu
Đang câu
Kết thúc
Sản phẩm cơ bản
Phase 2
Báo cáo
Cá
CRM
Phase 3
SaaS
Thanh toán
Multi-tenant full
👉 Tổng kết

PRD này đã:

✔ Chuẩn SaaS (bán được)
✔ Có multi-tenant
✔ Có super admin
✔ Có thêm sản phẩm ngay từ bước đầu (theo yêu cầu bạn)
✔ Flow vận hành cực sát thực tế hồ câu