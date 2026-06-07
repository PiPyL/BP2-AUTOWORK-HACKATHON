# BurgerPrints AI Mockup Generator (Chrome Extension)

[🇺🇸 English Version](README.md)

Một tiện ích mở rộng Chrome (Chrome Extension) thông minh và bảo mật được thiết kế riêng cho các nhà bán hàng (**Sellers**) trên nền tảng **BurgerPrints**. Tiện ích sử dụng trực tiếp Gemini API của Google để tự động tạo ảnh mockup lifestyle chất lượng cao và viết nội dung sản phẩm chuẩn SEO ngay tại trang tạo sản phẩm mới—giúp tiết kiệm hàng giờ thiết kế và viết lách thủ công.

---

## 🌟 Các Tính Năng Nổi Bật

### 1. Tự Động Tạo Ảnh Mockup Lifestyle Bằng AI
*   **Tạo Mockup Tùy Chỉnh (Custom Mockup)**: Mở Side Panel để điều chỉnh chi tiết concept ảnh (chọn quốc gia của nhân vật, bối cảnh trong nhà/ngoài trời, phong cách, sản phẩm mặc trên người và số lượng ảnh cần tạo).
*   **Tạo Mockup Tự Động (Auto Mockup - 1 Click)**: Tạo ảnh trực tiếp trên trang tạo sản phẩm mà không cần mở Side Panel. AI sẽ tự động phân tích thiết kế của bạn để đưa ra gợi ý bối cảnh và người mẫu phù hợp nhất.
*   **Kiểm Tra Chất Lượng Ảnh (AI Audit)**: Mọi hình ảnh được tạo ra đều đi qua một bước kiểm duyệt của Gemini để loại bỏ các ảnh lỗi (mặt người bị biến dạng, dính logo thương hiệu lớn hoặc mặt người nổi tiếng), đảm bảo giữ nguyên 100% hình ảnh sản phẩm gốc của bạn.

### 2. Trợ Lý Viết Nội Dung & Tối Ưu SEO
*   **Tự Động Viết Nội Dung**: Chỉ với 1 click, AI sẽ tự động tạo và điền các trường thông tin: **Tiêu đề sản phẩm (H1)**, **Mô tả chi tiết (Description)**, **Mô tả ngắn (Short Description)**, **SEO Title** và **SEO Description**.
*   **Phân Tích Hình Ảnh**: AI có khả năng phân tích trực tiếp từ các ảnh mockup vừa tạo để viết nội dung mô tả sản phẩm một cách chân thực và đồng bộ nhất.

### 3. Bảo Mật & Tiện Lợi (Không Cần Backend)
*   **Kết Nối Trực Tiếp**: Extension gọi trực tiếp tới API Gemini của Google từ trình duyệt của bạn. API Key được lưu an toàn tại Local Storage của extension trên máy bạn, tuyệt đối không gửi về bất kỳ máy chủ trung gian nào.
*   **Xử Lý Chạy Ngầm (Offscreen)**: Các tác vụ nặng như tạo ảnh và kiểm duyệt ảnh được thực hiện ngầm giúp trang web của bạn không bị đơ hoặc lag trong quá trình tạo.

---

## 📦 Hướng Dẫn Cài Đặt Cho Người Dùng Không Rành Kỹ Thuật (Non-Tech)

Có 2 cách để cài đặt tiện ích này. Nếu bạn là người dùng cuối và muốn sử dụng ngay, hãy làm theo **Cách 1**.

### Cách 1: Cài đặt nhanh bằng File ZIP (Khuyên Dùng)

