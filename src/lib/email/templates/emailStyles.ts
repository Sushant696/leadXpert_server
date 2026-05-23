import { emailTheme } from "../templates/theme";

const t = emailTheme;

export const typography = {
  h1: {
    fontFamily: t.typography.fontFamily.heading,
    fontSize: t.typography.fontSize["3xl"],
    fontWeight: t.typography.fontWeight.bold,
    lineHeight: t.typography.lineHeight.tight,
    color: t.colors.text.primary,
    margin: `0 0 ${t.spacing.lg} 0`,
  },
  h2: {
    fontFamily: t.typography.fontFamily.heading,
    fontSize: t.typography.fontSize["2xl"],
    fontWeight: t.typography.fontWeight.bold,
    lineHeight: t.typography.lineHeight.tight,
    color: t.colors.text.primary,
    margin: `0 0 ${t.spacing.lg} 0`,
  },
  h3: {
    fontFamily: t.typography.fontFamily.heading,
    fontSize: t.typography.fontSize.xl,
    fontWeight: t.typography.fontWeight.semibold,
    lineHeight: t.typography.lineHeight.tight,
    color: t.colors.text.primary,
    margin: `0 0 ${t.spacing.md} 0`,
  },
  body: {
    fontFamily: t.typography.fontFamily.base,
    fontSize: t.typography.fontSize.base,
    fontWeight: t.typography.fontWeight.normal,
    lineHeight: t.typography.lineHeight.relaxed,
    color: t.colors.text.primary,
    margin: `0 0 ${t.spacing.lg} 0`,
  },
  bodySmall: {
    fontFamily: t.typography.fontFamily.base,
    fontSize: t.typography.fontSize.sm,
    fontWeight: t.typography.fontWeight.normal,
    lineHeight: t.typography.lineHeight.relaxed,
    color: t.colors.text.secondary,
    margin: `0 0 ${t.spacing.md} 0`,
  },
  caption: {
    fontFamily: t.typography.fontFamily.base,
    fontSize: t.typography.fontSize.xs,
    fontWeight: t.typography.fontWeight.normal,
    lineHeight: t.typography.lineHeight.normal,
    color: t.colors.text.muted,
    margin: "0",
  },
  label: {
    fontFamily: t.typography.fontFamily.base,
    fontSize: t.typography.fontSize.sm,
    fontWeight: t.typography.fontWeight.semibold,
    lineHeight: t.typography.lineHeight.normal,
    color: t.colors.text.secondary,
    margin: `0 0 ${t.spacing.xs} 0`,
  },
  eyebrow: {
    fontFamily: t.typography.fontFamily.base,
    fontSize: "11px",
    fontWeight: t.typography.fontWeight.bold,
    lineHeight: t.typography.lineHeight.normal,
    color: t.colors.primary.main,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    margin: `0 0 ${t.spacing.sm} 0`,
  },
  link: {
    color: t.colors.primary.main,
    textDecoration: "underline",
  },
} as const;

export const layout = {
  body: {
    backgroundColor: t.colors.neutral[100],
    fontFamily: t.typography.fontFamily.base,
    margin: "0",
    padding: "0",
  },
  outerContainer: {
    maxWidth: t.containerWidth.md,
    margin: "0 auto",
    padding: `${t.spacing["3xl"]} ${t.spacing.lg}`,
  },
  innerContainer: {
    maxWidth: t.containerWidth.md,
    margin: "0 auto",
  },
} as const;

