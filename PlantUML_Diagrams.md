# PlantUML Diagrams — FashionStyle Project
## Hướng dẫn: Copy từng đoạn code vào https://planttext.com → Export PNG → chèn vào Word.
## Mỗi đoạn tương ứng với 1 hình trong DANH SÁCH HÌNH ẢNH của report.

---

## Hình 2.1 — Sơ đồ Kiến Trúc Hệ Thống Đa Tầng (Multi-Tier System Architecture Diagram)

```plantuml
@startuml FashionStyle_Architecture
!theme plain
skinparam backgroundColor #FAFAFA
skinparam defaultFontName Arial
skinparam defaultFontSize 12
skinparam ArrowColor #333333
skinparam componentStyle rectangle

title FashionStyle — Multi-Tier System Architecture

package "PRESENTATION TIER\n(Client Layer)" as PT #LightSkyBlue {
  [Customer Web App\nReact 18 + Vite\nPort: 5174\nTailwind + Redux] as WEB
  [Admin Dashboard\nReact 19 + Vite\nPort: 5173\nPrimeReact + Zustand] as ADMIN
  [Android Mobile App\nReact Native 0.84.1\nHybrid WebView] as APP
}

package "APPLICATION TIER\n(Business Logic)" as AT #LightGoldenRodYellow {
  package "Backend Project — Node.js + Express\nPort: 8080" {
    [JWT Auth\nMiddleware] as JWT
    [13 API Route\nGroups] as API
    [Multer\nFile Upload] as MULTER
    [Nodemailer\nAsync Email] as MAIL
  }
}

package "DATA TIER\n(Persistence)" as DT #LightGreen {
  database "MySQL 8.0\nPort: 3306\n21 Tables" as DB
}

WEB --> API : Axios HTTP\nREST API (JSON)
ADMIN --> API : Axios HTTP\nREST API (JSON)
APP --> API : ADB Reverse Tunnel\nHTTP → 10.0.2.2

JWT --> API
API --> MULTER
API --> MAIL
API --> DB : MySQL2\nConnection Pool

note right of APP
  ADB Reverse Tunnel:
  tcp:8080 → Backend
  tcp:5174 → Web Server
  tcp:8081 → Metro Bundler
end note
@enduml
```

---

## Hình 2.2 — Sơ đồ Use Case: Khách hàng / Khách vãng lai (UC-WEB-01 đến UC-WEB-12)
## Figure 2.2 — Use Case Diagram: Customer / Guest (UC-WEB-01 to UC-WEB-12)

```plantuml
@startuml FashionStyle_UseCase_Customer
!theme plain
skinparam backgroundColor #FAFAFA
left to right direction
skinparam defaultFontSize 11
skinparam packageStyle rectangle

title FashionStyle — Use Case Diagram: Customer / Guest Module

actor "Guest User\n(Khách vãng lai)" as Guest #LightSkyBlue
actor "Registered Member\n(Thành viên)" as Member #SteelBlue
Member -|> Guest

rectangle "FashionStyle Web & Mobile — Customer Module" {
  usecase "UC-WEB-01\nRegister Account\n(Đăng ký tài khoản)" as UC1
  usecase "UC-WEB-02\nLogin\n(Đăng nhập)" as UC2
  usecase "UC-WEB-03\nLogout\n(Đăng xuất)" as UC3
  usecase "UC-WEB-04\nManage Account Profile\n(Quản lý hồ sơ)" as UC4
  usecase "UC-WEB-05\nManage Wishlist & Comments\n(Danh sách yêu thích & bình luận)" as UC5
  usecase "UC-WEB-06\nView Featured Products\n(Xem sản phẩm trang chủ)" as UC6
  usecase "UC-WEB-07\nAdvanced Search & Filter\n(Tìm kiếm nâng cao)" as UC7
  usecase "UC-WEB-08\nSave Suggested Voucher\n(Lưu voucher gợi ý)" as UC8
  usecase "UC-WEB-09\nAdd Item to Cart\n(Thêm vào giỏ hàng)" as UC9
  usecase "UC-WEB-10\nView & Update Cart\n(Xem và cập nhật giỏ)" as UC10
  usecase "UC-WEB-11\nPlace Order / Checkout\n(Đặt hàng / Thanh toán)" as UC11
  usecase "UC-WEB-12\nView Order History & Cancel\n(Lịch sử đơn & Hủy đơn)" as UC12
}

Guest --> UC1
Guest --> UC2
Guest --> UC6
Guest --> UC7
Guest --> UC9
Guest --> UC10
Member --> UC3
Member --> UC4
Member --> UC5
Member --> UC8
Member --> UC11
Member --> UC12
UC11 ..> UC8 : <<include>>
@enduml
```

---

