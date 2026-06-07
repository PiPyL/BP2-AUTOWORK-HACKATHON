
##Phát triển 1 chrome extension để giúp seller của BurgerStudio có thể tạo bộ ảnh lifestyle mockup bằng AI một cách nhanh chóng khi tạo product

API Gemini:
- Phân tích ảnh: https://ai.google.dev/gemini-api/docs/image-generation => gemini-3.5-flash
- Tạo ảnh: https://ai.google.dev/gemini-api/docs/image-generation => gemini-3.1-flash-image
- Phân tích: https://ai.google.dev/gemini-api/docs/text-generation => gemini-3.5-flash


Input:
1. Trang tạo sản phẩm đang mở: https://dash.burgerprints.com/admin/products/new
2. Hình ảnh trang sản phẩm
3. Thông tin thêm nếu có: text + ảnh nhân vật (nếu)

Output:
1. Bộ ảnh lifestyle mockup

Lưu ý:
- KHÔNG sinh logo brand thật / mặt người nổi tiếng
- Đảm bảo 100% giữ đúng hình ảnh sản phẩm
- Có bước dùng Gemini để audit ảnh


##Settings (multi select + input)
- Nhân vật người ở quốc gia nào
- Phong cách: Mỹ / Nhật / Hàn / Trung / ...
- Bối cảnh: Trong nhà / ngoài trời / studio / ...
- Sản phẩm trên người nhân vật (mặc/mang)
- Số lượng ảnh

##Chèn 1 button ở dưới button Add mockup => click vào sẽ mở side bar để người dùng confirm các thông tin để tạo bộ ảnh AI

##Flow 
1. Người dùng click vào button => hiện side bar 
2. User chọn các thông tin trong settings
3. User click vào button Generate => Tùy thuộc vào số lượng ảnh sẽ call đến gemini API sẽ trả về bộ ảnh AI (ảnh nào tạo xong sẽ show tuần tự, ko đợi tạo hết mới show)
7. Extension sẽ hiển thị bộ ảnh AI cho người dùng
8. Người dùng có thể chọn bộ ảnh AI để thêm vào danh sách ảnh ở section Mockup

##Note: extension sẽ call api gemini trực tiếp mà ko thông qua backend. Có lưu lại lịch sử tạo ảnh trong Local Storage. Ảnh sẽ lưu trong folder của máy


##Tự động lưu ảnh AI đã tạo

##Quick Generate không cần mở side panel
1. Người dùng click "Tạo nhanh Mockup bằng AI" ngay dưới section Mockup.
2. Extension chạy AI Suggest, tự chọn preset ưu tiên, phân tích sản phẩm, tạo và audit ảnh trong offscreen runner.
3. Trang sản phẩm hiển thị progress/status trực quan và cho phép hủy tác vụ.
4. Ảnh vượt audit được tự động thêm tuần tự vào component Mockup.
5. Khi hoàn tất hoặc thất bại, extension cập nhật status trên trang và gửi Chrome notification.

##AI viết nội dung sản phẩm
1. Người dùng click "AI viết nội dung sản phẩm" bên dưới trường Tittle (H1).
2. Extension dùng Gemini API key đã lưu, ảnh sản phẩm, loại sản phẩm, màu sắc và nội dung hiện tại làm ngữ cảnh.
3. AI tạo và tự động điền Tittle (H1), Description, Short description, SEO Title và SEO Description.
4. Nội dung được giới hạn theo form: H1 255 ký tự, Description 4000 ký tự, Short description 255 ký tự, SEO Title 70 ký tự và SEO Description 160 ký tự.
5. Extension không thay đổi URL handle và không tự động Save. Người dùng cần kiểm tra nội dung trước khi lưu sản phẩm.
