# TIC Club - Coordinator Data Management System
**Phase 1 – Foundation & Planning Requirement Document**

## 1. Project Overview
The **TIC Club Data Management System** is a platform designed to provide an interface for managing students, teams, events, and attendance while utilizing automated background processes to handle repetitive tasks such as certificate generation, analytics reporting, and email notifications.

## 2. Technology Stack & Resources
Based on the requirements and the existing `pom.xml`, following is the definitive technology stack:

### Backend (Core Application & API)
*   **Java 17**
*   **Spring Boot Framework (v3.5.x)**
*   **Spring Data JPA** (Hibernate) for Object-Relational Mapping.
*   **Spring Security** for securing endpoints.
*   **Spring Mail** for email automation.
*   **Spring Cloud Gateway** for potential API routing services.
*   **Lombok** to minimize boilerplate code.

### Frontend
*   **HTML 5 & Native CSS**
*   **JavaScript (Vanilla)** for interactivity, fetching APIs, and rendering charts.

### Database
*   **PostgreSQL**: Selected as the primary relational database for production-grade reliability, data integrity, and complex query support (Note: Overrrides the image's SQLite architecture as requested).

---

## 3. Module Definitions

### A. Core Management Modules
These modules make up the standard CRUD (Create, Read, Update, Delete) entities of the Spring Boot application:
1.  **Coordinator Management**: Ability to add, edit, remove, and promote club coordinators. Includes managing their responsibilities.
2.  **Student Management**: Master database of all student members within the club.
3.  **Team Management**: Creating project or operational teams and assigning members/coordinators to them.
4.  **Event Management**: Scheduling, modifying, and cataloging club events/workshops.
5.  **Attendance Management**: Tracking participation for events and regular activities via manual inputs or QR codes. 

### B. Automation Layer
Background processes handled by the server without direct user prompting:
1.  **Scheduler**: Cron-based scheduled jobs to run daily maintenance or bulk data processing (e.g., Spring `@Scheduled`).
2.  **Certificate Generation**: Generating digital certificates (e.g., using libraries like iText/Apache PDFBox) for completed events.
3.  **Email Service**: Sending transactional emails (credentials, event reminders, and certificates) using SMTP.
4.  **Reports & Analytics**: Aggregating attendance and performance metrics into consumable data payloads for the admin dashboard.

### C. Security Layer
1.  **JWT Authentication**: Stateless, token-based authentication to secure all REST API endpoints.
2.  **Role-Based Access Control (RBAC)**: Enforcing authorization at the method and URI level to ensure Standard Coordinators, Admins, and Super Admins only access permitted data.

---

## 4. System Data Flow
1.  **User Interaction**: Coordinator accesses the HTML/CSS Admin Dashboard in a web browser.
2.  **Authentication Phase**: Login credentials are submitted via an HTTPS POST request; the Spring Boot Security Layer validates and returns a JWT.
3.  **Dashboard Loads**: Subsequent API calls to the backend include the JWT in the `Authorization: Bearer` header. The frontend requests analytics and module data to populate charts and tables.
4.  **Data Persistence**: Core modules interact with the **PostgreSQL** database through Spring Data JPA interfaces.
5.  **Offline Triggers**: The Automation Layer periodically reads from PostgreSQL (via Scheduler) to automatically emit Emails or prepare PDF Certificates internally.
