# Database Schema — EduManage

## Overview

EduManage uses **PostgreSQL** with **TypeORM** (`synchronize: true` for development).  
All tables are auto-created on first server start.

## Tables

### `users`
Stores all system accounts — admin, teacher, and student logins.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO | Primary key |
| `name` | VARCHAR | NOT NULL | Display name |
| `email` | VARCHAR | UNIQUE, NOT NULL | Login email |
| `password` | VARCHAR | NOT NULL | bcrypt hash |
| `role` | ENUM | NOT NULL, DEFAULT 'teacher' | admin / teacher / student |
| `studentId` | INT | NULLABLE | Links to students.id for student accounts |
| `created_at` | TIMESTAMP | AUTO | Account creation time |

---

### `students`
Academic records for enrolled students.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO | Primary key |
| `name` | VARCHAR | NOT NULL | Full name |
| `email` | VARCHAR | UNIQUE, NOT NULL | Contact email |
| `age` | INT | NOT NULL | Age |
| `department` | VARCHAR | NOT NULL | Academic department |
| `phone` | VARCHAR | NULLABLE | Phone number |
| `city` | VARCHAR | NULLABLE | City of residence |
| `created_at` | TIMESTAMP | AUTO | Registration date |

---

### `courses`
Course catalogue managed by admin/teachers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO | Primary key |
| `course_code` | VARCHAR | NOT NULL | Short code (e.g. CS301) |
| `course_name` | VARCHAR | NOT NULL | Full title |
| `department` | VARCHAR | NOT NULL | Owning department |
| `description` | TEXT | NULLABLE | Course description |
| `instructor` | VARCHAR | NOT NULL | Instructor name |
| `is_active` | BOOLEAN | DEFAULT true | Active/archived flag |
| `created_at` | TIMESTAMP | AUTO | Creation date |

---

### `enrollments`
Many-to-many junction: students ↔ courses with status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO | Primary key |
| `student_id` | INT | FK → students.id | Enrolled student |
| `course_id` | INT | FK → courses.id | Target course |
| `status` | ENUM | DEFAULT 'active' | active / completed / dropped |
| `enrolled_at` | TIMESTAMP | AUTO | Enrollment date |

---

### `attendance`
Per-session attendance records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO | Primary key |
| `student_id` | INT | FK → students.id | Student |
| `course_id` | INT | FK → courses.id | Course session |
| `teacher_id` | INT | FK → users.id | Teacher who marked |
| `date` | DATE | NOT NULL | Session date |
| `status` | ENUM | NOT NULL | present / absent / late |
| `created_at` | TIMESTAMP | AUTO | Record created |

---

### `marks`
Examination marks with auto-calculated grades.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO | Primary key |
| `student_id` | INT | FK → students.id | Student |
| `course_id` | INT | FK → courses.id | Course |
| `teacher_id` | INT | FK → users.id | Teacher who entered |
| `exam_type` | VARCHAR | NOT NULL | Midterm / Final / Assignment etc. |
| `marks_obtained` | FLOAT | NOT NULL | Score achieved |
| `max_marks` | FLOAT | NOT NULL | Maximum possible score |
| `grade` | VARCHAR | NOT NULL | Auto-calculated: A+/A/B/C/D/F |
| `created_at` | TIMESTAMP | AUTO | Entry date |

---

### `logs`
Immutable audit trail for all system actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO | Primary key |
| `user_id` | INT | FK → users.id, NULLABLE | Actor (null for system) |
| `action` | VARCHAR | NOT NULL | Human-readable description |
| `module` | VARCHAR | NOT NULL | Source module name |
| `status` | ENUM | DEFAULT 'success' | success / error |
| `timestamp` | TIMESTAMP | AUTO | When it happened |

## Entity Relationship Diagram (ERD)

```
users ──────────────────────────────────────────────────┐
  │ (studentId → students.id)                           │
  │                                                     │
students ──── enrollments ──── courses                  │
    │               │               │                   │
    └── attendance ─┘               │                   │
    │       └── teacher_id ─────────┤                   │
    └── marks ──── course_id ───────┘                   │
            └── teacher_id ─────────────────────────────┘
                                                        │
logs ── user_id ────────────────────────────────────────┘
```
