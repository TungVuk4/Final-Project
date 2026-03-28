# HƯỚNG DẪN VIẾT BÁO CÁO FINAL YEAR PROJECT
## Theo yêu cầu của Final Year Project Handbook (International Edition - V1)
## Dành cho: Rubric A — System Development (Application Based Project)

---

> **Môn học:** CBBR4106 – Final Year Project  
> **Trường:** Open University Malaysia (OUM) / FPT-Greenwich  
> **Chương trình:** Bachelor of Information Technology with Honours  
> **Loại đồ án:** System Development — E-Commerce System Application + Mobile Application

---

## 📋 MỤC LỤC FILE BÁO CÁO .md (Theo đúng thứ tự Handbook yêu cầu)

```
1. TITLE PAGE
2. DECLARATION
3. ABSTRACT
4. ACKNOWLEDGEMENTS
5. TABLE OF CONTENTS
6. LIST OF TABLES
7. LIST OF FIGURES
8. LIST OF ABBREVIATIONS
─────────────────────────────
CHAPTER 1 : INTRODUCTION
CHAPTER 2 : LITERATURE REVIEW
CHAPTER 3 : SYSTEM ANALYSIS AND DESIGN
CHAPTER 4 : SYSTEM IMPLEMENTATION AND TESTING
CHAPTER 5 : SUMMARY AND CONCLUSION
─────────────────────────────
REFERENCES
APPENDICES
```

---

# DEVELOPMENT OF A FASHION E-COMMERCE PLATFORM WITH MOBILE APPLICATION

*(Arial Narrow, size 18, Upper Case — dùng cho bìa)*

**[TÊN SINH VIÊN]**  
**[Mã số sinh viên]**

**OPEN UNIVERSITY MALAYSIA**  
**2026**

---

## DECLARATION

**Name:** [Tên sinh viên]  
**Matric Number:** [Mã số]

I hereby declare that this final year project is the result of my own work, except for quotations and summaries which have been duly acknowledged.

**Signature:** __________________ &nbsp;&nbsp;&nbsp;&nbsp; **Date:** __________________

---

## ABSTRACT

**DEVELOPMENT OF A FASHION E-COMMERCE PLATFORM WITH MOBILE APPLICATION**

*(Times New Roman, size 12, single spacing, không quá 250 từ)*

This project presents the development of a full-stack fashion e-commerce platform named FashionStyle, designed to provide customers with a seamless online shopping experience across web and mobile platforms. The system adopts a multi-tier architecture consisting of four integrated components: a Node.js RESTful API backend, a React-based customer web application, a React-based administrator dashboard, and an Android mobile application built with React Native. The mobile application employs a Hybrid WebView architecture, embedding the web frontend within a native Android shell to deliver consistent user experience without the need to develop a separate mobile interface. Key features include product management with inventory tracking by size and color, role-based access control for three levels of administrators, a personalized one-time promotional code system for VIP customers, real-time order processing with automated email notifications via Nodemailer, and a system configuration module allowing administrators to toggle maintenance mode and control user registration. The system was developed and tested on a local development environment using an Android Emulator connected via ADB Reverse Tunnel to ensure reliable communication between the mobile app and the local backend services.

**Keywords:** E-Commerce, React Native, WebView, Node.js, Full-Stack, Mobile Application

---

## ACKNOWLEDGEMENTS

I would like to take this opportunity to express my gratitude and appreciation to my supervisor, **[Tên supervisor]**, for his/her guidance, patience and invaluable advice throughout this project.

I also would like to express my appreciation to my family and friends for their endless support whenever I face problems. Without the mentioned parties, it is impossible for me to complete this project report successfully.

**THANK YOU.**

**[TÊN SINH VIÊN]**  
*28 March, 2026*

---

## TABLE OF CONTENTS