export const button = {
  primary: {
    backgroundColor: t.colors.primary.main,
    borderRadius: t.borderRadius.lg,
    color: t.colors.text.inverse,
    fontFamily: t.typography.fontFamily.base,
    fontSize: t.typography.fontSize.sm,
    fontWeight: t.typography.fontWeight.semibold,
    padding: `${t.spacing.md} ${t.spacing["3xl"]}`,
    textDecoration: "none",
    display: "inline-block",
  },
  primaryLarge: {
    backgroundColor: t.colors.primary.main,
    borderRadius: t.borderRadius.lg,
    color: t.colors.text.inverse,
    fontFamily: t.typography.fontFamily.base,
    fontSize: t.typography.fontSize.base,
    fontWeight: t.typography.fontWeight.semibold,
    padding: `${t.spacing.lg} ${t.spacing["4xl"]}`,
    textDecoration: "none",
    display: "inline-block",
  },
  accent: {
    backgroundColor: t.colors.accent.main,
    borderRadius: t.borderRadius.lg,
    color: t.colors.text.inverse,
    fontFamily: t.typography.fontFamily.base,
    fontSize: t.typography.fontSize.sm,
    fontWeight: t.typography.fontWeight.semibold,
    padding: `${t.spacing.md} ${t.spacing["3xl"]}`,
    textDecoration: "none",
    display: "inline-block",
  },
  secondary: {
    backgroundColor: "transparent",
    border: `2px solid ${t.colors.primary.main}`,
    borderRadius: t.borderRadius.lg,
    color: t.colors.primary.main,
    fontFamily: t.typography.fontFamily.base,
    fontSize: t.typography.fontSize.sm,
    fontWeight: t.typography.fontWeight.semibold,
    padding: `${t.spacing.md} ${t.spacing["3xl"]}`,
    textDecoration: "none",
    display: "inline-block",
  },
  danger: {
    backgroundColor: t.colors.semantic.error,
    borderRadius: t.borderRadius.lg,
    color: t.colors.text.inverse,
    fontFamily: t.typography.fontFamily.base,
    fontSize: t.typography.fontSize.sm,
    fontWeight: t.typography.fontWeight.semibold,
    padding: `${t.spacing.md} ${t.spacing["3xl"]}`,
    textDecoration: "none",
    display: "inline-block",
  },
} as const;

export const surface = {
  infoBox: {
    backgroundColor: t.colors.background.subtle,
    borderRadius: t.borderRadius.md,
    padding: t.spacing.lg,
    marginBottom: t.spacing.xl,
  },
  highlight: {
    backgroundColor: t.colors.primary.dark,
    backgroundImage: `linear-gradient(135deg, ${t.colors.primary.dark} 0%, ${t.colors.primary.main} 60%, ${t.colors.primary.light} 100%)`,
    borderRadius: `${t.borderRadius.xl} ${t.borderRadius.xl} 0 0`,
    padding: `${t.spacing["5xl"]} ${t.spacing["5xl"]} ${t.spacing["4xl"]}`,
  },
  warning: {
    backgroundColor: "#FFFBEB",
    border: `1px solid ${t.colors.secondary.main}33`,
    borderLeft: `4px solid ${t.colors.secondary.main}`,
    borderRadius: t.borderRadius.md,
    padding: t.spacing.lg,
    marginBottom: t.spacing.xl,
  },
  danger: {
    backgroundColor: "#FEF2F2",
    border: `1px solid ${t.colors.semantic.error}33`,
    borderLeft: `4px solid ${t.colors.semantic.error}`,
    borderRadius: t.borderRadius.md,
    padding: t.spacing.lg,
    marginBottom: t.spacing.xl,
  },
  success: {
    backgroundColor: "#ECFDF5",
    border: `1px solid ${t.colors.semantic.success}33`,
    borderLeft: `4px solid ${t.colors.semantic.success}`,
    borderRadius: t.borderRadius.md,
    padding: t.spacing.lg,
    marginBottom: t.spacing.xl,
  },
} as const;

export const statusBadge = {
  base: {
    borderRadius: t.borderRadius.full,
    fontSize: t.typography.fontSize.xs,
    fontWeight: t.typography.fontWeight.semibold,
    padding: `${t.spacing.xs} ${t.spacing.md}`,
    display: "inline-block",
  },
  new: {
    color: t.colors.status.new,
    backgroundColor: "#F3F0FF",
    border: `1px solid ${t.colors.status.new}33`,
  },
  inProgress: {
    color: t.colors.status.inProgress,
    backgroundColor: "#FFFBEB",
    border: `1px solid ${t.colors.status.inProgress}33`,
  },
  converted: {
    color: t.colors.status.converted,
    backgroundColor: "#ECFDF5",
    border: `1px solid ${t.colors.status.converted}33`,
  },
  lost: {
    color: t.colors.status.lost,
    backgroundColor: "#FEF2F2",
    border: `1px solid ${t.colors.status.lost}33`,
  },
} as const;

