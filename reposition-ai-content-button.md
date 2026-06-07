# Kế hoạch triển khai: Banner AI viết nội dung sản phẩm (Option A)

Kế hoạch chi tiết để triển khai **Phương án A**: Di chuyển nút AI viết nội dung ra ngoài vùng Title và thiết kế lại thành một **Banner trợ lý AI thông minh** đặt ở trên cùng của cột bên trái (phía trên Card Title & Description).

---

## 👥 Các Agent tham gia & Vai trò

1. **`project-planner`** (Lập kế hoạch): Xác định mục tiêu, phân chia nhiệm vụ và xây dựng tiến trình thực hiện.
2. **`frontend-specialist`** (Thiết kế & Cài đặt UI/UX): Thiết kế giao diện banner sang trọng, xử lý việc chèn DOM ổn định trong SPA và chỉnh sửa CSS tạo hiệu ứng mượt mà.
3. **`seo-specialist`** (Tối ưu hóa SEO): Đảm bảo các thẻ HTML của banner chuẩn SEO, không gây xung đột với thẻ H1 của trang, và tối ưu hóa nội dung mô tả tính năng.
4. **`performance-optimizer`** (Tối ưu hiệu năng): Đảm bảo banner tải nhẹ, các chuyển động/animation mượt mà không gây giật lag và không ảnh hưởng đến điểm số LCP/INP của trang.

---

## 📐 Chi tiết thiết kế UI/UX của Banner (Option A)

- **Vị trí:** Phía trên cùng của cột bên trái, ngay phía trên nhãn "Tittle (H1)" và ô nhập liệu Title.
- **Cấu trúc Banner:**
  - Một khung viền mềm mại, bo góc `8px`.
  - Nền gradient tím nhạt sang trọng, tạo cảm giác công nghệ AI nhưng tinh tế, không chói mắt.
  - Bên trái: Icon lấp lánh (Sparkle Icon `✨`) kết hợp với dòng giới thiệu ngắn: **"Tối ưu nội dung với AI: Tự động viết tiêu đề, mô tả và tối ưu SEO sản phẩm."**
  - Bên phải: Nút **"AI viết nội dung sản phẩm"** (được làm gọn gàng, nút bấm nổi bật).
  - Bên dưới: Vùng hiển thị trạng thái động (Đang xử lý..., Hoàn thành!, Lỗi...) với màu sắc tương ứng (Tím/Xanh lá/Đỏ).

---

## 🛠️ Đề xuất thay đổi mã nguồn

### 1. File `content.js` (Frontend & DOM)
- Tìm phần tử bọc lớn nhất của vùng nhập Title (form-group của Title).
- Chèn banner lên đầu vùng này (sử dụng `insertAdjacentElement('beforebegin', ...)` đối với container Title hoặc chèn làm phần tử đầu tiên của card nội dung).
- Thay đổi cấu trúc HTML được tạo trong `createProductContentButton` và `injectProductContentButton` để bọc banner này thay vì chỉ bọc một nút đơn lẻ.

### 2. File `content.css` (Style & Motion)
- Định nghĩa style cho class `.bp-ai-product-content` thành một khung banner rộng 100% với flexbox layout.
- Thêm hiệu ứng hover mượt mà và chuyển cảnh nhẹ nhàng khi hiển thị trạng thái thành công/thất bại.

---

## 🧪 Kế hoạch kiểm thử & Xác minh

### Kiểm thử giao diện (UI/UX)
- [ ] Banner hiển thị đúng vị trí (trên cùng cột trái, ngoài ô input Title).
- [ ] Không làm lệch ô input Title (Title chiếm lại 100% độ rộng).
- [ ] Hiển thị đẹp mắt trên cả màn hình nhỏ và lớn (responsive).

### Kiểm thử chức năng
- [ ] Click nút AI trên banner điền đúng và đủ 5 trường (Title, Description, Short Desc, SEO Title, SEO Desc).
- [ ] Trạng thái loading, thành công, lỗi hiển thị mượt mà trên banner.

### Kiểm thử Hiệu năng & SEO
- [ ] Không sử dụng các thẻ tiêu đề trùng lặp (`<h1>`, `<h2>`) trong banner làm nhiễu cấu trúc SEO của trang gốc.
- [ ] Các chuyển động sử dụng thuộc tính tối ưu GPU (`transform`, `opacity`) để giữ điểm mượt mà.
