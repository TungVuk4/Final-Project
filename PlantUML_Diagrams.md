# PlantUML Diagrams — FashionStyle Project

## ⚠️ HOW TO USE: Copy ONLY the lines from @startuml to @enduml (do NOT copy the ```plantuml fences)
## Paste into: https://www.plantuml.com/plantuml/uml/ OR https://planttext.com

---

## Figure 2.1 — Multi-Tier System Architecture Diagram

```plantuml
@startuml
skinparam backgroundColor #FAFAFA
skinparam defaultFontName Arial
skinparam defaultFontSize 11
skinparam componentStyle rectangle
skinparam ArrowColor #333333
skinparam packageBorderColor #888888

title FashionStyle -- Multi-Tier System Architecture

package "PRESENTATION TIER" #D6EAF8 {
  component "Customer Web App\nReact 18 + Vite\nPort: 5174" as WEB
  component "Admin Dashboard\nReact 19 + Vite\nPort: 5173" as ADMIN
  component "Android Mobile App\nReact Native 0.84.1\nHybrid WebView" as APP
}

package "APPLICATION TIER" #FEF9E7 {
  package "Backend: Node.js + Express.js | Port 8080" {
    component "JWT\nMiddleware" as JWT
    component "13 API\nRoute Groups" as API
    component "Multer\nFile Upload" as MULTER
    component "Nodemailer\nAsync Email" as MAIL
  }
}

package "DATA TIER" #EAFAF1 {
  database "MySQL 8.0\nPort: 3306\n21 Tables" as DB
}

WEB --> API : sends REST calls via Axios
ADMIN --> API : sends REST calls via Axios
APP --> API : tunnels via ADB Reverse

JWT --> API : validates each request
API --> DB : reads and writes via MySQL2
API --> MULTER : handles file uploads
API --> MAIL : triggers async emails

note right of APP
  ADB Reverse Tunnel:
  adb reverse tcp:8080 tcp:8080
  adb reverse tcp:5174 tcp:5174
  adb reverse tcp:8081 tcp:8081
end note

@enduml
```

---

## Figure 2.2 — Use Case Diagram: Customer and Guest Module

```plantuml
@startuml
left to right direction
skinparam backgroundColor #FAFAFA
skinparam defaultFontSize 11

title FashionStyle -- Use Case Diagram: Customer and Guest Module

actor "Guest User" as Guest
actor "Registered Member" as Member
Member --|> Guest

rectangle "FashionStyle Web and Mobile -- Customer Module" {
  usecase "UC-WEB-01\nRegisters Account" as UC1
  usecase "UC-WEB-02\nLogs In to System" as UC2
  usecase "UC-WEB-03\nLogs Out of System" as UC3
  usecase "UC-WEB-04\nManages Account Profile" as UC4
  usecase "UC-WEB-05\nManages Wishlist" as UC5
  usecase "UC-WEB-06\nBrowses Featured Products" as UC6
  usecase "UC-WEB-07\nSearches and Filters Products" as UC7
  usecase "UC-WEB-08\nSaves Suggested Voucher" as UC8
  usecase "UC-WEB-09\nAdds Item to Cart" as UC9
  usecase "UC-WEB-10\nViews and Updates Cart" as UC10
  usecase "UC-WEB-11\nPlaces Order and Checks Out" as UC11
  usecase "UC-WEB-12\nViews Order History" as UC12
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

## Figure 2.3 — Use Case Diagram: Administrator Module (3 Levels)

```plantuml
@startuml
left to right direction
skinparam backgroundColor #FAFAFA
skinparam defaultFontSize 11

title FashionStyle -- Use Case Diagram: Administrator Module (3 Levels)

actor "Admin Level 1\nChief Admin\nFull System Access" as A1
actor "Admin Level 2\nStock Admin\nManages Products" as A2
actor "Admin Level 3\nOperations Admin\nProcesses Orders" as A3

