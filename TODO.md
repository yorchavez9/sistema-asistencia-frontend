# Task: Fix professor login redirect to attendance module

## Plan Steps:
- [x] 1. Update src/pages/auth/LoginPage.jsx: Improve teacher detection using permissions instead of role names.
- [ ] 2. Test the login flow.
- [ ] 3. Verify redirect works for profesor role.

Current progress: Step 1 completed. LoginPage.jsx updated to use hasPermission("asistencia.registrar") for redirect to /attendance.
