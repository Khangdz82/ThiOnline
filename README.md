# ThiOnline - Nền Tảng Thi & Đánh Giá Trực Tuyến Mã Nguồn Mở (0% Quảng Cáo)

Hệ thống thi trắc nghiệm & tự luận online thế hệ mới, thay thế toàn diện các nền tảng cũ, loại bỏ 100% quảng cáo và giới hạn thu phí.

---

## Tính năng chính

- **0% Quảng cáo (Ad-free):** Giao diện tập trung tối đa cho học sinh làm bài và giáo viên chấm bài.
- **Bộ phân tích đề thi thông minh (Exam Parser):**
  - Tự động bóc tách file Word (`.docx`) hoặc văn bản thô.
  - Tách câu hỏi, các lựa chọn A/B/C/D, bảng đáp án, lời giải chi tiết.
  - Hỗ trợ công thức Toán/Lý/Hóa LaTeX hiển thị bằng KaTeX (`$..$`, `$$..$$`).
  - Hỗ trợ các định dạng: Trắc nghiệm 1 đáp án, Đúng/Sai (chuẩn GDPT 2018), Trả lời ngắn, Tự luận.
- **Phòng thi Focus & Chống gian lận (Anti-cheat):**
  - Chế độ toàn màn hình (Fullscreen enforcement).
  - Tự động bắt sự kiện chuyển tab, thu nhỏ hoặc mất tiêu điểm cửa sổ.
  - Ghi nhật ký vi phạm thời gian thực và báo cáo giáo viên.
  - Bộ đếm thời gian countdown đồng bộ, tự động nộp bài khi hết giờ.
  - Tự động lưu nháp (`localStorage`) sau từng click chọn đáp án.
- **Giao diện chấm tự luận trực quan (Canvas Grading):**
  - Học sinh chụp ảnh bài làm bằng điện thoại và upload trực tiếp.
  - Giáo viên dùng công cụ tick đúng (✔), gạch sai (✘), bút đỏ và ghi chú trực tiếp lên ảnh.
- **Quản lý Lớp học & Học sinh:**
  - Import/Export danh sách học sinh từ file Excel (`.xlsx`).
  - Phân quyền đề thi theo lớp hoặc mở tự do qua link/mã đề.
- **Thống kê & Xuất báo cáo:**
  - Biểu đồ phổ điểm chuẩn Bộ GD&ĐT.
  - Xuất bảng điểm chi tiết ra file Excel (`.xlsx`) chỉ với 1 click.
- **Ngân hàng câu hỏi:**
  - Phân loại theo môn học, khối lớp và 4 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao).

---

## Công nghệ sử dụng

- **Framework:** Next.js 16 (App Router, Server Actions)
- **Ngôn ngữ:** TypeScript
- **Cơ sở dữ liệu:** SQLite nhúng (`better-sqlite3`, WAL mode) - Cài đặt 0 cấu hình
- **Giao diện:** Tailwind CSS v4, Lucide Icons
- **Công thức Toán:** KaTeX
- **Xử lý tài liệu:** Mammoth (DOCX), SheetJS (XLSX)

---

## Cài đặt & Chạy dự án

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy môi trường phát triển
npm run dev

# 3. Mở trình duyệt tại http://localhost:3000
```

Hệ thống sẽ tự động khởi tạo cơ sở dữ liệu SQLite `azota.db` và nạp sẵn dữ liệu demo (Lớp 12A1, đề kiểm tra khảo sát Toán 12 kèm công thức KaTeX và câu hỏi tự luận).