| Section | Page |
|---------|------|
| DECLARATION | ii |
| ABSTRACT | iii |
| ACKNOWLEDGEMENTS | iv |
| TABLE OF CONTENTS | v |
| LIST OF TABLES | vi |
| LIST OF FIGURES | vii |
| LIST OF ABBREVIATIONS | viii |
| **CHAPTER 1: INTRODUCTION** | 1 |
| 1.1 Background to the Study | 1 |
| 1.2 Problem Statement | 2 |
| 1.3 Objectives of the Study | 3 |
| 1.4 Scope and Limitation | 4 |
| 1.5 Implementation Plan | 5 |
| **CHAPTER 2: LITERATURE REVIEW** | 6 |
| 2.1 E-Commerce System Development | 6 |
| 2.2 Mobile Application Technologies | 8 |
| 2.3 Hybrid Mobile Application Architecture | 9 |
| 2.4 RESTful API Design | 11 |
| 2.5 Summary | 12 |
| **CHAPTER 3: SYSTEM ANALYSIS AND DESIGN** | 13 |
| 3.1 Feasibility Studies | 13 |
| 3.2 Requirement Methods | 15 |
| 3.3 System Development Methods | 17 |
| 3.4 Data and Process Modelling Diagrams | 18 |
| 3.5 Database Design | 22 |
| 3.6 Interface Design | 28 |
| **CHAPTER 4: SYSTEM IMPLEMENTATION AND TESTING** | 35 |
| 4.1 System Installation Manual | 35 |
| 4.2 System User Guides | 38 |
| 4.3 Testing Plan and Test Output | 44 |
| 4.4 Main Function Codes | 50 |
| **CHAPTER 5: SUMMARY AND CONCLUSION** | 55 |
| 5.1 Summary of Main Findings | 55 |
| 5.2 Discussion and Implications | 56 |
| 5.3 Limitations of the System | 57 |
| 5.4 Future Development | 58 |
| REFERENCES | 59 |
| APPENDICES | 61 |

---

## LIST OF TABLES

| Table | Title | Page |
|-------|-------|------|
| Table 3.1 | Functional Requirements | 15 |
| Table 3.2 | Non-Functional Requirements | 16 |
| Table 3.3 | Database Schema — Users Table | 22 |
| Table 3.4 | Database Schema — Products Table | 23 |
| Table 3.5 | Database Schema — Orders Table | 24 |
| Table 3.6 | Database Schema — Promotions Table | 25 |
| Table 4.1 | Test Cases — Authentication Module | 44 |
| Table 4.2 | Test Cases — Product Management Module | 46 |
| Table 4.3 | Test Cases — Order Processing Module | 48 |

---

## LIST OF FIGURES

| Figure | Title | Page |
|--------|-------|------|
| Figure 3.1 | System Architecture Diagram | 14 |
| Figure 3.2 | Use Case Diagram — Customer | 18 |
| Figure 3.3 | Use Case Diagram — Administrator | 19 |
| Figure 3.4 | Data Flow Diagram (DFD) Level 0 | 20 |
| Figure 3.5 | Entity-Relationship Diagram (ERD) | 21 |
| Figure 3.6 | Database Schema | 27 |
| Figure 3.7 | Homepage Interface Design | 28 |
| Figure 3.8 | Product Page Interface Design | 29 |
| Figure 3.9 | Admin Dashboard Interface Design | 30 |
| Figure 3.10 | Mobile App Interface Design | 31 |
| Figure 4.1 | Screenshot — Customer Homepage | 38 |
| Figure 4.2 | Screenshot — Product Detail Page | 39 |
| Figure 4.3 | Screenshot — Admin Dashboard | 41 |
| Figure 4.4 | Screenshot — Mobile App on Android | 43 |

---

## LIST OF ABBREVIATIONS

| Abbreviation | Full Form |
|-------------|-----------|
| API | Application Programming Interface |
| APK | Android Package Kit |
| ADB | Android Debug Bridge |
| CRUD | Create, Read, Update, Delete |
| DFD | Data Flow Diagram |
| ERD | Entity Relationship Diagram |
| HTTP | Hypertext Transfer Protocol |
| IT | Information Technology |
| JWT | JSON Web Token |
| OUM | Open University Malaysia |
| REST | Representational State Transfer |
| SDLC | Software Development Life Cycle |
| SQL | Structured Query Language |
| UI | User Interface |
| UX | User Experience |

