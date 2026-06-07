CREATE DATABASE RestaurantDB

USE RestaurantDB;
GO

-- =========================================
-- 2. TẠO CÁC BẢNG (TABLES) VỚI ĐỊNH DẠNG NVARCHAR
-- =========================================

-- Bảng người dùng
CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255), -- Lưu BCrypt hash
    role VARCHAR(50),      -- 'USER' hoặc 'ADMIN'
    phone VARCHAR(20),
    avatar_url NVARCHAR(1000),
    created_at DATETIME DEFAULT GETDATE()
);

-- Bảng danh mục món ăn
CREATE TABLE categories (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) UNIQUE
);

-- Bảng món ăn
CREATE TABLE foods (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(500),
    image_url VARCHAR(1000),
    price FLOAT NOT NULL,
    category_id BIGINT,
    CONSTRAINT FK_FOOD_CATEGORY FOREIGN KEY(category_id) REFERENCES categories(id)
);

-- Bảng giỏ hàng
CREATE TABLE cart_items (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    quantity INT,
    food_id BIGINT,
    user_id BIGINT,
    CONSTRAINT FK_CART_FOOD FOREIGN KEY(food_id) REFERENCES foods(id),
    CONSTRAINT FK_CART_USER FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Bảng đơn hàng
CREATE TABLE orders (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    customer_name NVARCHAR(255),
    phone VARCHAR(20),
    address NVARCHAR(255),
    total_price FLOAT,
    discount_amount FLOAT DEFAULT 0.0,
    coupon_code VARCHAR(50),
    status VARCHAR(50), -- 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'
    order_date DATETIME DEFAULT GETDATE(),
    user_id BIGINT,
    CONSTRAINT FK_ORDER_USER FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Bảng chi tiết đơn hàng
CREATE TABLE order_items (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    quantity INT,
    food_id BIGINT,
    order_id BIGINT,
    CONSTRAINT FK_ORDERITEM_FOOD FOREIGN KEY(food_id) REFERENCES foods(id),
    CONSTRAINT FK_ORDERITEM_ORDER FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Bảng đặt bàn trước
CREATE TABLE reservations (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    customer_name NVARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    reserve_date DATE NOT NULL,
    reserve_time VARCHAR(20) NOT NULL,
    num_guests INT NOT NULL,
    note NVARCHAR(500),
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at DATETIME DEFAULT GETDATE(),
    user_id BIGINT,
    CONSTRAINT FK_RESERVATION_USER FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Bảng đánh giá món ăn
CREATE TABLE reviews (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(1000),
    created_at DATETIME DEFAULT GETDATE(),
    user_id BIGINT,
    food_id BIGINT,
    CONSTRAINT FK_REVIEW_USER FOREIGN KEY(user_id) REFERENCES users(id),
    CONSTRAINT FK_REVIEW_FOOD FOREIGN KEY(food_id) REFERENCES foods(id) ON DELETE CASCADE
);

-- Bảng mã giảm giá
CREATE TABLE coupons (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent FLOAT NOT NULL,
    max_discount FLOAT,
    min_order_amount FLOAT,
    expiry_date DATETIME,
    active BIT DEFAULT 1,
    usage_limit INT,
    used_count INT DEFAULT 0
);
GO

-- =========================================
-- 3. NẠP DỮ LIỆU MẪU (SEED DATA)
-- =========================================

-- Tài khoản người dùng mẫu
-- Chú ý: password đã được mã hoá BCrypt tương ứng với mật khẩu '123456' để đăng nhập được từ giao diện.
INSERT INTO users (full_name, email, password, role, phone, created_at)
VALUES 
(N'Quản Trị Viên', 'admin@gmail.com', '$2a$10$HRNL.wzz2dgizvtZzsq6pO0wjBinMlBKgwBPKc7Em3h6POUuv3fgy', 'ADMIN', '0999999999', GETDATE()),
(N'Khách Hàng A', 'khachhang@gmail.com', '$2a$10$HRNL.wzz2dgizvtZzsq6pO0wjBinMlBKgwBPKc7Em3h6POUuv3fgy', 'USER', '0901234567', GETDATE());

-- Thêm 5 danh mục món ăn (ID tự tăng từ 1 tới 5)
INSERT INTO categories (name) VALUES 
(N'Khai Vị'),     -- ID 1
(N'Món Chính'),   -- ID 2
(N'Lẩu & Súp'),   -- ID 3
(N'Tráng Miệng'), -- ID 4
(N'Đồ Uống');     -- ID 5

-- =========================================
-- Danh mục 1: Khai Vị (20 món)
-- =========================================
INSERT INTO foods (name, description, image_url, price, category_id) VALUES
    (N'Gỏi cuốn tôm thịt', N'Gỏi cuốn tươi mát với tôm, thịt heo, bún, rau sống cuốn trong bánh tráng mỏng.', 'images/goi-cuon-tom-thit.jpg', 35000, 1),
    (N'Chả giò tôm thịt', N'Chả giò giòn rụm nhân tôm thịt, chiên vàng đều, ăn kèm nước mắm chua ngọt.', 'images/cha-gio-tom-thit.jpg', 45000, 1),
    (N'Súp cua tóc tiên', N'Súp cua thơm ngon với trứng bắc thảo, nấm tuyết và rong biển tóc tiên.', 'images/sup-cua-toc-tien.jpg', 40000, 1),
    (N'Bánh xèo miền Tây', N'Bánh xèo giòn tan nhân tôm, thịt, giá đỗ, ăn kèm rau sống miền Tây.', 'images/banh-xeo-mien-tay.jpg', 65000, 1),
    (N'Bánh khọt Vũng Tàu', N'Bánh khọt Vũng Tàu nhỏ xinh, giòn bên ngoài, mềm bên trong, nhân tôm tươi.', 'images/banh-khot-vung-tau.jpg', 50000, 1),
    (N'Cánh gà chiên nước mắm', N'Cánh gà chiên giòn tẩm nước mắm chua ngọt đậm đà, thơm tỏi phi.', 'images/canh-ga-chien-nuoc-mam.jpg', 85000, 1),
    (N'Gỏi ngó sen tôm thịt', N'Ngó sen giòn sần sật trộn cùng tôm tươi, thịt ba chỉ, cà rốt và nước mắm chua ngọt.', 'images/goi-ngo-sen-tom-thit.jpg', 75000, 1),
    (N'Gỏi đu đủ tai heo', N'Đu đủ xanh bào sợi trộn cùng tai heo lược giòn sần sật, bóp chua ngọt cay nồng.', 'images/goi-du-du-tai-heo.jpg', 60000, 1),
    (N'Nem nướng Nha Trang', N'Nem nướng Nha Trang thơm lừng, thịt heo xay nướng than hoa, ăn kèm bánh tráng chiên giòn.', 'images/nem-nuong-nha-trang.jpg', 80000, 1),
    (N'Bánh bột lọc Huế', N'Bánh bột lọc Huế trong suốt, nhân tôm thịt, chấm nước mắm ớt cay.', 'images/banh-bot-loc-hue.jpg', 45000, 1),
    (N'Bánh bèo chén', N'Bánh bèo chén mỏng mịn, rắc tôm chấy, hành phi, chan nước mắm ngọt.', 'images/banh-beo-chen.jpg', 40000, 1),
    (N'Bánh ít trần', N'Bánh ít trần dẻo mềm nhân tôm thịt, ăn kèm nước mắm tỏi ớt.', 'images/banh-it-tran.jpg', 45000, 1),
    (N'Hến xúc bánh đa', N'Hến xúc bánh đa giòn, hến xào sả ớt thơm nức, đặc sản xứ Huế.', 'images/hen-xuc-banh-da.jpg', 55000, 1),
    (N'Sụn gà rang muối', N'Sụn gà rang muối giòn tan, thơm lá chanh, ăn kèm tương ớt.', 'images/sun-ga-rang-muoi.jpg', 79000, 1),
    (N'Khoai tây chiên bơ tỏi', N'Khoai tây chiên giòn rụm tẩm bơ tỏi thơm phức, ăn vặt hấp dẫn.', 'images/khoai-tay-chien-bo-toi.jpg', 35000, 1),
    (N'Đậu hũ lướt ván', N'Đậu hũ lướt ván chiên giòn bên ngoài, mềm mịn bên trong, chấm mắm ớt.', 'images/dau-hu-luot-van.jpg', 30000, 1),
    (N'Ốc hương cháy tỏi', N'Ốc hương tươi cháy tỏi thơm lừng, thịt ốc ngọt giòn đậm vị biển.', 'images/oc-huong-chay-toi.jpg', 120000, 1),
    (N'Nghêu hấp sả', N'Nghêu hấp sả thơm nồng, nước dùng ngọt thanh tự nhiên từ nghêu tươi.', 'images/ngheu-hap-sa.jpg', 55000, 1),
    (N'Bánh bao xá xíu', N'Bánh bao xá xíu nhân thịt heo xá xíu thơm ngọt, vỏ bánh trắng mềm xốp.', 'images/banh-bao-xa-xiu.jpg', 25000, 1),
    (N'Súp bắp cua', N'Súp bắp cua thơm béo, sánh mịn với trứng gà, nấm hương và bắp ngọt.', 'images/sup-bap-cua.jpg', 35000, 1);

-- =========================================
-- Danh mục 2: Món Chính (15 món)
-- =========================================
INSERT INTO foods (name, description, image_url, price, category_id) VALUES
    (N'Cơm tấm sườn bì chả', N'Cơm tấm Sài Gòn đầy đủ sườn nướng, bì, chả trứng, kèm nước mắm ngọt.', 'images/com-tam-suon-bi-cha.jpg', 65000, 2),
    (N'Phở bò tái nạm', N'Phở bò truyền thống với thịt bò tái mềm, nạm gầu, nước dùng trong thanh ngọt xương.', 'images/pho-bo-tai-nam.jpg', 70000, 2),
    (N'Phở gà xé', N'Phở gà xé thanh đạm, thịt gà ta thơm ngọt, nước dùng trong veo.', 'images/pho-ga-xe.jpg', 60000, 2),
    (N'Bún bò Huế', N'Bún bò Huế cay nồng, nước dùng đậm đà sả ớt, giò heo mềm rục.', 'images/bun-bo-hue.jpg', 75000, 2),
    (N'Bún chả Hà Nội', N'Bún chả Hà Nội thơm khói than, chả viên và thịt nướng chấm nước mắm chua ngọt.', 'images/bun-cha-ha-noi.jpg', 65000, 2),
    (N'Bún thịt nướng', N'Bún thịt nướng thơm lừng, thịt heo ướp sả nướng than, rau sống tươi mát.', 'images/bun-thit-nuong.jpg', 55000, 2),
    (N'Hủ tiếu Nam Vang', N'Hủ tiếu Nam Vang nước dùng trong ngọt, đầy đủ tôm, thịt, gan, trứng cút.', 'images/hu-tieu-nam-vang.jpg', 65000, 2),
    (N'Cơm chiên Dương Châu', N'Cơm chiên Dương Châu đầy đủ tôm, lạp xưởng, trứng, đậu hà lan.', 'images/com-chien-duong-chau.jpg', 65000, 2),
    (N'Cơm chiên hải sản', N'Cơm chiên hải sản với tôm, mực, cá, rau củ tươi xào lửa lớn.', 'images/com-chien-hai-san.jpg', 70000, 2),
    (N'Cơm gà Hải Nam', N'Cơm gà Hải Nam da giòn, thịt mềm mọng, cơm nấu nước dùng gà thơm béo.', 'images/com-ga-hai-nam.jpg', 75000, 2),
    (N'Mì Quảng ếch', N'Mì Quảng ếch sợi mì vàng ươm, nước dùng sánh, thịt ếch mềm ngọt, đậu phộng rang.', 'images/mi-quang-ech.jpg', 85000, 2),
    (N'Bánh canh cua', N'Bánh canh cua nước dùng sánh ngọt từ cua, sợi bánh canh dẻo mềm.', 'images/banh-canh-cua.jpg', 75000, 2),
    (N'Bún riêu cua đồng', N'Bún riêu cua đồng nước dùng chua thanh, riêu cua thơm béo, cà chua chín.', 'images/bun-rieu-cua-dong.jpg', 60000, 2),
    (N'Bún đậu mắm tôm', N'Bún đậu mắm tôm đầy đủ đậu chiên giòn, chả cốm, thịt luộc, mắm tôm đậm.', 'images/bun-dau-mam-tom.jpg', 80000, 2),
    (N'Bún mọc sườn non', N'Bún mọc sườn non nước dùng trong ngọt, mọc giòn dai, sườn non mềm rục.', 'images/bun-moc-suon-non.jpg', 60000, 2);

-- =========================================
-- Danh mục 3: Lẩu & Súp (8 món)
-- =========================================
INSERT INTO foods (name, description, image_url, price, category_id) VALUES
    (N'Lẩu Thái hải sản', N'Lẩu Thái hải sản chua cay nồng nàn, tôm mực cá tươi, nấm và rau.', 'images/lau-thai-hai-san.jpg', 290000, 3),
    (N'Lẩu gà lá giang', N'Lẩu gà lá giang chua thanh tự nhiên, thịt gà ta thơm ngọt đậm đà.', 'images/lau-ga-la-giang.jpg', 260000, 3),
    (N'Lẩu riêu cua bắp bò', N'Lẩu riêu cua bắp bò chua ngọt, riêu cua thơm béo, bắp bò mềm ngọt.', 'images/lau-rieu-cua-bap-bo.jpg', 280000, 3),
    (N'Lẩu bò nhúng giấm', N'Lẩu bò nhúng giấm chua nhẹ, thịt bò tươi nhúng chín tới, ăn kèm bún.', 'images/lau-bo-nhung-giam.jpg', 280000, 3),
    (N'Canh chua cá lóc', N'Canh chua cá lóc đậm đà miền Tây, cá lóc tươi nấu bạc hà, giá, me.', 'images/canh-chua-ca-loc.jpg', 85000, 3),
    (N'Canh khổ qua dồn thịt', N'Canh khổ qua dồn thịt thanh mát, khổ qua giòn nhồi thịt heo bằm.', 'images/canh-kho-qua-don-thit.jpg', 75000, 3),
    (N'Lẩu thả Phan Thiết', N'Lẩu thả Phan Thiết nước dùng hải sản tươi ngọt, nhúng các loại cá tôm mực.', 'images/lau-tha-phan-thiet.jpg', 320000, 3),
    (N'Súp đuôi bò', N'Súp đuôi bò hầm mềm rục, nước dùng ngọt đậm từ xương bò ninh kỹ.', 'images/sup-duoi-bo.jpg', 95000, 3);

-- =========================================
-- Danh mục 4: Tráng Miệng (6 món)
-- =========================================
INSERT INTO foods (name, description, image_url, price, category_id) VALUES
    (N'Chè khúc bạch', N'Chè khúc bạch mát lịm, thạch trắng mềm mịn, nhãn tươi và nước đường hoa nhài.', 'images/che-khuc-bach.jpg', 35000, 4),
    (N'Pudding dâu tây', N'Pudding dâu tây mềm mịn, vị chua ngọt nhẹ, trang trí dâu tươi và sốt berry.', 'images/pudding-dau-tay.jpg', 35000, 4),
    (N'Sữa chua nếp cẩm', N'Sữa chua nếp cẩm béo mịn kết hợp nếp cẩm dẻo thơm, mát lạnh hấp dẫn.', 'images/sua-chua-nep-cam.jpg', 30000, 4),
    (N'Trái cây dĩa thập cẩm', N'Trái cây dĩa thập cẩm tươi mát theo mùa, bày trí đẹp mắt.', 'images/trai-cay-dia-thap-cam.jpg', 60000, 4),
    (N'Tàu hũ trân châu đường đen', N'Tàu hũ trân châu đường đen mềm mịn, trân châu dai giòn, nước đường đen thơm.', 'images/tau-hu-tran-chau-duong-den.jpg', 35000, 4),
    (N'Bánh su kem', N'Bánh su kem vỏ giòn xốp, nhân kem custard béo mịn thơm vani.', 'images/banh-su-kem.jpg', 25000, 4);

-- =========================================
-- Danh mục 5: Đồ Uống (9 món)
-- =========================================
INSERT INTO foods (name, description, image_url, price, category_id) VALUES
    (N'Cà phê sữa đá', N'Cà phê sữa đá đậm đặc kiểu Việt Nam, hòa quyện sữa đặc ngọt béo.', 'images/ca-phe-sua-da.jpg', 29000, 5),
    (N'Cà phê đen đá', N'Cà phê đen đá nguyên chất, đậm vị robusta Việt Nam, đắng thanh.', 'images/ca-phe-den-da.jpg', 25000, 5),
    (N'Trà đào cam sả', N'Trà đào cam sả thơm mát, kết hợp đào, cam tươi và sả thơm dịu.', 'images/tra-dao-cam-sa.jpg', 39000, 5),
    (N'Trà sữa trân châu truyền thống', N'Trà sữa trân châu truyền thống béo ngậy, trân châu đen dai mềm.', 'images/tra-sua-tran-chau-truyen-thong.jpg', 45000, 5),
    (N'Nước suối tinh khiết', N'Nước suối tinh khiết đóng chai, giải khát thanh mát mọi lúc.', 'images/nuoc-suoi-tinh-khiet.jpg', 15000, 5),
    (N'Bia Heineken', N'Bia Heineken lon mát lạnh, vị đắng nhẹ thanh, hương hoa bia đặc trưng.', 'images/bia-heineken.jpg', 39000, 5),
    (N'Bia Tiger', N'Bia Tiger lon đậm đà, mạnh mẽ, hương vị đặc trưng châu Á.', 'images/bia-tiger.jpg', 35000, 5),
    (N'Coca Cola', N'Coca-Cola lon mát lạnh, vị ngọt sảng khoái, có gas sủi tăm.', 'images/coca-cola.jpg', 20000, 5),
    (N'Pepsi', N'Pepsi lon mát lạnh, vị cola ngọt thanh, có gas sảng khoái.', 'images/pepsi.jpg', 20000, 5);

-- =========================================
-- 4. MÃ GIẢM GIÁ MẪU (COUPONS)
-- =========================================
INSERT INTO coupons (code, discount_percent, max_discount, min_order_amount, expiry_date, active, usage_limit, used_count) VALUES
('HUIT50', 50.0, 100000.0, 100000.0, DATEADD(day, 30, GETDATE()), 1, 100, 0),
('WELCOME10', 10.0, 50000.0, 0.0, DATEADD(day, 60, GETDATE()), 1, 500, 0),
('KM20K', 20.0, 20000.0, 50000.0, DATEADD(day, -5, GETDATE()), 1, 200, 0);

-- =========================================
-- 5. ĐÁNH GIÁ MẪU (REVIEWS)
-- =========================================
INSERT INTO reviews (rating, comment, created_at, user_id, food_id) VALUES
(5, N'Gỏi cuốn ngon, giá hợp túi tiền!', GETDATE(), 2, 1),
(4, N'Chả giò giòn tan, nóng hổi rất ngon.', GETDATE(), 2, 2);
GO

-- =========================================
-- KIỂM TRA DỮ LIỆU
-- =========================================
SELECT 'Users:' AS [Table]; SELECT * FROM users;
SELECT 'Categories:' AS [Table]; SELECT * FROM categories;
SELECT 'Foods (' + CAST(COUNT(*) AS VARCHAR) + ' món):' AS [Summary] FROM foods;
SELECT * FROM foods;
SELECT 'Coupons:' AS [Table]; SELECT * FROM coupons;
SELECT 'Reviews:' AS [Table]; SELECT * FROM reviews;