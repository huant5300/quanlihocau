# Hướng dẫn cấu hình Google OAuth cho Supabase

Tài liệu này mô tả các bước để cấu hình Google Sign-in cho dự án Supabase của bạn (bao gồm môi trường local và production). Nội dung bằng tiếng Việt, dành cho project hiện tại với Supabase project: `vfypdvyicyquyayeylpi`.

---
## Yêu cầu trước
- Có quyền quản trị trên Google Cloud Console (để xem/ chỉnh OAuth client).
- Có quyền quản trị trên Supabase Project (để dán Client ID / Secret và bật provider).
- Biến môi trường trong dự án đã thiết lập: `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Redirect URI quan trọng (đã kiểm tra cho project của bạn)
- Supabase callback (khuyến nghị khi Supabase làm trung gian):
  - `https://vfypdvyicyquyayeylpi.supabase.co/auth/v1/callback`
- Redirect dùng trong app (nếu bạn muốn Google redirect trực tiếp về app của bạn):
  - `http://localhost:3000/auth/callback` (chỉ dùng cho development)

> Gợi ý: Cách ít lỗi nhất là để Google redirect về callback của Supabase, Supabase tự exchange code và rồi redirect về `redirectTo` bạn truyền khi gọi `signInWithOAuth`. Nếu bạn muốn xử lý code trong app (`app/auth/callback/route.ts`) thì cần thêm `http://localhost:3000/auth/callback` vào Authorized Redirect URIs trong Google Cloud.

---
## 1) Thiết lập Google Cloud (OAuth client)
1. Mở link Google Cloud -> Credentials -> OAuth 2.0 Client IDs -> Chọn client tương ứng.
2. Trong phần **Authorized redirect URIs** thêm:
   - `https://vfypdvyicyquyayeylpi.supabase.co/auth/v1/callback`
   - (Tùy chọn, để test local) `http://localhost:3000/auth/callback`
3. Kiểm tra **OAuth consent screen**:
   - Điền tên ứng dụng, email hỗ trợ.
   - Nếu đang ở chế độ `Testing`, thêm tài khoản Google của bạn vào `Test users`.
   - Nếu muốn public, publish consent screen (cần review nếu dùng các scopes nhạy cảm).
4. Lưu và copy `Client ID` và `Client secret`.

---
## 2) Cấu hình Google Provider trong Supabase
1. Vào Supabase Dashboard → Project → Authentication → Providers → Google.
2. Dán `Client ID` và `Client secret` từ Google Cloud.
3. Bật provider và lưu.
4. (Tùy) Kiểm tra `Site URL` / `Redirect URLs` trong Supabase Settings để đảm bảo khớp với site của bạn.

---
## 3) Cấu hình trong dự án code (dự án hiện tại)
- Trong client code bạn đã gọi:
```ts
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${window.location.origin}/auth/callback` }
})
```
- Hai chiến lược:
  1. **Supabase trung gian (khuyến nghị)**
     - Google callback → `https://...supabase.co/auth/v1/callback`
     - Supabase exchange code và sau đó redirect về `redirectTo` (ví dụ `http://localhost:3000/auth/callback`)
     - Lợi: ít lỗi về `redirect_uri_mismatch`, Supabase quản lý tokens/refresh.
  2. **App trực tiếp**
     - Google callback → `http://localhost:3000/auth/callback`
     - Ứng dụng bạn phải exchange code (ví dụ `app/auth/callback/route.ts` hiện có sẵn code sử dụng `supabase.auth.exchangeCodeForSession(code)`).
     - Nếu chọn cách này, chắc chắn thêm `http://localhost:3000/auth/callback` vào Google Cloud.

---
## 4) Thử nghiệm
1. Chạy local:
```bash
npm run dev
```
2. Mở `http://localhost:3000` → click "Đăng nhập bằng Google".
3. Quan sát luồng redirect:
   - Nếu redirect về Supabase callback, Supabase sẽ hoàn tất và redirect về `redirectTo`.
   - Nếu redirect về `http://localhost:3000/auth/callback`, file `app/auth/callback/route.ts` sẽ gọi `exchangeCodeForSession`.
4. Kiểm tra logs:
   - Supabase Dashboard → Authentication → Logs
   - Google Cloud (nếu cần)
   - Browser devtools (tab Network) để xem `redirect_uri` và query params
   - Ứng dụng: trang `auth-error` sẽ nhận `error` và `error_description` (đã forward)

---
## 5) Các lỗi thường gặp & cách khắc phục
- `redirect_uri_mismatch`
  - Nguyên nhân: URI redirect không khớp với một trong các Authorized redirect URIs ở Google Cloud.
  - Khắc phục: Thêm đúng URI (phải trùng chính xác, bao gồm cả https/http và path).

- `invalid_client`
  - Nguyên nhân: Client ID / Secret sai hoặc chưa được bật provider ở Supabase.
  - Khắc phục: Dán lại Client ID/Secret vào Supabase → bật provider.

- Consent screen blocking (non-test user)
  - Nguyên nhân: OAuth consent screen ở trạng thái `Testing` và tài khoản dùng không phải Test user.
  - Khắc phục: Thêm tài khoản vào Test users hoặc publish consent screen.

- Cookie/session không lưu (Next.js server cookie issues)
  - Khắc phục: Sử dụng `createServerClient` (đã có trong `lib/supabase/server.ts`) để exchange và lưu cookie server-side. Kiểm tra domain / cookie settings nếu dùng production domain.

---
## 6) Biến môi trường mẫu (thêm vào `.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://vfypdvyicyquyayeylpi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
> Lưu ý: Không commit `anon-key` vào git. Dùng secret manager cho production.

---
## 7) Kiểm tra cuối cùng & hỗ trợ
- Sau khi cấu hình xong, thử đăng nhập. Nếu lỗi, copy URL redirect final (tab Network) và nội dung error để tôi hỗ trợ thêm.
- Nếu bạn muốn, tôi có thể:
  - Tạo file `docs/OAuth-setup.md` (đã tạo) — bạn có thể mở và chia sẻ.
  - Tạo snippet README ngắn hoặc PR với hướng dẫn dev env.

---
File này được lưu tại `docs/OAuth-setup.md` trong repo. Nếu cần, tôi có thể mở file hoặc cập nhật theo giá trị Client ID/Secret đã sẵn sàng (không commit secret vào repo).