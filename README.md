# ThiOnline - Hệ thống Thi & Quản lý Đánh giá Trực tuyến

Hệ thống thi trắc nghiệm và tự luận trực tuyến xây dựng bằng Next.js và SQLite cục bộ. Hỗ trợ tạo đề từ file Word/Excel/Ngân hàng câu hỏi, phòng thi có cơ chế giám sát vi phạm, chấm tự luận trên ảnh và xuất kết quả Excel.

---

## ⚡ Cài đặt & Khởi chạy

Yêu cầu môi trường: **Node.js 18+** (đã kiểm tra chạy tốt trên Node.js 20, 22, 24).

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi tạo cơ sở dữ liệu SQLite (azota.db) và seed dữ liệu mẫu
npm run setup

# 3. Khởi chạy máy chủ phát triển
npm run dev

# Hoặc build và chạy bản production:
npm run build
npm run start
```

Truy cập hệ thống tại: `http://localhost:3000`

---

## 🔑 Tài khoản mẫu có sẵn trong hệ thống

Dữ liệu được nạp tự động qua lệnh `npm run setup`:

| Vai trò | Thông tin đăng nhập | Mật khẩu | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Giáo viên** | `giaovien` (hoặc `nam.nguyen@edu.vn`) | `password123` | Có sẵn 500 Point, danh sách lớp học và đề mẫu |
| **Học sinh** | *Không cần tạo tài khoản* | *Không cần mật khẩu* | Nhập mã đề thi (ví dụ: `exam-demo-toan-12`) hoặc chọn tên từ danh sách lớp để vào làm bài |

---

## 📋 Các chức năng hiện có trong dự án

### 1. Tạo đề thi
- **Nhập file Word (.docx)**: Sử dụng thư viện `mammoth` bóc tách văn bản, regex nhận diện định dạng câu hỏi (Câu 1, Câu 2...), các lựa chọn A/B/C/D, bảng đáp án và công thức Toán học KaTeX ($...$).
- **Nhập file Excel (.xlsx, .xls, .csv)**: Sử dụng thư viện `xlsx` đọc các cột: Nội dung câu hỏi, Lựa chọn A, B, C, D, Đáp án đúng, Lời giải chi tiết.
- **Ngân hàng câu hỏi cá nhân**: Lưu câu hỏi trong bảng `question_bank` SQLite, lọc theo môn học và mức độ để thêm vào đề.
- **Kho đề mẫu dùng chung**: Bảng `shared_exams` lưu các đề mẫu sẵn (Toán 12, Lý, Hóa, Tiếng Anh) để giáo viên sao chép sử dụng.
- **Tạo đề theo Ma trận Bộ GD&ĐT**: Nhập số câu theo 4 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao), hệ thống bốc ngẫu nhiên từ `question_bank` hoặc sinh câu hỏi mẫu và tự động chia điểm tổng về thang 10.0.
- **Trợ lý AI sinh câu hỏi**: Bộ sinh câu hỏi theo template nội bộ (`/api/exams/ai-generate`) theo môn học và chủ đề kèm công thức KaTeX; có sẵn cấu trúc API để cắm thêm API key mô hình ngoài (Gemini/OpenAI) khi cần.
- **Số hóa đề qua OCR**: Endpoint `/api/exams/ocr` hiện là luồng mô phỏng cơ chế trừ 10 Point/trang từ tài khoản giáo viên trong SQLite và trả về câu hỏi mẫu KaTeX (chưa tích hợp Vision API thực tế bên ngoài).

### 2. Phòng thi & Giám sát chống gian lận
- **Chặn thao tác**:
  - Chặn chuột phải (`contextmenu`), chặn bôi đen văn bản (`selectstart`).
  - Chặn sao chép, cắt, dán (`copy`, `cut`, `paste`).
  - Chặn phím tắt kiểm tra: F12, Ctrl+U, Ctrl+Shift+I/J/C, Ctrl+C/V/A/P/S/F, Alt+Tab.
  - Chặn in trang bài thi ra giấy hoặc file PDF (`@media print { body { display: none !important; } }`).
- **Phát hiện chuyển tab & mất tiêu điểm**:
  - Theo dõi sự kiện `visibilitychange` và `window.blur/focus`.
  - Khi thí sinh rời màn hình hoặc chuyển cửa sổ, kích hoạt **màn che bảo mật** (Privacy Overlay) che mờ toàn bộ bài thi để tránh nhìn lén từ ứng dụng/màn hình khác, đồng thời tính thời gian rời khỏi.
- **Phát hiện mở DevTools**: Định kỳ kiểm tra chênh lệch kích thước cửa sổ (`outerWidth - innerWidth > 160px`).
- **Chế độ Nghiêm ngặt (Strict)**:
  - Bắt buộc toàn màn hình (`Fullscreen`). Thoát toàn màn hình sẽ tính là vi phạm.
  - Cảnh báo khi chuột di chuyển ra khỏi ranh giới cửa sổ thi (`mouseleave`).
- **Xử lý vi phạm**: Ghi nhật ký vào bảng `violations` trong SQLite (loại sự kiện, thời gian rời, chi tiết). Quá 3 lần vi phạm, hệ thống tự động khóa và nộp bài.
- **Lưu nháp tự động**: Tự động lưu bài làm vào `localStorage` sau mỗi thao tác chọn đáp án, tự khôi phục khi mất mạng hoặc tải lại trang.

### 3. Làm bài, Chấm thi & Quản lý
- **Làm bài**: Hỗ trợ câu hỏi trắc nghiệm đơn, trắc nghiệm nhiều lựa chọn, đúng/sai 4 ý (chuẩn GDPT 2018), điền đáp án ngắn và tự luận nộp ảnh.
- **Chấm trắc nghiệm**: Hệ thống tự động đối chiếu đáp án và chấm điểm ngay khi nộp bài.
- **Chấm tự luận trên ảnh**:
  - Giao diện giáo viên hiển thị đề bài, đáp án mẫu, văn bản bài làm và ảnh chụp của học sinh.
  - Tích hợp Canvas vẽ trực tiếp lên ảnh học sinh: bút tick đúng (✔), gạch sai (✘), bút vẽ tự do màu đỏ, nhập điểm số và nhận xét chi tiết từng câu.
- **Quản lý lớp học**:
  - Tạo lớp học, xóa lớp học kèm danh sách học sinh.
  - Thêm học sinh thủ công hoặc import danh sách từ file Excel (.xlsx).
- **Thống kê & Báo cáo**: Hiển thị bảng điểm, phổ điểm bài thi và xuất kết quả ra file Excel.

---

## 🛠️ Công nghệ sử dụng trong dự án

- **Frontend & Backend**: Next.js 16 (App Router, Turbopack, TypeScript)
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Cơ sở dữ liệu**: SQLite qua thư viện `better-sqlite3` (chạy trực tiếp trong file `azota.db`, WAL mode)
- **Công thức Toán học**: KaTeX
- **Xử lý file**: SheetJS (`xlsx`) cho Excel, Mammoth cho Word (`.docx`)
