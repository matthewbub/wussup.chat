import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VerifyAccountEmailProps {
  verificationUrl: string;
}

export const VerifyAccountEmail = ({
  verificationUrl,
}: VerifyAccountEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email address</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={paragraph}>Welcome!</Text>
          <Hr style={hr} />
          <Text style={paragraph}>
            Thanks for signing up. To complete your registration and verify your
            email address, please click the button below:
          </Text>
          <Button style={button} href={verificationUrl}>
            Verify Email Address
          </Button>
          <Text style={paragraph}>
            This verification link will expire in 24 hours. If you did not
            create an account, you can safely ignore this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you're having trouble clicking the button, copy and paste this
            URL into your browser: {verificationUrl}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default VerifyAccountEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const button = {
  backgroundColor: "#656ee8",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "10px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};