export const step = {
  row: {
    marginBottom: t.spacing.lg,
  },
  numberCircle: {
    backgroundColor: t.colors.primary.main,
    borderRadius: t.borderRadius.full,
    color: t.colors.text.inverse,
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: t.typography.fontWeight.bold,
    fontSize: t.typography.fontSize.sm,
    flexShrink: 0,
  },
  numberSquare: {
    backgroundColor: t.colors.primary.main,
    borderRadius: t.borderRadius.md,
    color: t.colors.text.inverse,
    fontSize: "11px",
    fontWeight: t.typography.fontWeight.bold,
    letterSpacing: "0.5px",
    padding: `${t.spacing.xs} ${t.spacing.sm}`,
    display: "inline-block",
    textAlign: "center" as const,
    minWidth: "28px",
  },
  title: {
    fontSize: t.typography.fontSize.sm,
    fontWeight: t.typography.fontWeight.semibold,
    color: t.colors.text.primary,
    margin: `2px 0 ${t.spacing.xs}`,
  },
  description: {
    fontSize: t.typography.fontSize.xs,
    color: t.colors.text.muted,
    lineHeight: t.typography.lineHeight.relaxed,
    margin: "0",
  },
} as const;

export const divider = {
  default: {
    borderColor: t.colors.neutral[200],
    margin: `${t.spacing["3xl"]} 0`,
  },
  tight: {
    borderColor: t.colors.neutral[200],
    margin: `${t.spacing.xl} 0`,
  },
  subtle: {
    borderColor: t.colors.neutral[100],
    margin: `${t.spacing["2xl"]} 0`,
  },
} as const;

export const header = {
  logoText: {
    color: t.colors.text.inverse,
    fontSize: t.typography.fontSize.xl,
    fontWeight: t.typography.fontWeight.bold,
    letterSpacing: "-0.5px",
    margin: `0 0 ${t.spacing["3xl"]}`,
  },
  heroHeading: {
    color: t.colors.text.inverse,
    fontSize: t.typography.fontSize["3xl"],
    fontWeight: t.typography.fontWeight.bold,
    lineHeight: t.typography.lineHeight.tight,
    margin: `0 0 ${t.spacing.lg}`,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: t.typography.fontSize.base,
    lineHeight: t.typography.lineHeight.relaxed,
    margin: `0 0 ${t.spacing["3xl"]}`,
  },
  ctaHint: {
    color: "rgba(255,255,255,0.55)",
    fontSize: t.typography.fontSize.xs,
    margin: `${t.spacing.md} 0 0`,
  },
} as const;

export const footer = {
  wrapper: {
    padding: `${t.spacing["3xl"]} ${t.spacing.sm} ${t.spacing.sm}`,
    textAlign: "center" as const,
  },
  logoText: {
    color: t.colors.text.primary,
    fontSize: t.typography.fontSize.lg,
    fontWeight: t.typography.fontWeight.bold,
    margin: `0 0 ${t.spacing.xs}`,
  },
  tagline: {
    color: t.colors.text.muted,
    fontSize: t.typography.fontSize.xs,
    margin: `0 0 ${t.spacing.lg}`,
  },
  link: {
    color: t.colors.primary.main,
    textDecoration: "none",
  },
  linksRow: {
    color: t.colors.text.muted,
    fontSize: t.typography.fontSize.xs,
    margin: `0 0 ${t.spacing.sm}`,
  },
  address: {
    color: t.colors.text.muted,
    fontSize: "11px",
    lineHeight: t.typography.lineHeight.relaxed,
    margin: "0",
  },
} as const;