rectangle "FashionStyle Admin Dashboard" {
  usecase "UC-ADM-01\nLogs In and Views Dashboard" as UA1
  usecase "UC-ADM-02\nViews Revenue Statistics" as UA2
  usecase "UC-ADM-03\nLocks and Unlocks User Accounts" as UA3
  usecase "UC-ADM-04\nViews Activity Logs" as UA4
  usecase "UC-ADM-05\nConfigures System Settings" as UA5
  usecase "UC-ADM-06\nManages Products CRUD" as UA6
  usecase "UC-ADM-07\nManages Categories and Colors" as UA7
  usecase "UC-ADM-08\nCreates and Assigns VIP Vouchers" as UA8
  usecase "UC-ADM-09\nProcesses and Updates Orders" as UA9
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
A3 --> UA9

@enduml
```

---

## Figure 2.4 — Use Case Diagram: Android Mobile App

```plantuml
@startuml
left to right direction
skinparam backgroundColor #FAFAFA
skinparam defaultFontSize 11

title FashionStyle -- Use Case Diagram: Android Mobile App

actor "App Guest\nNot Logged In" as AppGuest
actor "App Member\nLogged In" as AppMember
AppMember --|> AppGuest

rectangle "FashionStyle Android App (React Native + Hybrid WebView)" {
  usecase "UC-MOB-01\nViews Synced Products" as UM1
  usecase "UC-MOB-02\nAdds Item to Cart" as UM2
  usecase "UC-MOB-03\nApplies Voucher at Checkout" as UM3
  usecase "UC-MOB-04\nAuthenticates via JWT Token" as UM4
  usecase "UC-MOB-05\nManages Profile and Address" as UM5
  usecase "UC-MOB-06\nTracks Order Status" as UM6
}

AppGuest --> UM1
AppGuest --> UM2
AppGuest --> UM4

AppMember --> UM3
AppMember --> UM5
AppMember --> UM6

UM3 ..> UM4 : <<include>>

@enduml
```

---

## Figure 2.5 — Data Flow Diagram (DFD) Level 0

```plantuml
@startuml
top to bottom direction
skinparam backgroundColor #FAFAFA
skinparam defaultFontName Arial
skinparam defaultFontSize 11

title FashionStyle -- Data Flow Diagram (DFD) Level 0

actor "Customer\n(Web + Mobile App)" as CUST
actor "Administrator\n(Level 1 / 2 / 3)" as ADMIN

component "FashionStyle System\nNode.js API (Port 8080)" as SYS

database "MySQL Database\n21 Tables" as DB
actor "Email Service\nNodemailer + Gmail" as EMAIL

CUST --> SYS : browses and searches products
SYS --> CUST : returns product list and details
CUST --> SYS : adds to cart and places order
SYS --> CUST : confirms order and sends status
CUST --> SYS : registers and logs in
SYS --> CUST : issues JWT token

ADMIN --> SYS : logs in to admin panel
SYS --> ADMIN : returns dashboard statistics
ADMIN --> SYS : manages products, orders, users
ADMIN --> SYS : changes system configuration

SYS --> DB : reads and writes all data
DB --> SYS : returns query results

SYS --> EMAIL : triggers email notification
EMAIL --> CUST : delivers order status email
EMAIL --> ADMIN : delivers new order alert

@enduml
```

---

## Figure 2.6 — ERD Group 1: System and User Management
### Tables: Users · User_Password_Reset · Admin_Activity_Logs · System_Config · Notifications

```plantuml
@startuml
skinparam backgroundColor #FAFAFA
skinparam defaultFontSize 11

title ERD -- Group 1: System and User Management

entity "Users" as USERS {
  * UserID : INT <<PK>>
  --
  FullName : VARCHAR(100)
  Email : VARCHAR(150) <<UNIQUE>>
  PasswordHash : VARCHAR(255)
  Role : ENUM
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

USERS ||--o{ RESET : "requests password reset"
USERS ||--o{ LOGS : "performs admin actions"
USERS ||--o{ CONFIG : "updates system config"
USERS ||--o{ NOTIF : "receives notifications"

@enduml
```

---

## Figure 2.7 — ERD Group 2: Product Management
### Tables: Categories · Products · Product_Costs · Product_Sizes · Colors · Product_Colors · Image

```plantuml
@startuml
skinparam backgroundColor #FAFAFA
skinparam defaultFontSize 11

title ERD -- Group 2: Product Management

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

CAT ||--o{ PROD : "categorizes products"
PROD ||--o{ COST : "tracks cost history"
PROD ||--o{ SIZES : "defines size variants"
PROD ||--o{ PCOL : "assigns color variants"
COL ||--o{ PCOL : "is used in"
PROD ||--o{ IMG : "stores product images"

@enduml
```

---

## Figure 2.8 — ERD Group 3: Promotions and Interaction
### Tables: Promotions · Promotions_Code · UserVouchers · Reviews

```plantuml
@startuml
skinparam backgroundColor #FAFAFA
skinparam defaultFontSize 11

title ERD -- Group 3: Promotions and Interaction

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

PROMO ||--o{ PCODE : "generates discount codes"
PROMO ||--o{ UVOU : "assigns vouchers to users"

@enduml
```

---

## Figure 2.9 — ERD Group 4: Shopping and Transactions
### Tables: Shopping_Carts · Cart_Items · Orders · OrderDetails · Payment_Transactions

```plantuml
@startuml
skinparam backgroundColor #FAFAFA
skinparam defaultFontSize 11

title ERD -- Group 4: Shopping and Transactions

entity "Shopping_Carts" as CART {
  * CartID : INT <<PK>>
  --
  # UserID : INT <<FK>>
  GuestToken : VARCHAR(255)
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
  PaymentMethod : ENUM
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
  Status : ENUM
  CreatedAt : DATETIME
}

CART ||--o{ CITEMS : "contains cart items"
ORD ||--o{ ODET : "includes order line items"
ORD ||--o{ PAY : "records payment transactions"

@enduml
```