## Hình 2.3 — Sơ đồ Use Case: Quản trị viên Cấp 1, 2, 3 (UC-ADM-01 đến UC-ADM-08)
## Figure 2.3 — Use Case Diagram: Administrator Level 1, 2, 3 (UC-ADM-01 to UC-ADM-08)

```plantuml
@startuml FashionStyle_UseCase_Admin
!theme plain
skinparam backgroundColor #FAFAFA
left to right direction
skinparam defaultFontSize 11

title FashionStyle — Use Case Diagram: Administrator Module (3 Levels)

actor "Admin Level 1\n(Chief Admin)\nToàn quyền hệ thống" as A1 #LightCoral
actor "Admin Level 2\n(Stock Admin)\nQuản lý sản phẩm & KM" as A2 #LightGoldenRodYellow
actor "Admin Level 3\n(Operations Admin)\nXử lý đơn hàng" as A3 #LightGreen

rectangle "FashionStyle Admin Dashboard" {
  usecase "UC-ADM-01\nLogin & View Dashboard Summary\n(Đăng nhập & Xem tổng quan)" as UA1
  usecase "UC-ADM-02\nView Revenue Statistics\n(Xem thống kê doanh thu)" as UA2
  usecase "UC-ADM-03\nManage Users\n(Lock / Unlock Accounts)" as UA3
  usecase "UC-ADM-04\nView Activity Logs\n(Xem nhật ký hoạt động)" as UA4
  usecase "UC-ADM-05\nConfigure System Settings\n(Bảo trì / Tắt đăng ký)" as UA5
  usecase "UC-ADM-06\nManage Products\n(Add / Edit / Delete + Images)" as UA6
  usecase "UC-ADM-07\nManage Categories & Colors\n(Danh mục & Màu sắc)" as UA7
  usecase "UC-ADM-08\nConfigure Vouchers\n(Create Campaign & VIP Vouchers)" as UA8
}

A1 --> UA1
A1 --> UA2
A1 --> UA3
A1 --> UA4
A1 --> UA5

A2 --> UA1
A2 --> UA6
A2 --> UA7
A2 --> UA8

A3 --> UA1
A3 --> UA4
@enduml
```

---

## Hình 2.4 — Sơ đồ Use Case: Người dùng Ứng dụng Di động (UC-MOB-01 đến UC-MOB-06)
## Figure 2.4 — Use Case Diagram: Mobile App User (UC-MOB-01 to UC-MOB-06)

```plantuml
@startuml FashionStyle_UseCase_Mobile
!theme plain
skinparam backgroundColor #FAFAFA
left to right direction
skinparam defaultFontSize 11

title FashionStyle — Use Case Diagram: Android Mobile App

actor "App Guest\n(Chưa đăng nhập)" as AppGuest #LightSkyBlue
actor "App Member\n(Đã đăng nhập)" as AppMember #SteelBlue
AppMember -|> AppGuest

rectangle "FashionStyle Android App (React Native + Hybrid WebView)" {
  usecase "UC-MOB-01\nView Synced Products\n(Real-time với Website)" as UM1
  usecase "UC-MOB-02\nAdd to Cart\n(Đồng bộ Real-time)" as UM2
  usecase "UC-MOB-03\nApply Voucher for Mobile\n(Thanh toán với mã giảm giá)" as UM3
  usecase "UC-MOB-04\nPush Authentication\n(JWT Storage via domStorage)" as UM4
  usecase "UC-MOB-05\nManage Profile & Address\n(Hồ sơ & Địa chỉ giao hàng)" as UM5
  usecase "UC-MOB-06\nTrack Order Status\n(Pending / Shipping / Completed)" as UM6
}

AppGuest --> UM1
AppGuest --> UM2
AppGuest --> UM4
AppMember --> UM3
AppMember --> UM5
AppMember --> UM6
UM3 ..> UM3 : <<include>> UM4
@enduml
```

---

## Hình 2.5 — Sơ đồ Luồng Dữ Liệu (DFD) Mức 0
## Figure 2.5 — Data Flow Diagram (DFD) Level 0

