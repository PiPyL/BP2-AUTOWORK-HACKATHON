# theme-light-dark-mode.md

Kế hoạch tích hợp chế độ Light/Dark Mode theo màu sắc logo BurgerPrints cho extension sidepanel.

## Đề xuất Thiết kế UI/UX
- **Màu chủ đạo (Primary Accent):** Xanh dương BurgerPrints (`#0A5EE6`). Dùng cho hover states, focus outlines, chips active, secondary buttons.
- **Màu nhấn (Hero Accent):** Cam BurgerPrints (`#F27420` / `#FF6B35`). Dùng cho nút CTA chính "Generate AI Mockups" dạng gradient nổi bật.
- **Dark Mode:** Deep Dark (`#0F111A`), Card (`#151F30`), Text (`#F8FAFC`).
- **Light Mode:** Soft Light (`#F4F6F9`), Card (`#FFFFFF`), Text (`#0F172A`).
- **Theme Switcher:** Nút toggle ở Header hiển thị Sun ☀️ (trong Dark mode) / Moon 🌙 (trong Light mode).
- **Lưu trữ:** Lưu vào `chrome.storage.local`. Tự động nhận diện theme hệ thống khi khởi chạy lần đầu.

## Các File Cần Thay Đổi

### [MODIFY] [sidepanel/sidepanel.css](file:///Users/mac/Desktop/AutoWork%20Project/Hackathon/burger-mockup-extension/sidepanel/sidepanel.css)
- Cấu hình lại `:root` và thêm các định nghĩa màu sắc cho `body[data-theme="dark"]` và `body[data-theme="light"]`.
- Thêm hiệu ứng transition mượt mà cho việc chuyển đổi màu sắc.

### [MODIFY] [sidepanel/sidepanel.html](file:///Users/mac/Desktop/AutoWork%20Project/Hackathon/burger-mockup-extension/sidepanel/sidepanel.html)
- Thêm nút `#btn-theme-toggle` vào trước nút Settings ở Header.

### [MODIFY] [sidepanel/storage-service.js](file:///Users/mac/Desktop/AutoWork%20Project/Hackathon/burger-mockup-extension/sidepanel/storage-service.js)
- Thêm `theme: 'auto'` vào giá trị mặc định của Settings.

### [MODIFY] [sidepanel/sidepanel.js](file:///Users/mac/Desktop/AutoWork%20Project/Hackathon/burger-mockup-extension/sidepanel/sidepanel.js)
- Thêm logic xử lý theme: Đọc storage, lắng nghe sự kiện click nút toggle để chuyển chế độ và lưu lại.
- Cập nhật màu động cho các Badge danh mục.

## Kế hoạch Kiểm thử
- **Manual Test:** 
  1. Kiểm tra chuyển đổi theme có đổi màu toàn bộ UI mượt mà không.
  2. Kiểm tra lưu trữ trạng thái khi tắt/mở lại extension.
  3. Kiểm tra tính dễ đọc của văn bản ở cả hai chế độ.
