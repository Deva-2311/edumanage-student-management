<div align="center">

# 🎓 EduManage

### Student Management System

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-≥18-339933?style=flat-square&logo=nodedotjs" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
  <img src="https://img.shields.io/badge/Status-Production Ready-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/Roles-Admin%20%7C%20Teacher%20%7C%20Student-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/API%20Endpoints-37-orange?style=flat-square" />
</p>

<p align="center">
  A full-stack academic management platform built with <strong>NestJS</strong> and <strong>PostgreSQL</strong>.<br/>
  Manage students, courses, attendance, marks, and analytics — all in one place.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-endpoints">API</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

![EduManage Dashboard](docs/screenshots/dashboard-preview.png)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Module Structure](#-module-structure)
- [Database Schema](#-database-schema)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Postman Collection](#-postman-collection)
- [Grade Calculation](#-grade-calculation)
- [Roles & Permissions](#-roles--permissions)
- [Future Improvements](#-future-improvements)
- [Author](#-author)
- [License](#-license)

---

## 🌟 Overview

**EduManage** is a production-ready Student Management System developed as a capstone project during the **Smackcoders Internship (2026)**. It provides a complete academic administration platform with three distinct user portals: **Admin**, **Teacher**, and **Student**.

The system handles the full academic lifecycle — from student registration and course management through enrollment, daily attendance tracking, examination marks entry with automatic grade calculation, and a real-time activity audit log. All actions are secured with JWT authentication and role-based access control.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based login with secure HTTP-only cookie sessions
- Three distinct role portals: **Admin**, **Teacher**, **Student**
- bcrypt password hashing (10 salt rounds)
- Role-based route guards on every protected endpoint
- Password reset and change functionality

### 👨‍🎓 Student Management
- Full CRUD with search, pagination, and department filtering
- Detailed student profiles showing enrollments, attendance, and marks
- Webhook integration (n8n / Zapier) triggered on student creation
- Student self-service portal (view own marks, attendance, change password)

### 📚 Course Management
- Create and manage courses with department, instructor, and course code
- Active/Inactive status toggle
- Real-time enrolled student count per course

### 📋 Enrollment System
- Assign students to courses via modal UI
- Status lifecycle: **Active → Completed → Dropped**
- Duplicate enrollment prevention
- Enrollment statistics dashboard

### 📅 Attendance Tracking
- Mark attendance: **Present**, **Absent**, **Late**
- Filter by student, course, or date
- Inline status correction
- Attendance rate percentage stats

### 📊 Marks Management
- Record marks by exam type: Midterm, Final, Assignment, Quiz, Lab, Project
- **Automatic grade calculation** (A+ through F) — live preview while entering marks
- Grade distribution visualization
- Edit and delete with automatic grade recalculation

### 📈 Dashboard Analytics
- Real-time stats: total students, courses, enrollments, attendance rate
- Enrollment trend line chart (Chart.js)
- Attendance bar chart
- Recent activity log table

### 🗒️ Activity Logs
- Global audit trail — every CRUD action is automatically logged
- Filter by module, status, user, or date range
- Paginated log viewer (admin-only)

### ⚙️ Settings
- System information dashboard
- User profile update
- Secure password change with current password verification

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js ≥ 18 | JavaScript runtime |
| **Framework** | NestJS + TypeScript | Backend framework with DI |
| **Database** | PostgreSQL | Relational data store |
| **ORM** | TypeORM | Entity management + migrations |
| **Auth** | JWT + Passport.js | Token-based authentication |
| **Hashing** | bcrypt | Secure password hashing |
| **Frontend** | EJS Templating | Server-side rendered views |
| **Styling** | TailwindCSS CDN | Utility-first CSS |
| **Charts** | Chart.js CDN | Dashboard visualizations |
| **Validation** | class-validator + DTOs | Request validation |
| **HTTP Client** | @nestjs/axios | Webhook outbound requests |
| **Session** | cookie-parser | JWT cookie handling |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                       │
│              (EJS Templates + TailwindCSS + Chart.js)       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Requests (Cookie: JWT)
┌──────────────────────────▼──────────────────────────────────┐
│                      NestJS APPLICATION                     │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  JWT Guard  │  │ Roles Guard  │  │  Validation Pipe   │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬──────────┘ │
│         └────────────────┼───────────────────┘             │
│                          │                                  │
│  ┌───────────────────────▼─────────────────────────────┐   │
│  │                    CONTROLLERS                      │   │
│  │  Auth │ Students │ Courses │ Enrollment │ Attendance │   │
│  │  Marks │ Logs │ Dashboard │ Settings │ StudentPortal│   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          │                                  │
│  ┌───────────────────────▼─────────────────────────────┐   │
│  │                     SERVICES                        │   │
│  │   Business Logic │ Grade Calc │ Webhook Trigger     │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          │                                  │
│  ┌───────────────────────▼─────────────────────────────┐   │
│  │               TypeORM REPOSITORIES                  │   │
│  └───────────────────────┬─────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     PostgreSQL DATABASE                     │
│   users │ students │ courses │ enrollments │ attendance     │
│                  marks │ logs                               │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

```
Browser Request
    │
    ▼
cookie-parser  ──► extracts JWT from cookie
    │
    ▼
JwtAuthGuard   ──► validates token, attaches user to req
    │
    ▼
RolesGuard     ──► checks user.role against @Roles() decorator
    │
    ▼
ValidationPipe ──► validates body against DTO class
    │
    ▼
Controller     ──► calls service method
    │
    ▼
Service        ──► business logic, calls repository
    │           └──► LogsService.log() (fire-and-forget)
    ▼
TypeORM Repo   ──► SQL query to PostgreSQL
    │
    ▼
EJS Template   ──► server-side render → HTML response
```

---

## 📁 Module Structure

```
student-management-system/
│
├── src/
│   ├── app.module.ts              # Root module — wires everything
│   ├── main.ts                    # Bootstrap — EJS, cookies, prefix, port
│   │
│   ├── auth/                      # JWT auth, login, registration
│   │   ├── auth.controller.ts     # Login/logout/register routes
│   │   ├── auth.service.ts        # Token generation, password hashing
│   │   ├── auth.module.ts
│   │   ├── user.entity.ts         # User model (admin/teacher/student roles)
│   │   ├── jwt.strategy.ts        # Passport JWT strategy
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts  # Protects all private routes
│   │       ├── roles.guard.ts     # Role-based access control
│   │       └── roles.decorator.ts # @Roles() decorator
│   │
│   ├── dashboard/                 # Analytics & stats
│   ├── students/                  # Student CRUD + Student Portal
│   │   ├── student.controller.ts  # Admin/Teacher student management
│   │   ├── student-portal.controller.ts  # Student self-service
│   │   ├── student.service.ts
│   │   └── student.entity.ts
│   │
│   ├── courses/                   # Course management
│   ├── enrollment/                # Student-course enrollment
│   ├── attendance/                # Attendance tracking
│   ├── marks/                     # Marks + auto grade calculation
│   ├── logs/                      # Global audit logging (exported service)
│   └── settings/                  # Profile + system settings
│
├── views/                         # EJS templates (server-side rendered)
│   ├── partials/sidebar.ejs       # Shared navigation sidebar
│   ├── auth/                      # portal, login-admin, login-teacher
│   ├── dashboard/index.ejs
│   ├── students/                  # index, add, edit, profile
│   ├── courses/                   # index, add, edit
│   ├── enrollment/index.ejs
│   ├── attendance/                # index, mark
│   ├── marks/                     # index, add, edit
│   ├── logs/index.ejs
│   ├── settings/                  # system, profile
│   ├── student-portal/            # dashboard, marks, attendance, password
│   └── admin/users.ejs
│
├── public/                        # Static assets (css, js, images)
├── postman/                       # EduManage.postman_collection.json
├── docs/                          # Architecture, API reference, DB schema
├── database/scripts/              # Seed scripts
├── .env.example                   # Environment variable template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄 Database Schema

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│    users     │       │   students   │       │    courses       │
├──────────────┤       ├──────────────┤       ├──────────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)          │
│ name         │       │ name         │       │ course_code      │
│ email        │       │ email        │       │ course_name      │
│ password     │       │ age          │       │ department       │
│ role         │       │ department   │       │ description      │
│ studentId    │       │ phone        │       │ instructor       │
│ created_at   │       │ city         │       │ is_active        │
└──────┬───────┘       │ created_at   │       │ created_at       │
       │               └──────┬───────┘       └────────┬─────────┘
       │                      │                         │
       │         ┌────────────┼─────────────────────────┤
       │         │            │                         │
       │    ┌────▼────────────▼──┐    ┌─────────────────▼──────┐
       │    │    enrollments     │    │      attendance         │
       │    ├────────────────────┤    ├────────────────────────┤
       │    │ id (PK)            │    │ id (PK)                │
       │    │ student_id (FK)    │    │ student_id (FK)        │
       │    │ course_id (FK)     │    │ course_id (FK)         │
       │    │ status             │    │ teacher_id (FK)        │
       │    │ enrolled_at        │    │ date                   │
       │    └────────────────────┘    │ status                 │
       │                             │ created_at             │
       │                             └────────────────────────┘
       │
       │    ┌────────────────────┐    ┌────────────────────────┐
       │    │       marks        │    │         logs           │
       │    ├────────────────────┤    ├────────────────────────┤
       │    │ id (PK)            │    │ id (PK)                │
       │    │ student_id (FK)    │    │ user_id (FK) ──────────┘
       │    │ course_id (FK)     │    │ action                 │
       │    │ teacher_id (FK)    │    │ module                 │
       │    │ exam_type          │    │ status                 │
       │    │ marks_obtained     │    │ timestamp              │
       │    │ max_marks          │    └────────────────────────┘
       │    │ grade              │
       │    └────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **PostgreSQL** ≥ 13.x

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/edumanage-student-management.git
cd edumanage-student-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials (see [Environment Variables](#-environment-variables)).

### 4. Create the database

```sql
-- Run in psql or pgAdmin
CREATE DATABASE edumanage;
```

> Tables are **auto-created** by TypeORM on first run (`synchronize: true`).

### 5. Seed the admin user

```bash
npm run seed
```

This creates the default admin account:
| Field | Value |
|-------|-------|
| Email | `admin@edumanage.edu` |
| Password | `admin123` |
| Role | `admin` |

### 6. Start the server

```bash
# Development (with hot reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 7. Open in browser

```
http://localhost:3000
```

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# ── Database ──────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=edumanage

# ── JWT ───────────────────────────────────
JWT_SECRET=your_super_secret_key_minimum_32_chars
JWT_EXPIRES=1d

# ── Server ────────────────────────────────
PORT=3000

# ── Webhooks (optional) ───────────────────
# Triggered on new student creation
WEBHOOK_URL=https://your-n8n-or-zapier-webhook-url
```

---

## 🌐 API Endpoints

> All routes are prefixed with `/api`. JWT cookie required for all protected routes.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/login` | Public | Portal selection page |
| `GET` | `/api/login/admin` | Public | Admin login page |
| `GET` | `/api/login/teacher` | Public | Teacher login page |
| `POST` | `/auth/login` | Public | Login → sets JWT cookie |
| `POST` | `/auth/register` | Admin | Register new user |
| `GET` | `/api/logout` | Auth | Clear session |

### Students

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/students` | Auth | List + search + paginate |
| `GET` | `/api/students/add` | Admin/Teacher | Add student form |
| `POST` | `/api/students/add` | Admin/Teacher | Create student + webhook |
| `GET` | `/api/students/:id` | Auth | Student profile |
| `GET` | `/api/students/:id/edit` | Admin/Teacher | Edit form |
| `POST` | `/api/students/:id/edit` | Admin/Teacher | Update student |
| `POST` | `/api/students/:id/delete` | Admin | Delete student |

### Courses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/courses` | Auth | Course list |
| `POST` | `/api/courses/add` | Admin | Create course |
| `POST` | `/api/courses/:id/edit` | Admin/Teacher | Update course |
| `POST` | `/api/courses/:id/delete` | Admin | Delete course |

### Enrollment

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/enrollment` | Auth | Enrollment list |
| `POST` | `/api/enrollment` | Admin/Teacher | Enroll student |
| `POST` | `/api/enrollment/:id/status` | Admin/Teacher | Update status |
| `POST` | `/api/enrollment/:id/delete` | Admin | Remove enrollment |

### Attendance

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/attendance` | Auth | Attendance list + filter |
| `GET` | `/api/attendance/mark` | Teacher | Mark attendance form |
| `POST` | `/api/attendance/mark` | Teacher | Submit attendance |
| `POST` | `/api/attendance/:id/status` | Teacher | Update status |

### Marks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/marks` | Auth | Marks + grade distribution |
| `GET` | `/api/marks/add` | Teacher | Add marks form |
| `POST` | `/api/marks/add` | Teacher | Save marks (auto-grades) |
| `GET` | `/api/marks/:id/edit` | Teacher | Edit form |
| `POST` | `/api/marks/:id/edit` | Teacher | Update marks + grade |
| `POST` | `/api/marks/:id/delete` | Admin/Teacher | Delete record |

### Logs, Settings & Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/dashboard` | Auth | Stats + charts |
| `GET` | `/api/logs` | Admin | Audit trail + filters |
| `GET` | `/api/settings/profile` | Auth | Profile page |
| `POST` | `/api/settings/profile` | Auth | Update name |
| `POST` | `/api/settings/password` | Auth | Change password |

### Student Portal

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/student-portal` | Student | Student dashboard |
| `GET` | `/api/student-portal/marks` | Student | Own marks |
| `GET` | `/api/student-portal/attendance` | Student | Own attendance |
| `POST` | `/api/student-portal/password` | Student | Change password |

---

## 📬 Postman Collection

Import the full API collection into Postman for instant testing:

```
postman/EduManage.postman_collection.json
```

**Steps:**
1. Open Postman → **Import** → select the `.json` file
2. Set environment variable: `baseUrl = http://localhost:3000`
3. Run **Auth → Login** first to set the JWT cookie
4. All other requests are pre-configured and ready to run

---

## 🎓 Grade Calculation

Grades are calculated **automatically** from marks percentage. A live preview updates as you type.

| Percentage | Grade | Description |
|------------|-------|-------------|
| 90 – 100 | **A+** | Outstanding |
| 80 – 89 | **A** | Excellent |
| 70 – 79 | **B** | Good |
| 60 – 69 | **C** | Average |
| 50 – 59 | **D** | Below Average |
| < 50 | **F** | Fail |

---

## 👥 Roles & Permissions

| Action | Admin | Teacher | Student |
|--------|:-----:|:-------:|:-------:|
| View dashboard | ✅ | ✅ | — |
| Manage students (CRUD) | ✅ | ✅ | — |
| Manage courses | ✅ | ✅ | — |
| Enroll students | ✅ | ✅ | — |
| Mark attendance | ✅ | ✅ | — |
| Add/edit marks | ✅ | ✅ | — |
| Delete records | ✅ | — | — |
| View activity logs | ✅ | — | — |
| Register new users | ✅ | — | — |
| View own marks/attendance | — | — | ✅ |
| Student portal | — | — | ✅ |

---

## 🔮 Future Improvements

### Version 2 Roadmap

- [ ] **Email Notifications** — Send automated emails on enrollment, low attendance alerts, and marks published using Nodemailer or SendGrid
- [ ] **n8n Automation Workflows** — Full workflow: new student → Google Sheet log → welcome email → Slack notification
- [ ] **PDF Report Generation** — Export student transcripts, attendance reports, and course summaries using Puppeteer or PDFKit
- [ ] **REST API Mode** — Add `Accept: application/json` support alongside EJS rendering for mobile app consumption
- [ ] **Advanced Analytics** — Department-level performance heatmaps, attendance trend prediction
- [ ] **File Uploads** — Student photo upload, bulk import via CSV
- [ ] **Docker Support** — `docker-compose.yml` for one-command deployment
- [ ] **End-to-End Tests** — Playwright/Cypress test suite for critical flows
- [ ] **Redis Caching** — Cache dashboard stats to reduce DB load
- [ ] **Swagger API Docs** — Auto-generated interactive API documentation via `@nestjs/swagger`

---

## 👨‍💻 Author

**Devprasath (Deva)**

Smackcoders Internship Capstone — 2026

> Built from scratch during a backend engineering internship — covering full-stack NestJS architecture, relational database design, JWT authentication, role-based access control, and server-side rendering.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ using NestJS + PostgreSQL</sub>
</div>