---

---

# CHAPTER 1: INTRODUCTION

## 1.1 Background to the Study

The rapid growth of e-commerce has transformed the way consumers purchase goods and services globally. According to Statista (2024), global e-commerce sales are projected to surpass USD 7 trillion by 2025, driven by the growing penetration of smartphones and internet access. In Vietnam, the digital economy has experienced significant expansion, with online retail becoming a dominant channel for fashion and lifestyle products.

Despite the prevalent adoption of e-commerce platforms, many small and medium-sized fashion retailers still lack integrated digital solutions that support both web-based and mobile purchasing experiences. The absence of a unified platform often results in fragmented customer journeys, poor inventory control, and inefficient order management workflows.

This project, **FashionStyle**, addresses this gap by developing a comprehensive multi-tier e-commerce platform that integrates a customer-facing web application, an administrator dashboard, and a native Android mobile application. The system is designed using modern web technologies including Node.js, React, and React Native, providing a scalable and maintainable solution suitable for real-world business deployment.

## 1.2 Problem Statement

Current challenges faced by small fashion e-commerce businesses include:

1. **Lack of integrated mobile experience:** Most small retailers' websites are not optimised for mobile devices, resulting in poor conversion rates for mobile users.
2. **Inefficient order management:** Manual order processing is error-prone and delays customer communication.
3. **Inadequate inventory control:** Without a system tracking stock by size and colour, businesses frequently face overselling and customer dissatisfaction.
4. **No personalised promotion system:** Small retailers struggle to implement targeted VIP-level promotional campaigns.

## 1.3 Objectives of the Study

The objectives of this project are:

1. To design and develop a full-stack e-commerce platform consisting of a backend REST API, a customer web application, and an administrator dashboard.
2. To develop an Android mobile application using React Native that embeds the web interface through a WebView architecture, providing a consistent cross-platform experience.
3. To implement a role-based access control system that supports three levels of administrative management.
4. To develop an automated order management workflow integrated with email notifications.
5. To implement a personalized VIP promotional code system with one-time-use validation.

## 1.4 Scope and Limitation

### Scope

The FashionStyle system covers the following functional areas:

- **Customer Module:** Browse products, search, add to cart (for both authenticated and guest users), checkout, order history, and user profile management.
- **Administrator Module:** Three-tier role-based admin system covering product management, order processing and approval, promotional code management, user management, and system configuration.
- **Mobile Module:** Android mobile application wrapping the customer web application via WebView, supporting hardware back button navigation and initial loading experience.

### Limitation

- **Platform Limitation:** The mobile application is developed exclusively for Android. iOS support is not within the scope of this project.
- **Payment Gateway:** The system does not integrate with a real payment gateway. Orders are placed using Cash on Delivery (COD) or simulated online payment.
- **Deployment:** The system is hosted on a local development environment. Cloud deployment and production infrastructure are not part of this project.
- **Language:** The system supports English and Vietnamese interfaces. Other languages are not supported.

## 1.5 Implementation Plan

| Phase | Activity | Duration |
|-------|----------|----------|
| Phase 1 | Requirements Analysis & System Design | 2 weeks |
| Phase 2 | Backend API Development | 3 weeks |
| Phase 3 | Customer Web Application Development | 4 weeks |
| Phase 4 | Admin Dashboard Development | 2 weeks |
| Phase 5 | Android Mobile Application Development | 2 weeks |
| Phase 6 | System Integration & Testing | 2 weeks |
| Phase 7 | Documentation & Report Writing | 1 week |
| **Total** | | **16 weeks** |

---

# CHAPTER 2: LITERATURE REVIEW

## 2.1 E-Commerce System Development

E-commerce systems have evolved significantly from static catalogues to dynamic, database-driven platforms. According to Turban et al. (2018), effective e-commerce platforms must address four core functional requirements: product discovery, transaction processing, order management, and customer relationship management.

