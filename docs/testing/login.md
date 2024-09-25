# Login Flow

Testing the user login process:

1. **Navigate to the login page.**
2. **Enter the following details:**
   - **Username:** Enter a valid username.
   - **Password:** Enter the correct password.
3. **Remember Me:**
   - Optionally, check the "Remember me for 30 days" box.
4. **Submit the Form:**
   - Click the "Login" button.
5. **Verify Outcome:**
   - Verify successful login and redirection to the dashboard or home page.
   - Verify session is created and maintained if "Remember me" is checked.

**Additional Test Cases:**

- **Missing Required Fields:**
  - Try submitting without filling all required fields.
- **Invalid Credentials:**
  - Test with incorrect username and/or password.
- **Remember Me Functionality:**
  - Verify the "Remember me" option keeps the user logged in for 30 days.
- **Session Expiry:**
  - Verify session expiry and re-login requirement after the session expires.
- **Forgot Password Link:**
  - Verify the "Forgot password?" link redirects to the password recovery page.
- **SQL Injection:**
  - Test for SQL injection vulnerabilities in the username and password fields.
- **Brute Force Protection:**
  - Verify protection against brute force attacks (e.g., account lockout after multiple failed attempts).
- **Error Messages:**
  - Verify appropriate error messages are displayed for invalid login attempts.
- **UI/UX:**
  - Ensure the login form is user-friendly and responsive on different devices.
- **Security:**
  - Verify secure transmission of credentials (e.g., HTTPS).
- **Existing Session:**
  - Test behavior when trying to access the login page while already logged in.