1.  **Tải file cài đặt**:
    Click vào link bên dưới để tải phiên bản mới nhất của tiện ích về máy tính:  
    👉 [Tải về file burger-mockup-extension.zip](https://github.com/PiPyL/BP2-AUTOWORK-HACKATHON/releases/latest/download/burger-mockup-extension.zip)
2.  **Giải nén File ZIP**:
    *   **Trên Windows**: Nhấp chuột phải vào file `.zip` vừa tải về -> Chọn **Extract All...** (Giải nén tất cả...) -> Chọn thư mục lưu trữ rồi nhấn **Extract**.
    *   **Trên Mac**: Nhấp đúp (Double-click) vào file `.zip`. File sẽ tự động giải nén thành một thư mục có tên `burger-mockup-extension`.
    *   *Lưu ý: Bạn nên cất thư mục đã giải nén này ở một nơi an toàn (ví dụ: thư mục Documents). Không được xóa hoặc di chuyển thư mục này sau khi đã cài đặt.*
3.  **Mở trang Quản lý Tiện ích trên Chrome**:
    *   Mở trình duyệt Google Chrome.
    *   Nhập đường dẫn `chrome://extensions/` vào thanh địa chỉ rồi nhấn **Enter**.
    *   Hoặc click vào biểu tượng mảnh ghép (Tiện ích) ở góc trên bên phải Chrome -> Chọn **Quản lý tiện ích** (Manage Extensions).
4.  **Bật Chế Độ Nhà Phát Triển (Developer Mode)**:
    *   Ở góc trên bên phải màn hình Quản lý Tiện ích, hãy gạt công tắc **Chế độ dành cho nhà phát triển** (Developer mode) sang trạng thái **BẬT (ON)**.
5.  **Cài đặt Extension vào Chrome**:
    *   Nhấp vào nút **Tải tiện ích đã giải nén** (Load unpacked) ở góc trên bên trái.
    *   Tìm và chọn đúng thư mục `burger-mockup-extension` mà bạn vừa giải nén ở Bước 2 (thư mục chứa file `manifest.json`).
    *   *Hoàn thành! Biểu tượng tiện ích sẽ xuất hiện trên thanh công cụ của Chrome.*

---

### Cách 2: Cài đặt từ mã nguồn gốc (Dành Cho Lập Trình Viên)

1.  Sao chép mã nguồn từ GitHub:
    ```bash
    git clone https://github.com/PiPyL/BP2-AUTOWORK-HACKATHON.git
    ```
2.  Mở Chrome và truy cập đường dẫn `chrome://extensions/`.
3.  Bật **Chế độ dành cho nhà phát triển** (Developer mode).
4.  Chọn **Tải tiện ích đã giải nén** (Load unpacked) và trỏ tới thư mục dự án vừa clone.

---

## 🔑 Hướng Dẫn Cấu Hình API Key

Vì extension này kết nối trực tiếp với dịch vụ của Google, bạn cần có một mã khóa (API Key) để sử dụng. Việc lấy key này hoàn toàn **miễn phí và nhanh chóng**:

1.  **Lấy Gemini API Key**:
    *   Truy cập trang [Google AI Studio](https://aistudio.google.com/).
    *   Đăng nhập bằng tài khoản Google (Gmail) của bạn.
    *   Nhấp vào nút **Get API key** (Tạo API Key) -> Chọn **Create API Key** và sao chép (Copy) đoạn mã được cấp.
2.  **Lưu API Key vào Extension**:
    *   Truy cập trang tạo sản phẩm mới của BurgerPrints: [dash.burgerprints.com/admin/products/new](https://dash.burgerprints.com/admin/products/new).
    *   Bạn sẽ thấy một bảng thông báo của Extension được chèn tự động dưới ô Title.
    *   Click vào nút **Tạo Mockup Tùy Chỉnh** (hoặc click biểu tượng Extension trên thanh công cụ) để mở bảng điều khiển bên phải (Side Panel).
    *   Tại tab cấu hình cài đặt (Settings), dán mã API Key bạn vừa copy ở bước trên vào ô nhập liệu rồi nhấn **Lưu** (Save).

---

## 🚀 Hướng Dẫn Sử Dụng

### Tự Động Viết Nội Dung Sản Phẩm (AI Listing)
1.  Vào trang tạo sản phẩm mới trên BurgerPrints Dashboard.
2.  Tại khu vực tiêu đề sản phẩm, bạn sẽ thấy banner **Trợ lý viết nội dung AI** được chèn ngay bên dưới.
3.  Nhấp vào **AI viết nội dung sản phẩm** (AI viết nội dung) hoặc **AI tạo ảnh + nội dung** (Trải nghiệm đầy đủ).
4.  Chờ vài giây để AI tự động điền đầy đủ Tiêu đề, Mô tả và các thẻ SEO. Bạn hãy kiểm tra lại nội dung trước khi bấm lưu sản phẩm.

### Tạo Mockup Tùy Chỉnh Qua Side Panel
1.  Bấm vào nút **Tạo Mockup Tùy Chỉnh** dưới phần Mockup trên trang web (hoặc nhấp biểu tượng Extension trên thanh công cụ Chrome).
2.  Chọn các thiết lập theo ý muốn:
    *   **Nhân vật**: Quốc tịch (Mỹ, Nhật, Hàn, Trung,...) và Độ tuổi/Giới tính.
    *   **Bối cảnh**: Trong nhà, Ngoài trời, Studio, Quán cafe, Đường phố,...
    *   **Cách thể hiện**: Nhân vật mặc sản phẩm, cầm sản phẩm, hoặc xếp phẳng (flat lay).
    *   **Số lượng ảnh**: Chọn số lượng ảnh mockup cần tạo.
3.  Nhấn nút **Generate** (Tạo ảnh). Các ảnh tạo xong sẽ lần lượt xuất hiện trực quan.
4.  Tích chọn những ảnh bạn ưng ý nhất và nhấn **Thêm vào Mockup** để tải trực tiếp lên BurgerPrints.

### Tạo Nhanh Mockup Tự Động (1 Click)
1.  Bấm nút **Tạo Mockup Tự Động** ngay dưới khu vực Mockup của trang.
2.  Hệ thống sẽ chạy ngầm, tự động phân tích ảnh thiết kế hiện tại và tạo ra những bộ ảnh mockup lifestyle phù hợp nhất.
3.  Bạn có thể theo dõi tiến độ từng bước trực tiếp trên giao diện trang tạo sản phẩm và bấm Hủy nếu cần. Ảnh đạt chất lượng sẽ tự động được thêm vào danh sách Mockup của sản phẩm.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```plaintext
├── manifest.json              # Định nghĩa thông tin và phân quyền của extension
├── _locales/                  # File đa ngôn ngữ (vi: Tiếng Việt, en: Tiếng Anh)
├── background/
│   └── service-worker.js      # Script chạy ngầm quản lý trạng thái panel và truyền tin nhắn
├── content/
│   ├── content.js             # Script chính can thiệp trực tiếp và tùy biến giao diện BurgerPrints
│   └── content.css            # Stylesheets cho các thành phần giao diện được chèn thêm (nút, thanh tiến trình)
├── sidepanel/
│   ├── sidepanel.html         # Giao diện của Side Panel điều khiển bên phải
│   ├── sidepanel.js           # Xử lý các tương tác trên Side Panel
│   ├── sidepanel.css          # Giao diện styling cho các thành phần của Side Panel
│   ├── gemini-service.js      # Module kết nối và gọi API Gemini
│   ├── storage-service.js     # Tiện ích quản lý lưu trữ dữ liệu cục bộ (API key, lịch sử tạo)
│   └── i18n-service.js        # Module hỗ trợ đa ngôn ngữ cho Side Panel
├── offscreen/
│   ├── runner.html            # Trang container chạy ngầm offscreen
│   └── runner.js              # Script xử lý các tác vụ nặng ngầm (gọi API, kiểm duyệt ảnh)
└── icons/                     # Thư mục chứa các biểu tượng của Extension
```

---

## 🛡️ Bản Quyền (License)

Dự án này được cấp phép theo Giấy phép MIT. Xem chi tiết tại file [LICENSE](LICENSE).

*Lưu ý: Tiện ích mở rộng này là một công cụ độc lập được phát triển nhằm hỗ trợ sellers và không có mối liên kết chính thức hay thuộc sở hữu của BurgerPrints.*