*(Viết tối thiểu 2-3 đoạn phân tích về các hệ thống E-Commerce liên quan như Shopify, WooCommerce, custom-built systems — so sánh với approach của bạn. Cần cite ít nhất 5-8 nguồn tài liệu học thuật hoặc chuyên ngành. Tổng chương này cần 6-10 trang.)*

## 2.2 Mobile Application Technologies

*(Phân tích sự khác biệt giữa Native App, Hybrid App, và Web App. Trích dẫn các nghiên cứu so sánh React Native với Flutter, Ionic, và Cordova. Giải thích lý do chọn React Native.)*

## 2.3 Hybrid Mobile Application Architecture (WebView)

*(Phân tích kiến trúc WebView. Trích dẫn các ứng dụng lớn sử dụng cách tiếp cận tương tự — Facebook, Instagram, Shopee. Giải thích ưu nhược điểm.)*

## 2.4 RESTful API Design and JWT Authentication

*(Phân tích các tiêu chuẩn REST API, JWT vs Session-based auth. Cite Roy Fielding (2000) về REST architecture.)*

## 2.5 Summary

*(Tóm tắt những gì đã review và cách chúng liên quan đến hệ thống của bạn.)*

---

# CHAPTER 3: SYSTEM ANALYSIS AND DESIGN

## 3.1 Feasibility Studies

### 3.1.1 Technical Feasibility

The FashionStyle system utilises widely adopted open-source technologies including Node.js (v18+), React 18, and React Native 0.84.1. All development tools, frameworks, and libraries are freely available, ensuring technical feasibility without licencing costs. The development environment requires a Windows-based workstation with Android Studio for mobile emulation.

### 3.1.2 Operational Feasibility

The system is designed with role-based access control to ensure that each user group (customers, Admin Level 1/2/3) can interact with only the relevant functionalities, minimising training requirements and operational errors.

### 3.1.3 Cost-Benefit Analysis

| Item | Cost |
|------|------|
| Development Tools (VS Code, Android Studio) | Free (Open Source) |
| Backend Framework (Node.js, Express) | Free (Open Source) |
| Frontend Framework (React, React Native) | Free (Open Source) |
| Database (MySQL) | Free (Community Edition) |
| Hosting (Local Development Environment) | USD 0 |

Benefits include: reduced order processing time, centralised inventory management, and expanded customer reach through mobile application.

## 3.2 Requirement Methods

### 3.2.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR01 | Customers can register, log in, and manage their profile | High |
| FR02 | Customers can browse products by category, colour, and price | High |
| FR03 | Customers can add products to cart and checkout (COD/Online) | High |
| FR04 | Guests can add items to cart using a GuestToken | Medium |
| FR05 | Admin 1 can manage all system configurations | High |
| FR06 | Admin 2 can manage products and promotional codes | High |
| FR07 | Admin 3 can process and update order status | High |
| FR08 | The system sends email notifications for orders | High |
| FR09 | The mobile app embeds the web interface on Android | High |
| FR10 | Admin 1 can toggle maintenance mode via dashboard | Medium |

### 3.2.2 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR01 | Response time for API calls must be under 500ms |
| NFR02 | The web interface must be fully responsive on mobile screens (375px–1440px) |
| NFR03 | JWT tokens for customers expire after 7 days |
| NFR04 | Admin JWT tokens do not expire |
| NFR05 | The system must support English and Vietnamese languages |

## 3.3 System Development Methods

This project adopts the **Rapid Application Development (RAD)** methodology combined with elements of the **Software Development Life Cycle (SDLC)** Waterfall model. RAD was selected due to the iterative nature of the user interface design requirements, which necessitated frequent review and refinement cycles across the web and mobile components.

The development process followed these phases:
1. Requirements and Planning
2. User Design and Prototyping
3. Construction and Coding
4. Cutover and Testing

## 3.4 Data and Process Modelling Diagrams

### 3.4.1 System Architecture Diagram

*(Nhúng ảnh sơ đồ kiến trúc hệ thống vào đây — có thể dùng ảnh chụp từ project_structure.md)*

