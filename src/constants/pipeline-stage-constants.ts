import { StageType } from "../types/shared.types";

export type StarterStageDef = {
  name: string;
  color: string;
  type: StageType;
  probability: number;
  description: string;
};

export type StarterTemplate = {
  id: string;
  stages: StarterStageDef[];
};


export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "standard",
    stages: [
      {
        name: "New",
        color: "#8B5CF6",
        type: StageType.OPEN,
        probability: 20,
        description: "Fresh leads to be qualified",
      },
      {
        name: "In Progress",
        color: "#F59E0B",
        type: StageType.OPEN,
        probability: 50,
        description: "Actively working on the deal",
      },
      {
        name: "Won",
        color: "#10B981",
        type: StageType.WON,
        probability: 100,
        description: "Successfully closed deals",
      },
      {
        name: "Lost",
        color: "#EF4444",
        type: StageType.LOST,
        probability: 0,
        description: "Deals that didn't convert",
      },
    ],
  },

  {
    id: "modern_sales",
    stages: [
      {
        name: "Lead In",
        color: "#8B5CF6",
        type: StageType.OPEN,
        probability: 10,
        description: "New inquiry received",
      },
      {
        name: "Qualified",
        color: "#6366F1",
        type: StageType.OPEN,
        probability: 25,
        description: "Lead has been qualified",
      },
      {
        name: "Meeting Scheduled",
        color: "#3B82F6",
        type: StageType.OPEN,
        probability: 40,
        description: "Discovery call or meeting booked",
      },
      {
        name: "Proposal Sent",
        color: "#F59E0B",
        type: StageType.OPEN,
        probability: 60,
        description: "Pricing & proposal delivered",
      },
      {
        name: "Negotiation",
        color: "#F97316",
        type: StageType.OPEN,
        probability: 80,
        description: "Finalizing terms & conditions",
      },
      {
        name: "Closed Won",
        color: "#10B981",
        type: StageType.WON,
        probability: 100,
        description: "Deal successfully closed",
      },
      {
        name: "Closed Lost",
        color: "#EF4444",
        type: StageType.LOST,
        probability: 0,
        description: "Deal did not convert",
      },
    ],
  },

  {
    id: "study_abroad",
    stages: [
      {
        name: "New Inquiry",
        color: "#8B5CF6",
        type: StageType.OPEN,
        probability: 10,
        description: "First contact — call or reply within 2 hrs",
      },
      {
        name: "Counseling Booked",
        color: "#3B82F6",
        type: StageType.OPEN,
        probability: 25,
        description: "Appointment scheduled with counselor",
      },
      {
        name: "Counseling Done",
        color: "#6366F1",
        type: StageType.OPEN,
        probability: 40,
        description: "Session complete, student evaluating",
      },
      {
        name: "Document Collection",
        color: "#F59E0B",
        type: StageType.OPEN,
        probability: 60,
        description: "Gathering transcripts, passport, test scores",
      },
      {
        name: "Application Filed",
        color: "#F97316",
        type: StageType.OPEN,
        probability: 75,
        description: "University application submitted",
      },
      {
        name: "Offer Letter Received",
        color: "#EC4899",
        type: StageType.OPEN,
        probability: 85,
        description: "Offer received, starting visa process",
      },
      {
        name: "Visa Applied",
        color: "#0EA5E9",
        type: StageType.OPEN,
        probability: 90,
        description: "Visa application submitted to embassy",
      },
      {
        name: "Enrolled / Departed",
        color: "#10B981",
        type: StageType.WON,
        probability: 100,
        description: "Visa granted, student departed",
      },
      {
        name: "Lost / Dropped",
        color: "#EF4444",
        type: StageType.LOST,
        probability: 0,
        description: "Chose another consultancy or cancelled",
      },
    ],
  },

  {
    id: "digital_marketing",
    stages: [
      {
        name: "New Lead",
        color: "#8B5CF6",
        type: StageType.OPEN,
        probability: 10,
        description: "Initial inquiry or ad response",
      },
      {
        name: "Discovery Call",
        color: "#3B82F6",
        type: StageType.OPEN,
        probability: 25,
        description: "Understanding their goals and budget",
      },
      {
        name: "Audit Sent",
        color: "#F59E0B",
        type: StageType.OPEN,
        probability: 45,
        description: "Free audit / analysis delivered",
      },
      {
        name: "Proposal Sent",
        color: "#F97316",
        type: StageType.OPEN,
        probability: 65,
        description: "Pricing and scope proposal sent",
      },
      {
        name: "Negotiation",
        color: "#EC4899",
        type: StageType.OPEN,
        probability: 80,
        description: "Finalizing terms",
      },
      {
        name: "Client Won",
        color: "#10B981",
        type: StageType.WON,
        probability: 100,
        description: "Contract signed, advance received",
      },
      {
        name: "Lost",
        color: "#EF4444",
        type: StageType.LOST,
        probability: 0,
        description: "Did not convert",
      },
    ],
  },

  {
    id: "it_software",
    stages: [
      {
        name: "New Inquiry",
        color: "#8B5CF6",
        type: StageType.OPEN,
        probability: 10,
        description: "Initial project inquiry",
      },
      {
        name: "Discovery Call",
        color: "#3B82F6",
        type: StageType.OPEN,
        probability: 25,
        description: "Understanding project scope",
      },
      {
        name: "Requirement Gathering",
        color: "#6366F1",
        type: StageType.OPEN,
        probability: 45,
        description: "Detailed requirements documentation",
      },
      {
        name: "Proposal Sent",
        color: "#F97316",
        type: StageType.OPEN,
        probability: 65,
        description: "Quote and timeline shared",
      },
      {
        name: "Negotiation",
        color: "#EC4899",
        type: StageType.OPEN,
        probability: 82,
        description: "Finalizing terms and pricing",
      },
      {
        name: "Contract Signed",
        color: "#10B981",
        type: StageType.WON,
        probability: 100,
        description: "Project kicked off",
      },
      {
        name: "Lost",
        color: "#EF4444",
        type: StageType.LOST,
        probability: 0,
        description: "Project not awarded",
      },
    ],
  },

  {
    id: "real_estate",
    stages: [
      {
        name: "New Inquiry",
        color: "#8B5CF6",
        type: StageType.OPEN,
        probability: 10,
        description: "Property inquiry received",
      },
      {
        name: "Site Visit Scheduled",
        color: "#3B82F6",
        type: StageType.OPEN,
        probability: 30,
        description: "Property viewing booked",
      },
      {
        name: "Site Visit Done",
        color: "#6366F1",
        type: StageType.OPEN,
        probability: 50,
        description: "Client has seen the property",
      },
      {
        name: "Negotiation",
        color: "#F97316",
        type: StageType.OPEN,
        probability: 70,
        description: "Price and terms discussion",
      },
      {
        name: "Booking Amount Paid",
        color: "#EC4899",
        type: StageType.OPEN,
        probability: 85,
        description: "Token/booking amount received",
      },
      {
        name: "Deal Closed",
        color: "#10B981",
        type: StageType.WON,
        probability: 100,
        description: "Full payment & registration done",
      },
      {
        name: "Lost",
        color: "#EF4444",
        type: StageType.LOST,
        probability: 0,
        description: "Did not proceed",
      },
    ],
  },
];


export const TemplateIdLookup = ["real_estate", "standard", "modern_sales", "study_abroad",
  "digital_marketing", "it_software", "real_estate"]
