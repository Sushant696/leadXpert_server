import {
  Body,
  Button,
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

interface PasswordChangedEmailProps {
  userName: string;
  dashboardUrl: string;
}

export const PasswordChangedEmail = ({
  userName,
  dashboardUrl,
}: PasswordChangedEmailProps) => {
  const firstName = userName.split(" ")[0];

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your LeadXpert password was changed</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logoText}>LeadXpert</Text>
          </Section>

          {/* Main Card */}
          <Section style={styles.mainCard}>
            
            {/* Success Icon */}
            <Section style={styles.iconBox}>
              <Text style={styles.icon}>✓</Text>
            </Section>

            <Heading style={styles.heading}>Password changed successfully</Heading>
            
            <Text style={styles.bodyText}>
              Hi {firstName},
            </Text>
            
            <Text style={styles.bodyText}>
              This is a confirmation that your LeadXpert password was changed on{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}.
            </Text>

            <Text style={styles.bodyText}>
              You can now log in to your account with your new password.
            </Text>

            <Section style={{ textAlign: "center" as const, margin: "32px 0" }}>
              <Button href={dashboardUrl} style={styles.button}>
                Go to Dashboard
              </Button>
            </Section>

            {/* Warning Box */}
            <Section style={styles.warningBox}>
              <Text style={styles.warningTitle}>
                Didn't change your password?
              </Text>
              <Text style={styles.warningText}>
                If you didn't make this change, please contact our support team
                immediately at support@leadxpert.app or reset your password again
                to secure your account.
              </Text>
            </Section>

          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerBrand}>LeadXpert</Text>
            <Text style={styles.footerAddress}>
              © {new Date().getFullYear()} LeadXpert · Kathmandu, Nepal
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

export default PasswordChangedEmail;

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

  iconBox: {
    textAlign: "center" as const,
    marginBottom: "24px",
  },

  icon: {
    display: "inline-block",
    backgroundColor: t.colors.semantic.success,
    color: t.colors.text.inverse,
    fontSize: "36px",
    fontWeight: "700",
    width: "64px",
    height: "64px",
    lineHeight: "64px",
    borderRadius: "50%",
    margin: "0",
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

  button: {
    backgroundColor: t.colors.primary.main,
    borderRadius: "8px",
    color: t.colors.text.inverse,
    display: "inline-block",
    fontSize: "15px",
    fontWeight: "600",
    padding: "14px 32px",
    textDecoration: "none",
  },

  warningBox: {
    backgroundColor: "#FEF2F2",
    border: `1px solid ${t.colors.semantic.error}33`,
    borderLeft: `4px solid ${t.colors.semantic.error}`,
    borderRadius: "8px",
    padding: "20px",
    marginTop: "32px",
  },

  warningTitle: {
    color: t.colors.text.primary,
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 8px",
  },

  warningText: {
    color: t.colors.text.secondary,
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
