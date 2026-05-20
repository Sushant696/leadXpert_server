import { Hr } from '@react-email/components';
import { emailTheme } from '../templates/theme';

interface DividerProps {
  spacing?: 'sm' | 'md' | 'lg';
}

export const Divider = ({ spacing = 'md' }: DividerProps) => {
  const spacingStyles = {
    sm: emailTheme.spacing.lg,
    md: emailTheme.spacing['2xl'],
    lg: emailTheme.spacing['3xl'],
  };

  return (
    <Hr
      style={{
        borderColor: emailTheme.colors.neutral[200],
        margin: `${spacingStyles[spacing]} 0`,
      }}
    />
  );
};