```plantuml
@startuml FashionStyle_DFD_Level0
!theme plain
skinparam backgroundColor #FAFAFA
skinparam defaultFontName Arial
skinparam defaultFontSize 12

title FashionStyle — Data Flow Diagram (DFD) Level 0

actor "Customer\n(Web + Mobile App)" as CUST #LightSkyBlue
actor "Administrator\n(Level 1 / 2 / 3)" as ADMIN #LightSalmon
rectangle "  FashionStyle System  \n  (Node.js API — Port 8080)  " as SYS #LightYellow
database "MySQL Database\n(21 Tables)" as DB #LightGreen
actor "Email Service\n(Nodemailer + Gmail)" as EMAIL #Plum

CUST --> SYS : ① Browse / Search Products
SYS --> CUST : ② Product List & Details
CUST --> SYS : ③ Add to Cart / Place Order\n   (+ GuestToken or JWT)
SYS --> CUST : ④ Order Confirmation
CUST --> SYS : ⑤ Register / Login
SYS --> CUST : ⑥ JWT Token Response

ADMIN --> SYS : ⑦ Admin Login
SYS --> ADMIN : ⑧ Dashboard Stats & Reports
ADMIN --> SYS : ⑨ Manage Products / Orders / Users
ADMIN --> SYS : ⑩ System Config Changes

SYS --> DB : ⑪ CRUD Queries\n(Read / Write)
DB --> SYS : ⑪ Query Results

SYS --> EMAIL : ⑫ Trigger\nEmail Notification
EMAIL --> CUST : ⑫ Order Status\nEmail (HTML)
EMAIL --> ADMIN : ⑫ New Order\nAlert Email
@enduml
```

---

## Hình 2.6 — ERD Nhóm 1: Quản lý Hệ thống & Người dùng
## Figure 2.6 — ERD Group 1: System & User Management
### Tables: Users · User_Password_Reset · Admin_Activity_Logs · System_Config · Notifications

```plantuml
@startuml FashionStyle_ERD_Group1_System
!theme plain
skinparam backgroundColor #FAFAFA
skinparam defaultFontSize 11

title ERD — Group 1: System & User Management

entity "Users" as USERS {
  * UserID : INT <<PK>>
  --
  FullName : VARCHAR(100)
  Email : VARCHAR(150) <<UNIQUE>>
  PasswordHash : VARCHAR(255)
  Role : ENUM('Customer','Admin 1','Admin 2','Admin 3')
  IsLocked : TINYINT(1)
  GuestToken : VARCHAR(255)
  CreatedAt : DATETIME
}

entity "User_Password_Reset" as RESET {
  * ResetID : INT <<PK>>
  --
  # UserID : INT <<FK>>
  OTPCode : VARCHAR(10)
  ExpiresAt : DATETIME
  IsUsed : TINYINT(1)
}

entity "Admin_Activity_Logs" as LOGS {
  * LogID : INT <<PK>>
  --
  # AdminID : INT <<FK>>
  ActionType : VARCHAR(100)
  Description : TEXT
  CreatedAt : DATETIME
}

entity "System_Config" as CONFIG {
  * ConfigID : INT <<PK>>
  --
  ConfigKey : VARCHAR(100) <<UNIQUE>>
  ConfigValue : VARCHAR(255)
  # UpdatedBy : INT <<FK>>
  UpdatedAt : DATETIME
}

entity "Notifications" as NOTIF {
  * NotificationID : INT <<PK>>
  --
  # UserID : INT <<FK>>
  Title : VARCHAR(200)
  Message : TEXT
  IsRead : TINYINT(1)
  CreatedAt : DATETIME
}

USERS ||--o{ RESET : "has reset OTP"
USERS ||--o{ LOGS : "performs actions"
USERS ||--o{ CONFIG : "updates config"
USERS ||--o{ NOTIF : "receives"
@enduml
```

---

## Hình 2.7 — ERD Nhóm 2: Quản lý Sản phẩm
## Figure 2.7 — ERD Group 2: Product Management
### Tables: Categories · Products · Product_Costs · Product_Sizes · Colors · Product_Colors · Image

```plantuml
@startuml FashionStyle_ERD_Group2_Products
!theme plain
skinparam backgroundColor #FAFAFA
skinparam defaultFontSize 11

title ERD — Group 2: Product Management

entity "Categories" as CAT {
  * CategoryID : INT <<PK>>
  --
  CategoryName : VARCHAR(100)
  Description : TEXT
}

entity "Colors" as COL {
  * ColorID : INT <<PK>>
  --
  ColorName : VARCHAR(50)
  HexCode : VARCHAR(10)
}

entity "Products" as PROD {
  * ProductID : INT <<PK>>
  --
  # CategoryID : INT <<FK>>
  ProductName : VARCHAR(255)
  Description : TEXT
  Price : DECIMAL(10,2)
  IsActive : TINYINT(1)
  CreatedAt : DATETIME
}

entity "Product_Costs" as COST {
  * CostID : INT <<PK>>
  --
  # ProductID : INT <<FK>>
  CostPrice : DECIMAL(10,2)
  EffectiveDate : DATE
}

entity "Product_Sizes" as SIZES {
  * SizeID : INT <<PK>>
  --
  # ProductID : INT <<FK>>
  NameSize : VARCHAR(10)
  StockQuantity : INT
}

entity "Product_Colors" as PCOL {
  # ProductID : INT <<FK>>
  # ColorID : INT <<FK>>
}

entity "Image" as IMG {
  * ImageID : INT <<PK>>
  --
  # ProductID : INT <<FK>>
  ImageURL : VARCHAR(500)
  IsPrimary : TINYINT(1)
}

CAT ||--o{ PROD : "has products"
PROD ||--o{ COST : "has cost history"
PROD ||--o{ SIZES : "has sizes (S/M/L/XL)"
PROD ||--o{ PCOL : "has colors"
COL ||--o{ PCOL : "used in"
PROD ||--o{ IMG : "has images"
@enduml
```

