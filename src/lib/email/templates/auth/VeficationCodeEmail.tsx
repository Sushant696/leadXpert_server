import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { emailTheme } from "../theme";

const t = emailTheme;

interface VerificationCodeEmailProps {
  userName: string;
  code: string;
}

export const VerificationCodeEmail = ({
  userName,
  code,
}: VerificationCodeEmailProps) => {
  const firstName = userName.split(" ")[0];

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your verification code is {code}</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logoText}>LeadXpert</Text>
          </Section>

          {/* Main Card */}
          <Section style={styles.mainCard}>

            <Heading style={styles.heading}>Verify your email</Heading>

            <Text style={styles.bodyText}>
              Hi {firstName},
            </Text>

            <Text style={styles.bodyText}>
              Thanks for signing up for LeadXpert! To verify your email address,
              please enter this verification code in the app:
            </Text>

            <Section style={styles.codeBox}>
              <Text style={styles.code}>{code}</Text>
            </Section>

            <Text style={styles.expiryText}>
              This code will expire in 24 hours.
            </Text>

            <Text style={styles.footerText}>
              If you didn't request this code, you can safely ignore this email.
            </Text>

          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerBrand}>LeadXpert</Text>
            <Text style={styles.footerAddress}>
              &copy {new Date().getFullYear()} LeadXpert · Kathmandu, Nepal
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

export default VerificationCodeEmail;

// Styles
const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: t.colors.neutral[100],
    fontFamily: t.typography.fontFamily.base,
    margin: "0",
    padding: "0",
  },

  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "40px 16px",
  },

  header: {
    textAlign: "center" as const,
    marginBottom: "32px",
  },

  logoText: {
    color: t.colors.primary.main,
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    margin: "0",
  },

  mainCard: {
    backgroundColor: t.colors.background.main,
    border: `1px solid ${t.colors.neutral[200]}`,
    borderRadius: "12px",
    padding: "40px",
  },

  heading: {
    color: t.colors.text.primary,
    fontSize: "28px",
    fontWeight: "700",
    lineHeight: "1.2",
    margin: "0 0 24px",
    textAlign: "center" as const,
  },

  bodyText: {
    color: t.colors.text.secondary,
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0 0 20px",
  },

  codeBox: {
    backgroundColor: t.colors.neutral[50],
    border: `2px solid ${t.colors.primary.main}`,
    borderRadius: "12px",
    margin: "32px 0",
    padding: "24px",
    textAlign: "center" as const,
  },

  code: {
    color: t.colors.primary.main,
    fontSize: "42px",
    fontWeight: "700",
    letterSpacing: "8px",
    margin: "0",
    fontFamily: "monospace",
  },

  expiryText: {
    color: t.colors.text.muted,
    fontSize: "14px",
    margin: "0 0 24px",
    textAlign: "center" as const,
  },

  footerText: {
    color: t.colors.text.muted,
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0",
  },

  footer: {
    marginTop: "40px",
    textAlign: "center" as const,
  },

  footerBrand: {
    color: t.colors.text.primary,
    fontSize: "16px",
    fontWeight: "700",
    margin: "0 0 8px",
  },

  footerAddress: {
    color: t.colors.text.muted,
    fontSize: "12px",
    margin: "0",
  },
};