```
[BACKEND :8080] ←── Axios HTTP ──→ [Page Web Chinh :5174]
      ↑                                       ↓
[MySQL DB]                          [FashionStyleApp Android]
      ↑                                  (WebView via ADB)
[BACKEND :8080] ←── Axios HTTP ──→ [Page Admin :5173]
```

### 3.4.2 Use Case Diagram

*(Mô tả bằng text hoặc nhúng ảnh PNG use case diagram)*

**Customer Use Cases:** Register · Login · Browse Products · Search · Add to Cart · Checkout · View Order History · Apply Promotional Code

**Admin 1 Use Cases:** View Dashboard · Manage Users · Approve Orders · Configure System · View All Logs

**Admin 2 Use Cases:** Add/Edit Products · Upload Images · Manage Promotions · Generate Voucher Codes

**Admin 3 Use Cases:** View Pending Orders · Process Orders · Update Order Status

### 3.4.3 Data Flow Diagram (DFD) Level 0

*(Mô tả luồng dữ liệu giữa Customer → System → Database → Admin)*

## 3.5 Database Design

### 3.5.1 Entity-Relationship Diagram (ERD)

*(Nhúng ảnh ERD tại đây)*

### 3.5.2 Database Schema

**Table: Users**

| Column | Type | Constraints |
|--------|------|-------------|
| UserID | INT | PRIMARY KEY, AUTO_INCREMENT |
| FullName | VARCHAR(255) | NOT NULL |
| Email | VARCHAR(255) | UNIQUE, NOT NULL |
| PasswordHash | VARCHAR(255) | NOT NULL |
| Role | ENUM('Customer','Admin') | DEFAULT 'Customer' |
| IsActive | TINYINT(1) | DEFAULT 1 |
| CanDeleteProduct | TINYINT(1) | DEFAULT 0 |
| CreatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**Table: Products**

| Column | Type | Constraints |
|--------|------|-------------|
| ProductID | INT | PRIMARY KEY, AUTO_INCREMENT |
| Name | VARCHAR(255) | NOT NULL |
| Description | TEXT | |
| Price | DECIMAL(10,2) | NOT NULL |
| CategoryID | INT | FOREIGN KEY → Categories |
| ImageURL | VARCHAR(500) | |
| CreatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**Table: Orders**

| Column | Type | Constraints |
|--------|------|-------------|
| OrderID | INT | PRIMARY KEY, AUTO_INCREMENT |
| UserID | INT | FOREIGN KEY → Users |
| TotalAmount | DECIMAL(10,2) | NOT NULL |
| Status | VARCHAR(50) | DEFAULT 'PENDING' |
| PaymentMethod | VARCHAR(50) | |
| ShippingAddress | TEXT | |
| CreatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**Table: Promotions**

| Column | Type | Constraints |
|--------|------|-------------|
| PromotionID | INT | PRIMARY KEY, AUTO_INCREMENT |
| Code | VARCHAR(100) | UNIQUE |
| DiscountPercent | DECIMAL(5,2) | |
| IsUsed | TINYINT(1) | DEFAULT 0 |
| IsActive | TINYINT(1) | DEFAULT 1 |

**Table: UserVouchers**

| Column | Type | Constraints |
|--------|------|-------------|
| VoucherID | INT | PRIMARY KEY, AUTO_INCREMENT |
| UserID | INT | FOREIGN KEY → Users |
| PromotionID | INT | FOREIGN KEY → Promotions |
| IsUsed | TINYINT(1) | DEFAULT 0 |
| AssignedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP |

## 3.6 Interface Design

*(Nhúng screenshots hoặc wireframes của các màn hình chính: Homepage, Product Detail, Cart, Checkout, Admin Dashboard, Mobile App)*

---

# CHAPTER 4: SYSTEM IMPLEMENTATION AND TESTING

## 4.1 Installation Manual

### 4.1.1 Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | ≥ 22.11.0 | Backend and Frontend runtime |
| MySQL | ≥ 8.0 | Database |
| Android Studio | Ladybug or later | Android Emulator |
| VS Code | Latest | Code Editor |
| Git | Latest | Version Control |

