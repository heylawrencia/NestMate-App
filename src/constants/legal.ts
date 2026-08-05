/**
 * Legal Constants — Terms of Service & Privacy Policy (Spec §10.1 & §10.2)
 *
 * Local constant data so legal documents render OFFLINE (airplane mode compatible).
 * Contains all 11 Terms sections (including §5 Payment & Commission per D4) and 7 Privacy sections.
 */

export const LAST_UPDATED_DATE = 'July 27, 2026';

export interface LegalSection {
  id: string;
  title: string;
  content: string;
}

export const TERMS_OF_SERVICE_SECTIONS: LegalSection[] = [
  {
    id: 'eligibility',
    title: '1. Acceptance of Terms & Eligibility',
    content:
      'By registering or using NESTMATE, you agree to be bound by these Terms of Service. You must be at least 18 years of age and currently enrolled in or admitted to an accredited higher education institution in Ghana (such as KNUST, UG, UCC, or UDS) to create an account.',
  },
  {
    id: 'registration',
    title: '2. Account Registration & Email Verification',
    content:
      'To access NESTMATE features, you must register using a valid Google email address (@gmail.com) and complete email verification via the 6-digit access code sent to your inbox. Accounts created with invalid or unverified email addresses will be restricted from accessing matching and room booking features.',
  },
  {
    id: 'lifestyle-matching',
    title: '3. Student Lifestyle Profile & Matching System',
    content:
      'NESTMATE provides automated compatibility scoring based on student lifestyle preferences (sleep schedule, cleanliness, noise tolerance, social energy, and budget). Compatibility scores are algorithmic estimates to assist student room allocation and do not guarantee personal harmony.',
  },
  {
    id: 'bed-holds',
    title: '4. Room Allocation & 48-Hour Bed Holds',
    content:
      'When you select an available bed, NESTMATE issues a temporary 48-hour hold. Holds reserve your selected bed exclusively for 48 hours to allow time for offline payment to the hostel manager. If an access code is not redeemed before expiry, the hold expires automatically and the bed is released.',
  },
  {
    id: 'payments-commission',
    title: '5. Payment & Platform Commission Model',
    content:
      'IMPORTANT LEGAL NOTICE (Terms §5): Room booking fees are paid DIRECTLY to the hostel manager or owner offline via Mobile Money or cash. NESTMATE does NOT collect, process, or hold student room booking funds. NESTMATE charges hostel managers a separate 5% platform commission on confirmed bookings. Any financial disputes regarding hostel fees must be addressed directly with the hostel management.',
  },
  {
    id: 'code-verification',
    title: '6. Code Verification System',
    content:
      'Upon receiving offline payment, your hostel manager issues a unique 6-character access code (e.g. 123-456). Entering a valid access code into NESTMATE confirms your bed allocation and unlocks roommate group communications.',
  },
  {
    id: 'conduct',
    title: '7. User Conduct & Acceptable Use',
    content:
      'You agree to provide accurate profile information and interact respectfully with other students and hostel managers. Harassment, discrimination, impersonation, fraudulent code submission, or false reporting is strictly prohibited and will result in immediate account suspension.',
  },
  {
    id: 'moderation',
    title: '8. Moderation, Reporting & Account Suspension',
    content:
      'NESTMATE enforces moderation algorithms and community report tracking. Receiving 3 or more verified user reports automatically suspends an account pending admin review. Managers with overdue commission fees past due dates may also experience account withdrawal.',
  },
  {
    id: 'intellectual-property',
    title: '9. Intellectual Property & Software Rights',
    content:
      'All rights, title, and interest in NESTMATE software, branding, compatibility algorithms, and design tokens remain the exclusive property of NESTMATE technologies.',
  },
  {
    id: 'disclaimer',
    title: '10. Disclaimer of Warranties & Limitation of Liability',
    content:
      'NESTMATE software is provided "as is" without warranty of any kind. NESTMATE is not liable for indirect damages, roommate disputes, hostel property conditions, or offline monetary transactions between students and managers.',
  },
  {
    id: 'governing-law',
    title: '11. Amendments & Governing Law',
    content:
      'These Terms shall be governed by and construed in accordance with the laws of the Republic of Ghana. NESTMATE reserves the right to modify these Terms at any time with notification posted in-app.',
  },
];

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    id: 'collection',
    title: '1. Information We Collect',
    content:
      'We collect information you provide directly: full name, @gmail.com address, date of birth, gender, school level, bio, and lifestyle preferences (sleep schedule, cleanliness, noise, social level, budget range, and interest tags).',
  },
  {
    id: 'matching-usage',
    title: '2. How Lifestyle Data Computes Compatibility',
    content:
      'Your lifestyle preference answers are processed by our matching algorithms solely to compute compatibility percentages and factor breakdowns with potential roommates. Your raw preferences are visible to matched students as compatibility explanations.',
  },
  {
    id: 'public-visibility',
    title: '3. Profile Visibility to Other Students',
    content:
      'Your display name, avatar photo, school level, bio, and compatibility breakdown are visible to other verified students in roommate matching and hostel room allocation views. Your email address and phone number are never publicly listed.',
  },
  {
    id: 'payments-paystack',
    title: '4. Subscription Payments & Paystack Processing',
    content:
      'Optional Premium subscription payments are processed securely by Paystack (PCI-DSS compliant). NESTMATE never sees, stores, or transmits your credit card or mobile money PIN details on our servers.',
  },
  {
    id: 'media-storage',
    title: '5. Avatar & Photo Media Storage',
    content:
      'Avatar photos uploaded via camera or gallery are stored securely on NESTMATE media servers. Photos are used exclusively for profile identification within the app.',
  },
  {
    id: 'retention-security',
    title: '6. Data Security & Retention',
    content:
      'We implement industry-standard encryption (HTTPS/TLS) and secure token authentication to protect your personal data. We retain your data as long as your account remains active.',
  },
  {
    id: 'user-rights',
    title: '7. Data Export, Rights & Account Deletion',
    content:
      'You have the right to inspect, update, or request deletion of your personal data at any time by contacting support via WhatsApp or email. Account deletion permanently purges your profile and matching records.',
  },
];
