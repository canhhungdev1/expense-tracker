# Hướng dẫn chi tiết Triển khai SpendTrack lên Azure ☁️🚀

Tài liệu này hướng dẫn bạn từng bước đưa ứng dụng SpendTrack từ máy cá nhân lên môi trường đám mây Microsoft Azure.

## 📋 Chuẩn bị
Trước khi bắt đầu, hãy đảm bảo bạn đã:
1. Tài khoản Microsoft Azure (có thể dùng gói dùng thử miễn phí).
2. Mã nguồn đã được cập nhật phiên bản mới nhất (đã có cấu hình ENV).
3. Đã cài đặt **Azure CLI** (tùy chọn) hoặc làm trực tiếp trên **Azure Portal**.

---

## Bước 1: Thiết lập Cơ sở dữ liệu (Supabase)
Vì Azure có chính sách giới hạn Region rất chặt chẽ cho MySQL, chúng ta sẽ sử dụng Supabase (PostgreSQL chuyên dụng):
1. Truy cập [Supabase.com](https://supabase.com/) và tạo Project mới.
2. Tại tab **Settings > Database**, copy dòng **Connection String (URI)**.
3. Thay đổi mật khẩu của bạn vào tham số `[YOUR-PASSWORD]` trong chuỗi connection.

> [!TIP]
> Bạn chỉ cần tách chuỗi này ra thành: **HOST, PORT, USER, PASS, DATABASE** để chuẩn bị điền vào Backend ở Bước 2.

---

## Bước 2: Triển khai Backend (Azure App Service)

1. **Tạo App Service:**
   - Chọn **Linux** và **Node.js 20+** (hoặc phiên bản bạn đang dùng).
   - Trong phần **Configuration > Application Settings**, hãy thêm các biến sau:
     - `PORT`: `8080` (Azure thường dùng cổng này).
     - `DB_HOST`: Địa chỉ Server database đã tạo ở Bước 1.
     - `DB_PORT`: `5432`.
     - `DB_USER`: Tên đăng nhập database.
     - `DB_PASS`: Mật khẩu database.
     - `DB_NAME`: `expense_tracker`.
     - `JWT_SECRET`: Một chuỗi bí mật dài của bạn.
     - `FRONTEND_URL`: URL của Frontend (sẽ có ở Bước 3).

2. **Đẩy mã nguồn:**
   - Bạn có thể dùng **GitHub Actions** (Khuyên dùng) để tự động đẩy code mỗi khi bạn `git push`.
   - Hoặc nén thư mục `backend` (loại bỏ `node_modules`) và tải lên qua **Deployment Center**.

---

## Bước 3: Triển khai Frontend (Azure Static Web Apps)

1. **Chuẩn bị môi trường:**
   - Mở file `frontend/src/environments/environment.ts`.
   - Thay đổi `apiUrl`: `'https://your-backend-app.azurewebsites.net/api'` (URL của App Service ở Bước 2).

2. **Tạo Static Web App:**
   - Chọn nguồn từ GitHub của bạn.
   - **Build Presets:** Chọn **Angular**.
   - **App location:** `/frontend`.
   - **Output location:** `dist/expense-tracker/browser`.

3. **Cấu hình PWA:** Azure Static Web Apps hỗ trợ HTTPS mặc định, nên PWA sẽ tự động hoạt động hoàn hảo.

---

## Bước 4: Kiểm tra và Hoàn tất
1. Truy cập URL của Frontend.
2. Thử Đăng ký một tài khoản mới.
3. Kiểm tra xem các yêu cầu API có thành công không qua Tab **Network** trong Developer Tools.

---

## 🛠️ Xử lý lỗi thường gặp
- **Lỗi CORS:** Đảm bảo biến `FRONTEND_URL` trong Backend khớp chính xác với URL của trang web Frontend.
- **Dữ liệu danh mục:** Khi chạy lần đầu trên Azure, Backend sẽ tự động chạy script Seed để tạo các danh mục mặc định cho bạn.

Chúc bạn triển khai thành công! Nếu gặp khó khăn ở bước nào, hãy cho tôi biết nhé! 😊✨