### 4.1.2 Backend Installation

```bash
# Step 1: Clone the repository
git clone https://github.com/TungVuk4/Final-Project.git
cd "Backend Project"

# Step 2: Install dependencies
npm install

# Step 3: Configure environment variables
# Create a .env file with:
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=fashionstyle
JWT_SECRET=your_jwt_secret
SMTP_EMAIL=your_gmail@gmail.com
SMTP_PASS=your_app_password

# Step 4: Start the server
npm run dev
# Server starts at http://localhost:8080
```

### 4.1.3 Web Application Installation

```bash
cd "Page Web Chinh"
npm install
npm run dev
# Available at http://localhost:5174
```

### 4.1.4 Admin Dashboard Installation

```bash
cd "Page Admin Project"
npm install
npm run dev
# Available at http://localhost:5173
```

### 4.1.5 Android Mobile Application Installation

```bash
# Step 1: Start Android Emulator via Android Studio Device Manager
# Step 2: Set up ADB Reverse Tunnel
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8080 tcp:8080
adb reverse tcp:5174 tcp:5174

# Step 3: Start Metro Bundler
cd "FashionStyleApp"
npm install
npm start

# Step 4: Build and install APK on emulator (in a new terminal)
npm run android
```

## 4.2 System User Guide

### 4.2.1 Customer Web Application

*(Screenshots với chú thích từng bước: Đăng ký → Đăng nhập → Duyệt sản phẩm → Thêm vào giỏ → Checkout)*

### 4.2.2 Admin Dashboard

**Admin Level 1 (Admin Chính):**
- Login: `admin1@fashionstyle.com` / `Admin@123`
- Access: Dashboard, User Management, System Configuration, Order Approval

**Admin Level 2 (Admin Kho):**
- Login: `admin2@fashionstyle.com` / `Admin@456`
- Access: Product Management, Promotional Code Generation

**Admin Level 3 (Admin Vận Hành):**
- Login: `admin3@fashionstyle.com` / `Admin@789`
- Access: Order Processing and Status Updates

### 4.2.3 Mobile Application (Android)

*(Screenshots của màn hình App trên máy ảo Android + mô tả các tính năng)*

## 4.3 Testing Plan and Test Output

### 4.3.1 Testing Approach

This project utilises **Black Box Testing** methodology, verifying system behaviour against functional requirements without examining internal code logic.

### 4.3.2 Test Cases — Authentication Module

| Test ID | Test Case | Input | Expected Output | Actual Output | Status |
|---------|-----------|-------|-----------------|---------------|--------|
| TC-AUTH-01 | Customer Login with valid credentials | Email: test@test.com, Password: Test@123 | Redirect to homepage, JWT stored | As expected | ✅ Pass |
| TC-AUTH-02 | Customer Login with invalid password | Email: test@test.com, Password: wrong | "Invalid email or password" message | As expected | ✅ Pass |
| TC-AUTH-03 | Admin Login with Admin credentials | admin1@fashionstyle.com / Admin@123 | Redirect to Admin Dashboard | As expected | ✅ Pass |
| TC-AUTH-04 | Register with existing email | Email already in DB | "Email already exists" error | As expected | ✅ Pass |

### 4.3.3 Test Cases — Order Module

| Test ID | Test Case | Expected Output | Status |
|---------|-----------|-----------------|--------|
| TC-ORD-01 | Place order as logged-in customer | Order saved to DB, confirmation email sent | ✅ Pass |
| TC-ORD-02 | Place order with valid promotional code | Discount applied, code marked IsUsed=1 | ✅ Pass |
| TC-ORD-03 | Place order with already-used code | "Code already used" error | ✅ Pass |
| TC-ORD-04 | Admin 3 updates order to PROCESSING | Status updated in DB, Admin 1 notified | ✅ Pass |

### 4.3.4 Test Cases — Mobile Application

