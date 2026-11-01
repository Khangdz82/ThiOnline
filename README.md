# ThiOnline - Nền tảng Thi & Đánh giá Trực tuyến

Hệ thống thi, kiểm tra và đánh giá học sinh trực tuyến toàn diện: bóc tách đề Word/Excel/KaTeX thông minh, phòng thi chống gian lận, chấm tự luận trực tiếp trên ảnh bài làm, quản lý lớp học và xuất báo cáo Excel chuẩn Bộ GD&ĐT.

---

## ⚡ Hướng dẫn Cài đặt & Khởi chạy (1 Lệnh)

Ai lấy mã nguồn về chỉ cần chạy các lệnh sau là hoàn tất:

```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi tạo Database SQLite và nạp dữ liệu mẫu
npm run setup

# 3. Khởi chạy máy chủ phát triển
npm run dev
# Hoặc chạy bản production tối ưu Turbopack:
npm run build && npm run start
```

Mở trình duyệt truy cập: `http://localhost:3000`

---

## 🔑 Thông tin Tài khoản Đăng nhập Sẵn có

| Vai trò | Tài khoản | Mật khẩu | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Giáo viên** | `giaovien` (hoặc email `nam.nguyen@edu.vn`) | `password123` | Có sẵn 500 Point OCR & AI, đầy đủ lớp và đề mẫu |
| **Học sinh** | *Không cần tạo tài khoản* | *Không cần mật khẩu* | Nhập mã đề thi (ví dụ: `exam-demo-toan-12`) hoặc chọn tên từ danh sách lớp để thi ngay |

---

## 🌟 6 Phương thức Tạo Đề thi Đa Nguồn

Giáo viên có thể tạo đề thi theo 6 cách linh hoạt tùy theo nguồn tài liệu đang có:

1. **Tải lên file Word (.docx) hoặc Excel (.xlsx, .csv)**:
   - Tự động nhận diện câu hỏi, các phương án A/B/C/D, bảng đáp án, công thức Toán học KaTeX và hướng dẫn giải.
2. **Số hóa đề từ Ảnh / PDF bằng OCR (Cơ chế Point)**:
   - Tải ảnh chụp bài thi hoặc tài liệu scan.
   - Tự động bóc tách chữ, nhận dạng công thức và trừ 10 Point/trang minh bạch (có nút nạp Point demo trải nghiệm).
3. **Tạo đề từ Ngân hàng câu hỏi cá nhân**:
   - Duyệt và lọc kho câu hỏi cá nhân theo môn học, khối lớp, 4 mức độ nhận thức.
   - Tích chọn câu hỏi và nạp trực tiếp vào đề thi.
4. **Tạo đề từ Kho đề chung ThiOnline**:
   - Kho tài nguyên đề thi chuẩn cấu trúc Bộ GD&ĐT (Đề thi thử THPT Quốc Gia, Đề 1 tiết, Đề học kỳ các môn Toán, Lý, Hóa, Tiếng Anh...).
   - Xem trước đề và bấm "Sử dụng đề này" để sao chép vào phòng thi của mình.
5. **Tạo đề theo Ma trận chuẩn Bộ GD&ĐT**:
   - Cấu hình số câu theo 4 mức độ: **Nhận biết (40%)**, **Thông hiểu (30%)**, **Vận dụng (20%)**, **Vận dụng cao (10%)**.
   - Tự động bốc câu hỏi khớp ma trận và quy chuẩn thang điểm 10.0 chính xác.
6. **Sử dụng Trợ lý AI hỗ trợ sinh câu hỏi**:
   - Nhập môn học, khối lớp và chủ đề mong muốn (ví dụ: *"Cực trị hàm số"*, *"Dao động tắt dần"*, *"Câu điều kiện loại 3"*).
   - AI tự động sinh câu hỏi kèm công thức Toán học KaTeX, đáp án đúng và lời giải chi tiết.

---

## 🛡️ Cấu hình Phòng thi & Chống Gian Lận Chuyên Sâu

- **Thời gian làm bài**: Tùy chỉnh số phút (1 - 300 phút) hoặc không giới hạn.
- **Hẹn giờ mở đề & đóng đề**: Lên lịch thời gian bắt đầu và kết thúc nhận bài.
- **Số lượt làm bài**: 1 lượt (chuẩn thi chính thức), 2 lượt, 3 lượt, hoặc không giới hạn.
- **Đối tượng tham gia**:
  - *Tự do*: Bất kỳ ai có link bài thi.
  - *Chỉ định lớp*: Chỉ học sinh trong các lớp được phân công mới được vào thi.
- **Chống gian lận**:
  - *Nghiêm ngặt*: Toàn màn hình, khóa chuột phải, chặn copy/paste/F12, phát hiện chuyển tab hoặc rời cửa sổ, tự động thu bài khi vi phạm quá 3 lần.
- **Đảo đề**: Đảo ngẫu nhiên thứ tự câu hỏi và thứ tự phương án đáp án.
- **Hiển thị kết quả**: Cấu hình cho phép hoặc khóa xem điểm, xem đáp án sau khi nộp bài.

---

## 📊 Chấm thi, Thống kê & Xuất Excel

- **Chấm tự động**: Tự động chấm câu hỏi trắc nghiệm 4 lựa chọn, đúng/sai GDPT 2018, trả lời ngắn.
- **Chấm tự luận trên ảnh**: Giáo viên dùng bút đỏ, tick đúng (✔), gạch sai (✘) vẽ trực tiếp lên ảnh chụp bài làm của học sinh.
- **Báo cáo & Xuất Excel**: Phổ điểm trực quan, xuất file Excel bảng điểm chi tiết (SBD, Họ tên, Lớp, Điểm số, Thời gian làm bài, Số lần vi phạm).
