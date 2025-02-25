// Email template component
interface EmailTemplateProps {
  email: string;
  category: string;
  subject: string;
  message: string;
  userId?: string;
}

function EmailTemplate({ email, category, subject, message, userId }: EmailTemplateProps) {
  return (
    <div>
      <h1>New Support Request</h1>
      <p>
        <strong>From:</strong> {email} {userId ? `(User ID: ${userId})` : "(Anonymous)"}
      </p>
      <p>
        <strong>Category:</strong> {category}
      </p>
      <p>
        <strong>Subject:</strong> {subject}
      </p>
      <div>
        <strong>Message:</strong>
        <p style={{ whiteSpace: "pre-wrap" }}>{message}</p>
      </div>
    </div>
  );
}

// Confirmation email template for users
interface ConfirmationEmailProps {
  email: string;
  category: string;
  subject: string;
}

function ConfirmationEmail({ email, category, subject }: ConfirmationEmailProps) {
  return (
    <div>
      <h1>Support Request Received</h1>
      <p>Hello,</p>
      <p>
        We have received your support request and our team will review it shortly. Here are the details of your request:
      </p>
      <p>
        <strong>Email:</strong> {email}
      </p>
      <p>
        <strong>Category:</strong> {category}
      </p>
      <p>
        <strong>Subject:</strong> {subject}
      </p>
      <p>We aim to respond to all support requests within 24-48 hours.</p>
      <p>Thank you for your patience.</p>
      <p>Best regards,</p>
      <p>The Wussup Support Team</p>
    </div>
  );
}

export { EmailTemplate, ConfirmationEmail };
