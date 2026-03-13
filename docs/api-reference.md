# API Reference — EduManage

Base URL: `http://localhost:3000`  
Global prefix: `/api`  
Auth: JWT in HTTP-only cookie `token`

---

## Auth

### POST /auth/login
Login and receive JWT cookie.

**Body:**
```json
{ "email": "admin@edumanage.edu", "password": "admin123" }
```
**Response:** Redirects to `/api/dashboard` with `Set-Cookie: token=<jwt>`

---

### POST /auth/register
Create a new admin or teacher account. *(Admin only)*

**Body:**
```json
{ "name": "Jane Smith", "email": "jane@school.edu", "password": "pass123", "role": "teacher" }
```

---

### GET /api/logout
Clears the JWT cookie and redirects to login portal.

---

## Students

### GET /api/students
Returns paginated student list.

**Query params:** `?search=deva&page=1`

---

### POST /api/students/add
Create a new student. Also fires webhook if `WEBHOOK_URL` is set.

**Body (form):**
```
name, email, age, department, phone, city
```

---

### GET /api/students/:id
Student profile with enrollments, attendance summary, and marks.

---

### POST /api/students/:id/edit
Update student fields.

---

### POST /api/students/:id/delete
Permanently delete student. *(Admin only)*

---

## Courses

### GET /api/courses
Course list with enrolled count and stats.

**Query params:** `?search=cs&page=1`

---

### POST /api/courses/add
**Body (form):**
```
course_code, course_name, department, description, instructor, is_active
```

---

## Enrollment

### POST /api/enrollment
Enroll a student in a course. Prevents duplicates.

**Body (form):**
```
student_id, course_id
```

---

### POST /api/enrollment/:id/status
Update enrollment status.

**Body (form):** `status = active | completed | dropped`

---

## Attendance

### POST /api/attendance/mark
Mark attendance for a student.

**Body (form):**
```
student_id, course_id, date, status (present|absent|late)
```

If attendance already exists for that student+course+date, it updates instead of creating a duplicate.

---

## Marks

### POST /api/marks/add
Add marks. Grade is calculated automatically.

**Body (form):**
```
student_id, course_id, exam_type, marks_obtained, max_marks
```

**Grade formula:** `(marks_obtained / max_marks) * 100` → A+/A/B/C/D/F

---

## Logs

### GET /api/logs
Paginated audit log.

**Query params:** `?page=1&module=Students&status=success&search=deva&dateFrom=2026-01-01&dateTo=2026-12-31`

---

## Settings

### POST /api/settings/profile
Update display name.

**Body (form):** `name`

---

### POST /api/settings/password
Change password.

**Body (form):** `current_password, new_password, confirm_password`

Returns error if `current_password` does not match stored bcrypt hash.

---

## Student Portal

### GET /api/student-portal
Student's own dashboard. Requires role = `student`.

### GET /api/student-portal/marks
Student's own marks list.

### GET /api/student-portal/attendance
Student's own attendance records.

### POST /api/student-portal/password
Student password change — same validation as settings.
