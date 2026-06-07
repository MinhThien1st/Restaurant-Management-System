# 🍽️ HUIT Restaurant Management System

Hệ thống quản lý nhà hàng với backend Spring Boot (Java) và frontend HTML/JS thuần, sử dụng SQL Server làm cơ sở dữ liệu.

---

## 🛠️ Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Backend | Java, Spring Boot |
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Database | Microsoft SQL Server |
| IDE | IntelliJ IDEA |
| API | RESTful API |

---

## ⚙️ Yêu cầu hệ thống

- Java 17+
- IntelliJ IDEA
- Microsoft SQL Server (2019 trở lên)
- SQL Server Management Studio (SSMS) — tùy chọn
- Trình duyệt web bất kỳ

---

## 🗄️ Cài đặt Database

1. Mở **SQL Server Management Studio** hoặc kết nối qua IntelliJ
2. Tạo database mới tên `RestaurantDB`
3. Chạy file script để tạo bảng và nạp dữ liệu mẫu:

```sql
-- Chạy file này trong SSMS hoặc query editor
restaurant_db_setup.sql
```

---

## 🚀 Cách chạy Backend

1. Mở project bằng **IntelliJ IDEA**
2. Mở file `src/main/resources/application.properties`, chỉnh thông tin kết nối:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=RestaurantDB;encrypt=false
spring.datasource.username=sa
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver
```

3. Nhấn **Run** (Shift + F10) hoặc chạy class `main`
4. Backend khởi động tại: `http://localhost:8080`

---

## 🌐 Cách chạy Frontend

1. Mở thư mục `frontend/` (hoặc `resources/static/`)
2. Mở file `index.html` bằng trình duyệt, hoặc dùng Live Server (VS Code extension)
3. Frontend tự động gọi API về `http://localhost:8080`

> ⚠️ Đảm bảo backend đang chạy trước khi mở frontend.

---

## 📁 Cấu trúc thư mục

```
RetaurantManagementSystem/
├── src/
│   └── main/
│       ├── java/
│       │   └── ...         # Controllers, Services, Repositories
│       └── resources/
│           ├── application.properties
│           └── static/     # Frontend (HTML, CSS, JS)
├── restaurant_db_setup.sql # Script khởi tạo database
├── pom.xml
└── README.md
```

---

## 🔑 Tài khoản mẫu

| Role | Email | Mật khẩu |
|---|---|---|
| Admin | admin@gmail.com | 123456 |
| Khách hàng | khachhang@gmail.com | 123456 |

---

## 📌 API Endpoints chính

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/foods` | Lấy danh sách món ăn |
| GET | `/api/categories` | Lấy danh mục |
| POST | `/api/orders` | Tạo đơn hàng |
| GET | `/api/orders/{id}` | Xem chi tiết đơn |
| POST | `/api/auth/login` | Đăng nhập |

---

## 👨‍💻 Tác giả

**MinhThien1st** — [github.com/MinhThien1st](https://github.com/MinhThien1st)
