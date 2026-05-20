import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Img,
  Preview,
} from '@react-email/components';
import { emailTheme } from '../templates/theme';

interface BaseLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

interface EmailFooterProps {
  companyName?: string;
  companyAddress?: string;
  unsubscribeUrl?: string;
  preferencesUrl?: string;
}


export const BaseLayout = ({ children, preview }: BaseLayoutProps) => {
  return (
    <Html lang="en">
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={bodyStyle}>
        <Container style={containerStyle}>{children}</Container>
      </Body>
    </Html>
  );
};

const bodyStyle = {
  backgroundColor: emailTheme.colors.neutral[50],
  fontFamily: emailTheme.typography.fontFamily.base,
  margin: 0,
  padding: 0,
};

const containerStyle = {
  maxWidth: emailTheme.containerWidth.md,
  margin: '0 auto',
  padding: emailTheme.spacing['4xl'],
};

interface EmailHeaderProps {
  logoUrl?: string;
  companyName?: string;
}

export const EmailHeader = ({
  logoUrl,
  companyName = 'LeadXpert'
}: EmailHeaderProps) => {
  return (
    <Section style= {{ marginBottom: emailTheme.spacing['3xl'], textAlign: 'center' }
}>
  {
    logoUrl?(
        <Img
          src = { logoUrl }
          alt = { companyName }
          width = "140"
          style = {{ maxWidth: '140px', height: 'auto' }}
  />
      ) : (
  <Text style= { headerTextStyle } >
  { companyName }
  </Text>
      )}
</Section>
  );
};

const headerTextStyle = {
  margin: 0,
  fontSize: emailTheme.typography.fontSize['3xl'],
  fontWeight: emailTheme.typography.fontWeight.bold,
  color: emailTheme.colors.primary.main,
  letterSpacing: '-0.5px',
};


export const EmailFooter = ({
  companyName = 'LeadXpert',
  companyAddress = 'Kathmandu, Nepal',
  unsubscribeUrl,
  preferencesUrl,
}: EmailFooterProps) => {
  return (
    <Section style= { footerSectionStyle } >
    <Hr style={ hrStyle } />

      < Text style = { footerTextStyle } >
        &copy; { new Date().getFullYear() } { companyName }. All rights reserved.
      </Text>

{
  companyAddress && (
    <Text style={ addressStyle }>
      { companyAddress }
      </Text>
      )
}

{
  (preferencesUrl || unsubscribeUrl) && (
    <Text style={ linksStyle }>
      { preferencesUrl && (
        <>
        <Link href={ preferencesUrl } style = { linkStyle } >
          Manage preferences
            </Link>
  { unsubscribeUrl && ' • ' }
  </>
          )
}
{
  unsubscribeUrl && (
    <Link href={ unsubscribeUrl } style = { unsubscribeLinkStyle } >
      Unsubscribe
      </Link>
          )
}
</Text>
      )}
</Section>
  );
};

const footerSectionStyle = {
  marginTop: emailTheme.spacing['4xl'],
};

const hrStyle = {
  borderColor: emailTheme.colors.neutral[200],
  marginBottom: emailTheme.spacing['2xl'],
};

const footerTextStyle = {
  margin: 0,
  marginBottom: emailTheme.spacing.md,
  fontSize: emailTheme.typography.fontSize.sm,
  color: emailTheme.colors.text.muted,
  textAlign: 'center' as const,
};

const addressStyle = {
  margin: 0,
  marginBottom: emailTheme.spacing.md,
  fontSize: emailTheme.typography.fontSize.xs,
  color: emailTheme.colors.text.muted,
  textAlign: 'center' as const,
};

const linksStyle = {
  margin: 0,
  fontSize: emailTheme.typography.fontSize.xs,
  color: emailTheme.colors.text.muted,
  textAlign: 'center' as const,
};

const linkStyle = {
  color: emailTheme.colors.primary.main,
  textDecoration: 'underline',
};

const unsubscribeLinkStyle = {
  color: emailTheme.colors.text.muted,
  textDecoration: 'underline',
};