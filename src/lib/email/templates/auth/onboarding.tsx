import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { onboardingStyle } from "../emailStyles";

const styles = onboardingStyle

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  dashboardUrl: string;
}

const features = [
  {
    emoji: "🎯",
    title: "Smart Lead Tracking",
    desc: "Capture and organize every lead with custom fields, tags, and automated data enrichment.",
  },
  {
    emoji: "📊",
    title: "Visual Pipeline",
    desc: "Drag-and-drop kanban boards with real-time collaboration and stage automation.",
  },
  {
    emoji: "⚡",
    title: "Workflow Automation",
    desc: "Set up triggers for emails, reminders, and task assignments so nothing slips through.",
  },
  {
    emoji: "📈",
    title: "Analytics & Reports",
    desc: "Track conversion rates, forecast revenue, and identify bottlenecks in your pipeline.",
  },
];

export const WelcomeEmail = ({
  userName,
  userEmail,
  dashboardUrl,
}: WelcomeEmailProps) => {
  const firstName = userName.split(" ")[0];

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        {firstName}, your LeadXpert account is ready. Start managing your pipeline in minutes!
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>

          <Section style={styles.hero}>
            <Row>
              <Column>
                <Text style={styles.logoText}>LeadXpert</Text>
                <Heading style={styles.heroHeading}>
                  Welcome aboard, {firstName}!
                </Heading>
                <Text style={styles.heroSubtext}>
                  Your lead management system is live. You're now equipped with
                  everything you need to organize leads, accelerate your sales
                  cycle, and close more deals.
                </Text>
                <Button href={dashboardUrl} style={styles.heroCta}>
                  Launch Dashboard →
                </Button>
              </Column>
            </Row>
          </Section>

          <Section style={styles.mainCard}>

            <Section style={styles.accountStrip}>
              <Row>
                <Column style={{ width: "48%", paddingRight: "2%" }}>
                  <Text style={styles.accountLabel}>Account Name</Text>
                  <Text style={styles.accountValue}>{userName}</Text>
                </Column>
                <Column style={{ width: "48%", paddingLeft: "2%" }}>
                  <Text style={styles.accountLabel}>Email Address</Text>
                  <Text style={styles.accountValue}>{userEmail}</Text>
                </Column>
              </Row>
            </Section>

            <Section style={{ padding: "32px 40px 24px" }}>
              <Text style={styles.sectionEyebrow}>WHAT'S INSIDE</Text>
              <Heading style={styles.sectionHeading}>
                Everything you need to manage leads
              </Heading>
              <Text style={styles.sectionSubtext}>
                LeadXpert combines CRM, automation, and analytics in one
                intuitive platform. Here's what you can do right now:
              </Text>

              <div style={{ marginTop: "24px" }}>
                {features.map((f, i) => (
                  <Row key={i} style={styles.featureRow}>
                    <Column style={styles.featureIconCol}>
                      <Text style={styles.featureEmoji}>{f.emoji}</Text>
                    </Column>
                    <Column style={styles.featureTextCol}>
                      <Text style={styles.featureTitle}>{f.title}</Text>
                      <Text style={styles.featureDesc}>{f.desc}</Text>
                    </Column>
                  </Row>
                ))}
              </div>
            </Section>

            <Hr style={styles.divider} />

            <Section style={styles.ctaBanner}>
              <Heading style={styles.ctaBannerHeading}>
                Ready to see LeadXpert in action?
              </Heading>
              <Text style={styles.ctaBannerText}>
                Your workspace is configured and waiting. Log in now to add
                your first lead — it takes less than 60 seconds.
              </Text>
              <Button href={dashboardUrl} style={styles.ctaBannerBtn}>
                Go to Dashboard
              </Button>
            </Section>

          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerBrand}>LeadXpert</Text>
            <Text style={styles.footerTagline}>
              Lead management built for modern sales teams
            </Text>
            <Hr style={styles.footerDivider} />
            <Text style={styles.footerLinks}>
              <a href={`${dashboardUrl}/settings`} style={styles.footerLink}>
                Settings
              </a>
              {"  ·  "}
              <a href={`${dashboardUrl}/help`} style={styles.footerLink}>
                Help Center
              </a>
              {"  ·  "}
              <a href={`${dashboardUrl}/docs`} style={styles.footerLink}>
                Documentation
              </a>
            </Text>
            <Text style={styles.footerAddress}>
              © {new Date().getFullYear()} LeadXpert · Kathmandu, Nepal
              <br />
              You're receiving this email because you created an account at leadxpert.app
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;
