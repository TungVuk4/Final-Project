# Detailed Project Outline
## DEVELOPMENT OF A FASHION E-COMMERCE PLATFORM WITH MOBILE APPLICATION

### 1. Introduction
#### 1.1 Background to the Study
- Overview of global e-commerce growth and the fashion industry.
- The shift towards omnichannel platforms (Web + Mobile).
- The need for integrated digital solutions for small and medium-sized fashion retailers.

#### 1.2 Problem Statement
- Challenges faced by current fashion retailers (lack of integrated mobile experience).
- Inefficient order management and manual processing.
- Inadequate inventory control (tracking by size and color).
- Absence of personalized, one-time VIP promotional code systems.

#### 1.3 Objectives of the Study
- To design and develop a full-stack web e-commerce platform (Customer Web + Admin Dashboard).
- To develop an Android mobile application utilizing React Native and WebView to ensure consistent cross-platform experience.
- To implement a multi-tier role-based access control system for administrators.
- To automate real-time order processing with email notifications.
- To construct a personalized, single-use VIP promotional code system.

#### 1.4 Scope and Limitation
- **Scope:** Customer module (shopping, cart, checkout), Admin module (3-tier roles, products, orders, promotions, configurations), Mobile app (Android WebView wrapping).
- **Limitation:** Android-only app, local development deployment, simulated payment gateway (COD predominantly), dual languages (English/Vietnamese).

#### 1.5 Implementation Plan
- Gantt chart or timeline detailing phases: Requirements, Design, Backend, Frontend (Web & Admin), Mobile App, Integration, Testing, Documentation.

---

### 2. System Analysis & Design
#### 2.1 Feasibility Studies
- **Technical Feasibility:** Usage of Node.js, React, React Native, MySQL.
- **Operational Feasibility:** Role-based access managing feature availability.
- **Cost-Benefit Analysis:** Leveraging open-source tools reducing initial capital.

#### 2.2 Requirement Methods
- **Functional Requirements (FR):** Customer profile, browsing, cart, checkout, Guest access, Admin configurations, order statusing.
- **Non-Functional Requirements (NFR):** Response time (<500ms), Mobile responsiveness, JWT token expirations, Multi-language support.

#### 2.3 System Development Methods
- Use of Rapid Application Development (RAD) and elements of SDLC (Requirements -> Prototyping -> Construction -> Testing).

#### 2.4 Data and Process Modelling Diagrams
- **System Architecture Diagram:** Multi-tier with Node.js backend, React frontend, and React Native mobile App.
- **Use Case Diagrams:** Interactions for Customers, Admin 1, Admin 2, Admin 3.
- **Data Flow Diagram (DFD Level 0):** High-level data exchange between User, System, Database, and Admin.

#### 2.5 Database Design
- **Entity-Relationship Diagram (ERD):** Visual map of schemas.
- **Database Schemas:** Tables for Users, Products, Categories, Orders, Promotions, UserVouchers.

#### 2.6 Interface Design
- Wireframes and mockups for Homepage, Product Detail, Cart, Checkout, Admin Dashboard, and Mobile interface.

---

### 3. Tools and Environments for Software Development
#### 3.1 Programming Languages & Frameworks
- **Backend:** Node.js, Express.js (RESTful API, routing, middleware).
- **Frontend (Web):** React 18, Vite (fast compilation, responsive UI).
- **Mobile Development:** React Native 0.84.1 (Hybrid WebView architecture).

#### 3.2 Database Environment
- **Database Management:** MySQL 8.0 (Relational data, ACID properties).

#### 3.3 Development Tools & IDEs
- **Code Editor:** Visual Studio Code.
- **Mobile Emulator:** Android Studio (Ladybug) with ADB Reverse Tunnel.
- **API Testing:** Postman / Insomnia for endpoint validation.
- **Version Control:** Git & GitHub.

#### 3.4 Key Libraries and Integrations
- **Authentication:** JSON Web Tokens (JWT) & bcrypt for password hashing.
- **Email Service:** Nodemailer for automated email notifications.
- **State Management:** Axios for HTTP requests, React Router for navigation.

---

### 4. Implementation & Evaluation
#### 4.1 System Implementation and Installation
- **Environment Setup:** Node.js, MySQL, Android SDK.
- **Backend Configuration:** Environment variables, database connection, JWT secret.
- **Frontend and Admin Deployment:** Running Vite servers locally.
- **Mobile Execution:** Metro Bundler startup and ADB routing.

#### 4.2 Core Features Implementation
- JWT Authentication Middleware integration.
- WebView initialization with Android Back Button handler.
- Promotional Code logic (One-time usage check linked to UserID).
- Automated Email pipeline for Order Statuses.

#### 4.3 System User Guides
- Steps for Customer registration, browsing, cart interactions, checkout.
- Admin portal walk-through: Role-based dashboard overviews, product adding, order processing.

#### 4.4 Testing Plan and Output (Evaluation)
- **Testing Approach:** Black Box Testing.
- **Authentication Module Tests:** Valid login, invalid credentials, role restrictions.
- **Order Module Tests:** Placements, promotional code validations, stock deduction.
- **Mobile App Tests:** WebView rendering, session persistence, hardware button handlers.

---

### 5. Conclusions
#### 5.1 Summary of Main Findings
- Successful delivery of all objectives (REST API, Web portals, Mobile App, RBAC, Automated Emails, Promotions).

#### 5.2 Discussion and Implications
- Effectiveness of Hybrid WebView architecture in reducing development lifecycle.
- Importance of auto-provisioned role-based systems in business administration.

#### 5.3 Limitations of the System
- Platform restrictions (Android only).
- Lack of cloud deployment and actual payment gateway integration.

#### 5.4 Future Development
- Expansion to iOS using React Native.
- Cloud hosting on AWS/Vercel.
- Implementing Firebase Cloud Messaging (FCM) for mobile push notifications.
- Integrating real payment processors (e.g. VNPay, Stripe).
