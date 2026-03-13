# Architecture Overview — EduManage

## System Architecture

EduManage follows a layered **MVC-inspired** architecture built on NestJS's module system. Each feature is encapsulated in its own module with a Controller, Service, and Entity.

```
Browser (EJS + TailwindCSS + Chart.js)
    │
    ▼ HTTP (Cookie: JWT)
NestJS App (api/ prefix)
    ├── Global Middleware: cookie-parser, ValidationPipe
    ├── Guards: JwtAuthGuard → RolesGuard
    ├── Controllers (route handling + EJS render)
    ├── Services (business logic)
    ├── Repositories (TypeORM)
    └── PostgreSQL
```

## Module Dependency Map

```
AppModule
├── ConfigModule (global)
├── TypeOrmModule (global DB connection)
├── LogsModule (global — exported LogsService)
├── AuthModule
│   └── uses: User entity
├── DashboardModule
│   └── uses: Student, Course, Enrollment, Attendance, Log repos
├── StudentModule
│   ├── exports: StudentService
│   ├── uses: Student, Enrollment, Attendance, Mark entities
│   └── StudentPortalController (student self-service)
├── CourseModule
│   └── uses: Course, Enrollment entities
├── EnrollmentModule
│   └── uses: Enrollment, Student, Course entities
├── AttendanceModule
│   └── uses: Attendance, Student, Course entities
├── MarksModule
│   └── uses: Mark, Student, Course entities
└── SettingsModule
    └── uses: User entity
```

## Authentication Flow

```
1. User submits login form (POST /auth/login)
2. AuthService.login():
   a. Find user by email in DB
   b. bcrypt.compare(plainPassword, hashedPassword)
   c. If valid → JwtService.sign({ id, email, name, role })
3. JWT stored in HTTP-only cookie (key: "token")
4. All subsequent requests:
   a. cookie-parser extracts token
   b. JwtAuthGuard calls JwtStrategy.validate()
   c. Decoded user attached to req.user
   d. RolesGuard checks req.user.role vs @Roles() decorator
```

## Grade Calculation Logic

```typescript
calculateGrade(marks: number, max: number): string {
  const percentage = (marks / max) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}
```

Called in `MarksService.create()` and `MarksService.update()` — the grade field is always computed, never manually entered.

## Audit Logging Pattern

`LogsModule` exports `LogsService` as a global injectable. Any service can inject it and fire log entries non-blocking:

```typescript
// Fire-and-forget — never throws, never blocks
await this.logsService.log(user, 'Created student: Deva', 'Students', 'success');
```

Errors in log writing are silently caught so they never crash the main request flow.

## Webhook Integration

When a new student is created (`StudentService.create()`), if `WEBHOOK_URL` is set in `.env`, the service fires a POST request via `@nestjs/axios` with the student payload. This triggers n8n or Zapier automation workflows.