export const onboardingStyle: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: t.colors.neutral[100],
    fontFamily: t.typography.fontFamily.base,
    margin: "0",
    padding: "0",
  },

  container: {
    maxWidth: "640px",
    margin: "0 auto",
    padding: "32px 16px",
  },

  hero: {
    backgroundColor: t.colors.primary.dark,
    backgroundImage: `linear-gradient(135deg, ${t.colors.primary.dark} 0%, ${t.colors.primary.main} 100%)`,
    borderRadius: "16px 16px 0 0",
    padding: "48px 40px 40px",
    textAlign: "center" as const,
  },

  logoText: {
    color: t.colors.text.inverse,
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    margin: "0 0 24px",
    opacity: "0.95",
  },

  heroHeading: {
    color: t.colors.text.inverse,
    fontSize: "32px",
    fontWeight: "700",
    lineHeight: "1.2",
    margin: "0 0 16px",
  },

  heroSubtext: {
    color: "rgba(255,255,255,0.85)",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0 0 32px",
    maxWidth: "480px",
    marginLeft: "auto",
    marginRight: "auto",
  },

  heroCta: {
    backgroundColor: t.colors.accent.main,
    borderRadius: "10px",
    color: t.colors.text.inverse,
    display: "inline-block",
    fontSize: "16px",
    fontWeight: "600",
    padding: "16px 40px",
    textDecoration: "none",
    boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
  },

  heroHint: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "13px",
    margin: "16px 0 0",
  },

  mainCard: {
    backgroundColor: t.colors.background.main,
    border: `1px solid ${t.colors.neutral[200]}`,
    borderTop: "none",
    borderRadius: "0 0 16px 16px",
    overflow: "hidden",
  },

  accountStrip: {
    backgroundColor: t.colors.neutral[50],
    borderBottom: `1px solid ${t.colors.neutral[200]}`,
    padding: "24px 40px",
  },

  accountLabel: {
    color: t.colors.text.muted,
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.5px",
    margin: "0 0 6px",
    textTransform: "uppercase" as const,
  },

  accountValue: {
    color: t.colors.text.primary,
    fontSize: "15px",
    fontWeight: "500",
    margin: "0",
  },

  sectionEyebrow: {
    color: t.colors.primary.main,
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1.2px",
    margin: "0 0 8px",
    textTransform: "uppercase" as const,
  },

  sectionHeading: {
    color: t.colors.text.primary,
    fontSize: "24px",
    fontWeight: "700",
    lineHeight: "1.3",
    margin: "0 0 12px",
  },

  sectionSubtext: {
    color: t.colors.text.secondary,
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0",
  },

  featureRow: {
    marginBottom: "20px",
  },

  featureIconCol: {
    width: "56px",
    verticalAlign: "top",
    paddingRight: "16px",
  },

  featureTextCol: {
    verticalAlign: "top",
  },

  featureEmoji: {
    fontSize: "32px",
    lineHeight: "1",
    margin: "0",
    display: "block",
  },

  featureTitle: {
    color: t.colors.text.primary,
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "1.4",
    margin: "0 0 4px",
  },

  featureDesc: {
    color: t.colors.text.secondary,
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0",
  },

  ctaBanner: {
    backgroundColor: t.colors.background.subtle,
    borderTop: `1px solid ${t.colors.neutral[200]}`,
    padding: "40px",
    textAlign: "center" as const,
  },

  ctaBannerHeading: {
    color: t.colors.text.primary,
    fontSize: "22px",
    fontWeight: "700",
    margin: "0 0 12px",
  },

  ctaBannerText: {
    color: t.colors.text.secondary,
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 24px",
    maxWidth: "420px",
    marginLeft: "auto",
    marginRight: "auto",
  },

  ctaBannerBtn: {
    backgroundColor: t.colors.primary.main,
    borderRadius: "10px",
    color: t.colors.text.inverse,
    display: "inline-block",
    fontSize: "15px",
    fontWeight: "600",
    padding: "14px 32px",
    textDecoration: "none",
  },

  divider: {
    borderColor: t.colors.neutral[200],
    margin: "0",
  },

  footer: {
    padding: "40px 16px 16px",
    textAlign: "center" as const,
  },

  footerBrand: {
    color: t.colors.text.primary,
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 4px",
  },

  footerTagline: {
    color: t.colors.text.muted,
    fontSize: "13px",
    margin: "0 0 20px",
  },

  footerDivider: {
    borderColor: t.colors.neutral[200],
    margin: "0 0 20px",
    maxWidth: "120px",
    marginLeft: "auto",
    marginRight: "auto",
  },

  footerLinks: {
    color: t.colors.text.muted,
    fontSize: "13px",
    margin: "0 0 12px",
  },

  footerLink: {
    color: t.colors.primary.main,
    textDecoration: "none",
  },

  footerAddress: {
    color: t.colors.text.muted,
    fontSize: "12px",
    lineHeight: "1.6",
    margin: "0",
  },
};
