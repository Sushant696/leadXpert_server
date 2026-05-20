import { emailTheme } from "../templates/theme";

interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Spacer = ({ size = 'md' }: SpacerProps) => {
  return (
    <div
      style={{
        height: emailTheme.spacing[size],
      }}
    />
  );
};