| Test ID | Test Case | Expected Output | Status |
|---------|-----------|-----------------|--------|
| TC-MOB-01 | Launch app on Android Emulator | FashionStyle homepage loads inside WebView | ✅ Pass |
| TC-MOB-02 | Login in mobile app | JWT token stored in localStorage via domStorage | ✅ Pass |
| TC-MOB-03 | Press Android hardware back button | Navigates back in WebView, does not exit app | ✅ Pass |
| TC-MOB-04 | Navigate to product page on mobile | Responsive layout displays correctly | ✅ Pass |

## 4.4 Main Function Codes

### 4.4.1 Backend — JWT Authentication Middleware

```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}
```

### 4.4.2 Mobile App — WebView with Back Button Handler (App.tsx)

```typescript
// FashionStyleApp/App.tsx
const handleBackButton = useCallback(() => {
    if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // Prevents app from exiting
    }
    return false;
}, [canGoBack]);

React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress', handleBackButton
    );
    return () => backHandler.remove();
}, [handleBackButton]);
```

### 4.4.3 Backend — One-Time VIP Promotional Code Validation

```javascript
// routes/api/orders.js (excerpt)
if (promoCode) {
    const [voucher] = await pool.query(
        `SELECT uv.VoucherID, p.DiscountPercent
         FROM UserVouchers uv 
         JOIN Promotions p ON uv.PromotionID = p.PromotionID
         WHERE uv.UserID = ? AND p.Code = ? AND uv.IsUsed = 0`,
        [req.user.UserID, promoCode]
    );
    if (!voucher.length) {
        return res.status(400).json({ message: 'Invalid or already used code' });
    }
    discount = voucher[0].DiscountPercent;
    // Mark as used after order is created
    await pool.query('UPDATE UserVouchers SET IsUsed = 1 WHERE VoucherID = ?', 
        [voucher[0].VoucherID]);
}
```

---

# CHAPTER 5: SUMMARY AND CONCLUSION

## 5.1 Summary of Main Findings

This project successfully achieved all five stated objectives:

1. A full-stack e-commerce platform was designed and developed, consisting of a **Node.js Express REST API** (13 endpoint groups), a **React-based customer web application**, and a **React-based administrator dashboard** with role-based access control for three admin levels.

2. An **Android mobile application** was built using React Native 0.84.1 with a Hybrid WebView architecture, successfully embedding the web frontend within a native Android shell. The application communicates with the backend via ADB Reverse Tunnel, enabling reliable local development connectivity.

3. The **three-tier role-based access control system** was implemented, with Admin Level 1 (full access), Admin Level 2 (product and promotion management), and Admin Level 3 (order processing), all automatically provisioned on server startup.

4. An **automated order management workflow** was implemented, integrating Nodemailer for asynchronous email notifications delivered to both customers and administrators upon order placement and status changes.

5. A **personalized one-time VIP promotional code system** was implemented using the `UserVouchers` table, linking specific promotional codes to individual user accounts with single-use validation enforced at the database level.

## 5.2 Discussion and Implications

The Hybrid WebView architecture adopted in this project demonstrates that a high-quality mobile experience can be achieved without developing a separate mobile interface from scratch. This approach significantly reduces development time and maintenance overhead, as any updates to the web frontend are automatically reflected in the mobile application without requiring a new APK release.

The role-based access control system reflects real-world enterprise requirements where different operational roles require different levels of system access. The automated provisioning of admin accounts on server startup ensures system resilience without relying on manual database seeding.

## 5.3 Limitations of the System

1. **Android Only:** The mobile application targets Android exclusively. iOS deployment would require additional configuration and a macOS development environment with Xcode.
2. **Local Development Environment:** The system is tested only in a local development environment. Production deployment on a cloud server would require additional configurations (HTTPS, environment variables, CI/CD pipeline).
3. **No Real Payment Gateway:** The current implementation simulates online payment without integration with actual payment providers such as VNPay or PayPal.
4. **Performance in DEV Mode:** The Vite development server serves unoptimised, unminified assets, resulting in slower initial load times in the mobile WebView. A production build would significantly improve performance.

## 5.4 Future Development

