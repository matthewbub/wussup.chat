# Upload receipt flow

testing the receipt upload process:

1. **Navigate to the dashboard page.**
2. **Upload a Receipt Image:**
   - Click the "Upload Image" button.
   - Select a valid receipt image file.
   - Click the "Upload" button.
3. **Verify Upload Outcome:**
   - Verify the receipt image is displayed.
   - Verify the receipt details (Merchant, Date, Total, Items) are parsed and displayed correctly.
4. **Confirm Receipt Details:**
   - Edit any incorrect details in the form.
   - Click the "Next" button.
5. **Save Receipt:**
   - Verify the receipt details are displayed in a table view.
   - Click the "Save" button.
6. **Verify Save Outcome:**
   - Verify the receipt is saved successfully and displayed in the receipts list.

**Additional Test Cases:**

- **Missing Image File:**
  - Try submitting the form without selecting an image file.
- **Invalid Image Formats:**
  - Test with invalid image formats (e.g., non-image files).
- **Large Image File:**
  - Test with a large image file to check for upload limits.
- **Incomplete Receipt Details:**
  - Verify handling of incomplete or partially parsed receipt details.
- **Duplicate Receipts:**
  - Attempt to upload the same receipt image multiple times.
- **Network Issues:**
  - Simulate network issues during upload and verify error handling.
- **Session Expiry:**
  - Test the behavior when the user session expires during the upload process.
- **Form Validation:**
  - Verify form validation for required fields and correct formats.
- **Back Button:**
  - Test the "Back" button functionality during the confirmation step.
- **Receipt List:**
  - Verify the newly uploaded receipt appears in the receipts list.