---

## Hình 2.8 — ERD Nhóm 3: Khuyến mãi & Tương tác
## Figure 2.8 — ERD Group 3: Promotions & Interaction
### Tables: Promotions · Promotions_Code · UserVouchers · Reviews

```plantuml
@startuml FashionStyle_ERD_Group3_Promotions
!theme plain
skinparam backgroundColor #FAFAFA
skinparam defaultFontSize 11

title ERD — Group 3: Promotions & Interaction

entity "Promotions" as PROMO {
  * PromotionID : INT <<PK>>
  --
  PromotionName : VARCHAR(200)
  DiscountPercent : DECIMAL(5,2)
  IsActive : TINYINT(1)
  StartDate : DATE
  EndDate : DATE
}

entity "Promotions_Code" as PCODE {
  * CodeID : INT <<PK>>
  --
  # PromotionID : INT <<FK>>
  Code : VARCHAR(50) <<UNIQUE>>
  IsUsed : TINYINT(1)
  CreatedAt : DATETIME
}

entity "UserVouchers" as UVOU {
  * VoucherID : INT <<PK>>
  --
  # UserID : INT <<FK>>
  # PromotionID : INT <<FK>>
  SpecificCode : VARCHAR(50)
  IsUsed : TINYINT(1)
  AssignedAt : DATETIME
}

entity "Reviews" as REV {
  * ReviewID : INT <<PK>>
  --
  # ProductID : INT <<FK>>
  # UserID : INT <<FK>>
  Rating : TINYINT
  Comment : TEXT
  CreatedAt : DATETIME
}

PROMO ||--o{ PCODE : "generates codes"
PROMO ||--o{ UVOU : "assigned to users"
@enduml
```

---

## Hình 2.9 — ERD Nhóm 4: Mua sắm & Giao dịch
## Figure 2.9 — ERD Group 4: Shopping & Transactions
### Tables: Shopping_Carts · Cart_Items · Orders · OrderDetails · Payment_Transactions

```plantuml
@startuml FashionStyle_ERD_Group4_Orders
!theme plain
skinparam backgroundColor #FAFAFA
skinparam defaultFontSize 11

title ERD — Group 4: Shopping & Transactions

entity "Shopping_Carts" as CART {
  * CartID : INT <<PK>>
  --
  # UserID : INT <<FK>> (nullable)
  GuestToken : VARCHAR(255) (nullable)
  CreatedAt : DATETIME
}

entity "Cart_Items" as CITEMS {
  * CartItemID : INT <<PK>>
  --
  # CartID : INT <<FK>>
  # ProductID : INT <<FK>>
  # SizeID : INT <<FK>>
  # ColorID : INT <<FK>>
  Quantity : INT
  UnitPrice : DECIMAL(10,2)
}

entity "Orders" as ORD {
  * OrderID : INT <<PK>>
  --
  # UserID : INT <<FK>>
  # VoucherID : INT <<FK>>
  ReceiverName : VARCHAR(100)
  ReceiverPhone : VARCHAR(20)
  ShippingAddress : TEXT
  TotalAmount : DECIMAL(10,2)
  DiscountAmount : DECIMAL(10,2)
  FinalAmount : DECIMAL(10,2)
  PaymentMethod : ENUM('COD','Online')
  Status : VARCHAR(50)
  CreatedAt : DATETIME
}

entity "OrderDetails" as ODET {
  * OrderDetailID : INT <<PK>>
  --
  # OrderID : INT <<FK>>
  # ProductID : INT <<FK>>
  # SizeID : INT <<FK>>
  Quantity : INT
  UnitPrice : DECIMAL(10,2)
}

entity "Payment_Transactions" as PAY {
  * TransactionID : INT <<PK>>
  --
  # OrderID : INT <<FK>>
  TransactionCode : VARCHAR(100)
  Amount : DECIMAL(10,2)
  Status : ENUM('Pending','Paid','Failed')
  CreatedAt : DATETIME
}

CART ||--o{ CITEMS : "contains items"
ORD ||--o{ ODET : "has line items"
ORD ||--o{ PAY : "has transactions"
@enduml
```