1. **iOS Support:** Configure the React Native project to support iOS deployment, enabling cross-platform distribution.
2. **Cloud Deployment:** Deploy the backend on a cloud provider (AWS, Google Cloud, or Heroku) and the frontend on a CDN-enabled static host (Vercel, Netlify).
3. **Payment Gateway Integration:** Integrate VNPay or Stripe for real-world payment processing.
4. **Push Notifications:** Replace email notifications with FCM (Firebase Cloud Messaging) push notifications for real-time order updates on mobile.
5. **Product Reviews with Images:** Extend the review system to support image attachments for product reviews.

---

## REFERENCES

*(Sử dụng định dạng APA. Cần tối thiểu 10 nguồn tham khảo — sách, journal, website)*

1. Fielding, R. T. (2000). *Architectural styles and the design of network-based software architectures* (Doctoral dissertation). University of California, Irvine.

2. Turban, E., Outland, J., King, D., Lee, J. K., Liang, T. P., & Turban, D. C. (2018). *Electronic Commerce 2018: A Managerial and Social Networks Perspective* (9th ed.). Springer.

3. React Native Documentation. (2024). *React Native — Learn once, write anywhere.* https://reactnative.dev/docs/getting-started

4. Mozilla Developer Network. (2024). *HTTP Overview.* https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview

5. Open University Malaysia. (2022). *Final Year Project Handbook — International Edition V1.* Faculty of Technology and Applied Sciences.

6. Statista. (2024). *Global e-commerce revenue forecast 2024-2029.* https://www.statista.com/forecasts/1286699/global-e-commerce-sales

7. Osmani, A. (2017). *Learning JavaScript Design Patterns* (2nd ed.). O'Reilly Media.

8. Auth0. (2023). *JSON Web Tokens Introduction.* https://jwt.io/introduction

9. MySQL Documentation. (2024). *MySQL 8.0 Reference Manual.* https://dev.mysql.com/doc/

10. Google. (2024). *Android Developer Guide — WebView.* https://developer.android.com/develop/ui/views/layout/webapps/webview

---

## APPENDICES

### Appendix A — Project Registration Form
*(Đính kèm form đã điền và ký)*

### Appendix B — Student Log Book
*(Đính kèm log book với chữ ký supervisor từng buổi học)*

### Appendix C — System Screenshots (Full Collection)
*(Đính kèm toàn bộ screenshots của hệ thống)*

### Appendix D — Source Code Repository
**GitHub URL:** https://github.com/TungVuk4/Final-Project

---

---

# 📌 HƯỚNG DẪN SỬ DỤNG FILE NÀY

## Những phần BẮT BUỘC phải điền đầy đủ trước khi nộp:

| Mục | Việc cần làm |
|-----|-------------|
| Abstract | Viết lại bằng từ của bạn, đảm bảo ≤ 250 từ, single spacing |
| Literature Review (Ch. 2) | Viết 6-10 trang, cite tối thiểu 8-10 nguồn học thuật |
| Diagrams (Ch. 3) | Chèn ảnh ERD, DFD, Use Case, System Architecture thực tế |
| Screenshots (Ch. 4) | Chèn screenshots thực tế từ hệ thống đang chạy |
| References | Bổ sung thêm ít nhất 5-8 nguồn học thuật từ Google Scholar |
| Tên sinh viên | Điền tên, mã số, tên supervisor thực tế |

## Điểm số theo Rubric A (Handbook trang 32-35):

| Dimension | Weight | Max Score |
|-----------|--------|-----------|
| Introduction | x2.5 | 10 |
| Literature Review | x2.5 | 10 |
| System Analysis & Design | x5 | 20 |
| System Implementation & Testing | x10 | 40 |
| Summary & Conclusion | x2.5 | 10 |
| Writing Style & Language | x1.25 | 5 |
| Overall Presentation | x1.25 | 5 |
| **TOTAL** | | **100** |

> **Lưu ý:** Chapter 4 — System Implementation & Testing chiếm tới **40/100 điểm** → đây là chương quan trọng nhất, cần đầu tư ảnh chụp màn hình, test cases, và code thực tế nhiều nhất!
