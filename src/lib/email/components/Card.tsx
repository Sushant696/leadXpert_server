import * as React from 'react';
import { Section } from '@react-email/components';
import { emailTheme } from '../templates/theme';


interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'bordered';
  padding?: 'sm' | 'md' | 'lg';
}

export const Card = ({
  children,
  variant = 'default',
  padding = 'lg',
}: CardProps) => {
  const variantStyles = {
    default: {
      backgroundColor: emailTheme.colors.background.main,
      border: `2px solid ${emailTheme.colors.neutral[200]}`,
    },
    subtle: {
      backgroundColor: emailTheme.colors.background.subtle,
      border: 'none',
    },
    bordered: {
      backgroundColor: emailTheme.colors.background.main,
      border: `2px solid ${emailTheme.colors.primary.main}`,
    },
  };

  const paddingStyles = {
    sm: emailTheme.spacing.lg,
    md: emailTheme.spacing['2xl'],
    lg: emailTheme.spacing['3xl'],
  };

  return (
    <Section
      style={{
        ...variantStyles[variant],
        borderRadius: emailTheme.borderRadius.xl,
        padding: paddingStyles[padding],
        marginBottom: emailTheme.spacing['2xl'],
      }}
    >
      {children}
    </Section>
  );
};