export const BusinessVertical = {
  EDUCATION_CONSULTANCY: "EDUCATION_CONSULTANCY",
  DIGITAL_MARKETING: "DIGITAL_MARKETING",
  IT_SOFTWARE: "IT_SOFTWARE",
  LEGAL_FINANCIAL: "LEGAL_FINANCIAL",
  REAL_ESTATE: "REAL_ESTATE",
  RECRUITMENT: "RECRUITMENT",
  EVENT_MANAGEMENT: "EVENT_MANAGEMENT",
  GENERAL: "GENERAL",
} as const;
export type BusinessVertical = typeof BusinessVertical[keyof typeof BusinessVertical];


// ─── Lead Source 
// Where did this lead come from?
export const LeadSource = {
  FACEBOOK: "FACEBOOK",
  INSTAGRAM: "INSTAGRAM",
  TIKTOK: "TIKTOK",
  VIBER: "VIBER",
  WHATSAPP: "WHATSAPP",
  WALK_IN: "WALK_IN",
  REFERRAL: "REFERRAL",
  GOOGLE: "GOOGLE",
  WEBSITE: "WEBSITE",
  YOUTUBE: "YOUTUBE",
  EMAIL: "EMAIL",
  PHONE_CALL: "PHONE_CALL",
  LINKEDIN: "LINKEDIN",
  EVENT: "EVENT",
  COLD_OUTREACH: "COLD_OUTREACH",
  OTHER: "OTHER",
} as const;
export type LeadSource = typeof LeadSource[keyof typeof LeadSource];


// ─── Lead Status
//
export const LeadStatus = {
  OPEN: "OPEN",
  WON: "WON",
  LOST: "LOST",
  ARCHIVED: "ARCHIVED",
} as const;
export type LeadStatus = typeof LeadStatus[keyof typeof LeadStatus];


// ─── Lead Priority 
// Set manually or overridden by the ML priority analyzer.
export const LeadPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;
export type LeadPriority = typeof LeadPriority[keyof typeof LeadPriority];


// ─── Stage Type 
// Defines the terminal behavior of a pipeline stage.
export const StageType = {
  OPEN: "OPEN",
  WON: "WON",
  LOST: "LOST",
} as const;
export type StageType = typeof StageType[keyof typeof StageType];


// ─── Task Type
export const TaskType = {
  CALL: "CALL",
  VIBER: "VIBER",
  WHATSAPP: "WHATSAPP",
  EMAIL: "EMAIL",
  MEETING: "MEETING",
  FOLLOW_UP: "FOLLOW_UP",
  DEMO: "DEMO",
  DOCUMENT: "DOCUMENT",
  OTHER: "OTHER",
} as const;
export type TaskType = typeof TaskType[keyof typeof TaskType];


// ─── Task Status 
export const TaskStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];


// ─── Task Priority 
export const TaskPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;
export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];


// ─── Activity Type 
export const ActivityType = {
  LEAD_CREATED: "LEAD_CREATED",
  LEAD_UPDATED: "LEAD_UPDATED",
  STAGE_CHANGED: "STAGE_CHANGED",
  STATUS_CHANGED: "STATUS_CHANGED",
  ASSIGNED: "ASSIGNED",
  UNASSIGNED: "UNASSIGNED",
  PRIORITY_CHANGED: "PRIORITY_CHANGED",
  SCORE_UPDATED: "SCORE_UPDATED",
  NOTE_ADDED: "NOTE_ADDED",
  NOTE_EDITED: "NOTE_EDITED",
  NOTE_DELETED: "NOTE_DELETED",
  TASK_CREATED: "TASK_CREATED",
  TASK_COMPLETED: "TASK_COMPLETED",
  TASK_REOPENED: "TASK_REOPENED",
  TASK_DELETED: "TASK_DELETED",
  ATTACHMENT_ADDED: "ATTACHMENT_ADDED",
  ATTACHMENT_DELETED: "ATTACHMENT_DELETED",
  LEAD_CONVERTED: "LEAD_CONVERTED",
  LEAD_LOST: "LEAD_LOST",
  FOLLOW_UP_SCHEDULED: "FOLLOW_UP_SCHEDULED",
  ROTTEN_FLAGGED: "ROTTEN_FLAGGED",
  ROTTEN_CLEARED: "ROTTEN_CLEARED",
  TAG_ADDED: "TAG_ADDED",
  TAG_REMOVED: "TAG_REMOVED",
  CUSTOM: "CUSTOM",
} as const;
export type ActivityType = typeof ActivityType[keyof typeof ActivityType];


// ─── Deal Status 
export const DealStatus = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  ON_HOLD: "ON_HOLD",
  REFUNDED: "REFUNDED",
  CANCELLED: "CANCELLED",
} as const;
export type DealStatus = typeof DealStatus[keyof typeof DealStatus];


// ─── Deal Payment Type 
// INSTALLMENT is the default — advance + remaining on delivery is standard

export const PaymentType = {
  ONE_TIME: "ONE_TIME",
  INSTALLMENT: "INSTALLMENT",
  RETAINER: "RETAINER",
  MILESTONE: "MILESTONE",
} as const;
export type PaymentType = typeof PaymentType[keyof typeof PaymentType];

// ─── Attachment Category 
export const AttachmentCategory = {
  PROPOSAL: "PROPOSAL",
  CONTRACT: "CONTRACT",
  INVOICE: "INVOICE",
  REPORT: "REPORT",
  IDENTITY_DOC: "IDENTITY_DOC",
  ACADEMIC_DOC: "ACADEMIC_DOC",
  FINANCIAL_DOC: "FINANCIAL_DOC",
  OFFER_LETTER: "OFFER_LETTER",
  VISA_DOC: "VISA_DOC",
  TECHNICAL_DOC: "TECHNICAL_DOC",
  OTHER: "OTHER",
} as const;
export type AttachmentCategory = typeof AttachmentCategory[keyof typeof AttachmentCategory];


// ─── Lost Reason Tag
export const LostReasonTag = {
  PRICE: "PRICE",
  COMPETITOR: "COMPETITOR",
  NO_RESPONSE: "NO_RESPONSE",
  NOT_QUALIFIED: "NOT_QUALIFIED",
  TIMING: "TIMING",
  BUDGET_ISSUE: "BUDGET_ISSUE",
  CHANGED_MIND: "CHANGED_MIND",
  DUPLICATE: "DUPLICATE",
  OTHER: "OTHER",
} as const;
export type LostReasonTag = typeof LostReasonTag[keyof typeof LostReasonTag];

// ─── Currency 
export const Currency = {
  NPR: "NPR", USD: "USD",
  INR: "INR",
  GBP: "GBP",
  AUD: "AUD",
  CAD: "CAD",
} as const;
export type Currency = typeof Currency[keyof typeof Currency];
