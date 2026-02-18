export const mockAlerts = [
  { id: 'ALT-9921', customer: 'Bright Tech Solutions Pvt Ltd', type: 'Velocity Anomaly', risk: 'High', date: '2024-02-06', status: 'Pending', deviation: '5.2x', typologyMatch: 0.91 },
  { id: 'ALT-9922', customer: 'Global Imports LLC', type: 'Sanctions Match', risk: 'Critical', date: '2024-02-06', status: 'Pending', deviation: 'N/A', typologyMatch: 0.98 },
  { id: 'ALT-9923', customer: 'Retail Corp Inc', type: 'Cash Structuring', risk: 'Medium', date: '2024-02-05', status: 'Pending', deviation: '2.1x', typologyMatch: 0.74 },
];

export const mockAnomalyData = [
  { date: 'Jan 28', amount: 45000, type: 'normal' },
  { date: 'Jan 29', amount: 52000, type: 'normal' },
  { date: 'Jan 30', amount: 48000, type: 'normal' },
  { date: 'Jan 31', amount: 50000, type: 'normal' },
  { date: 'Feb 01', amount: 1463000, type: 'spike' }, 
  { date: 'Feb 02', amount: 1465000, type: 'spike' }, 
  { date: 'Feb 03', amount: 5000000, type: 'spike' }, 
];

export const mockSimilarCasesList = [
  { id: 'Case #4721', typology: 'Funnel + UAE corridor', date: '2023-11-12' },
  { id: 'Case #5832', typology: 'Structuring recurrence', date: '2023-08-04' }
];

export const mockCases = [
  { id: 'BRC-2024-0147', customer: 'Bright Tech Solutions Pvt Ltd', risk: 'High', type: 'Structuring', status: 'Open', date: '2024-02-14', similarCases: 2 },
  { id: 'BRC-2024-0146', customer: 'Global Imports LLC', risk: 'Medium', type: 'Funnel', status: 'Drafted', date: '2024-02-13', similarCases: 0 },
  { id: 'BRC-2024-0145', customer: 'Sunrise Traders', risk: 'High', type: 'Geo-risk', status: 'Approved', date: '2024-02-12', similarCases: 1 },
  { id: 'BRC-2024-0144', customer: 'Metro Textiles Ltd', risk: 'Medium', type: 'Structuring', status: 'Under Review', date: '2024-02-11', similarCases: 0 },
];

export const mockCustomer = {
  name: 'Bright Tech Solutions Pvt Ltd', accountId: 'BRC-ACC-891234', businessType: 'Software Development',
  kycDate: '2022-03-15', riskRating: 'High', industry: 'Technology Services', relationship: 'Corporate Banking', officer: 'Sarah Mitchell'
};

export const mockTransactions = [
  { id: 'TXN-1234', date: '2024-02-01', amount: 485000, counterparty: 'Account #4521', type: 'Credit', flagged: true, source: 'Individual A' },
  { id: 'TXN-1235', date: '2024-02-01', amount: 490000, counterparty: 'Account #8834', type: 'Credit', flagged: true, source: 'Individual B' },
  { id: 'TXN-1236', date: '2024-02-02', amount: 475000, counterparty: 'Account #2901', type: 'Credit', flagged: true, source: 'Individual C' },
  { id: 'TXN-1237', date: '2024-02-02', amount: 498000, counterparty: 'Account #7123', type: 'Credit', flagged: true, source: 'Individual D' },
  { id: 'TXN-1238', date: '2024-02-03', amount: 5000000, counterparty: 'Dubai Commercial Bank', type: 'Debit', flagged: true, source: 'UAE Entity' },
  { id: 'TXN-1239', date: '2024-02-05', amount: 120000, counterparty: 'Vendor Payment', type: 'Debit', flagged: false, source: 'Supplier X' },
  { id: 'TXN-1240', date: '2024-02-01', amount: 488000, counterparty: 'Account #1092', type: 'Credit', flagged: true, source: 'Individual E' },
  { id: 'TXN-1241', date: '2024-02-02', amount: 492000, counterparty: 'Account #5567', type: 'Credit', flagged: true, source: 'Individual F' },
];

export const mockTypologies = [
  { type: 'Structuring', confidence: 0.91, description: 'Multiple sub-threshold deposits', riskLevel: 'Critical' },
  { type: 'Funnel Account', confidence: 0.87, description: 'Rapid aggregation from multiple sources', riskLevel: 'High' },
  { type: 'Geo-risk', confidence: 0.93, description: 'High-risk jurisdiction transfer detected', riskLevel: 'Critical' },
];

export const graphNodes = [
  { id: 'customer', label: 'Bright Tech\nSolutions', x: 400, y: 200, type: 'customer' },
  { id: 'source1', label: 'Individual A\n₹4.85L', x: 150, y: 100, type: 'source' },
  { id: 'source2', label: 'Individual B\n₹4.90L', x: 150, y: 200, type: 'source' },
  { id: 'source3', label: 'Individual C\n₹4.75L', x: 150, y: 300, type: 'source' },
  { id: 'source4', label: '44 More\nAccounts', x: 150, y: 400, type: 'source' },
  { id: 'dest', label: 'Dubai Commercial\nBank\n₹50L', x: 650, y: 200, type: 'destination' },
];

export const graphEdges = [
  { from: 'source1', to: 'customer' }, { from: 'source2', to: 'customer' }, { from: 'source3', to: 'customer' },
  { from: 'source4', to: 'customer' }, { from: 'customer', to: 'dest' },
];

export const initialSarSections = {
  background: "Bright Tech Solutions Pvt Ltd (BRC-ACC-891234) is a technology services company established in 2022 under Barclays Corporate Banking relationship management. The account has maintained regular business operations with typical software development receivables until the activity period under review.",
  activity: "During February 1-3, 2024, the account received ₹19.48 lakhs across 47 individual deposits. Each deposit ranged between ₹4.75-4.98 lakhs, systematically positioned below the ₹5 lakh reporting threshold. On February 3, 2024, ₹50 lakhs was transferred to Dubai Commercial Bank within 72 hours of the final deposit cluster.",
  typology: "The observed pattern aligns with structured deposit activity designed to evade currency transaction reporting requirements. The rapid consolidation of funds from disparate sources into a single beneficiary account exhibits characteristics consistent with funnel account operations. The subsequent cross-border transfer to UAE jurisdictional banking introduces additional geographic risk factors.",
  regulatory: "This activity triggers reporting obligations under Section 12 of the Prevention of Money Laundering Act, 2002. The transaction pattern demonstrates indicators outlined in RBI Master Direction on KYC (2016) regarding suspicious transaction monitoring. FATF Recommendation 10 guidance on customer due diligence applies to the enhanced risk profile introduced by high-risk jurisdiction exposure.",
  conclusion: "The systematic structuring of deposits, coupled with rapid foreign remittance to a jurisdiction with known AML vulnerabilities, presents sufficient grounds for filing this Suspicious Transaction Report. Further investigation into the 47 source accounts and the ultimate beneficiary relationship is recommended."
};

export const evidenceMapping = {
  0: { transactions: [], rule: 'Customer Profile Verification', regulatory: 'RBI KYC Master Direction - Customer Identification', confidence: 0.98, toneIssue: null },
  1: { transactions: ['TXN-1234', 'TXN-1235', 'TXN-1236', 'TXN-1237', 'TXN-1238'], rule: 'Structuring Pattern Detector', regulatory: 'PMLA Section 12 - Threshold Reporting Requirements', confidence: 0.91, toneIssue: null, details: { amounts: ['₹4.85L', '₹4.90L', '₹4.75L', '₹4.98L'], threshold: '₹5L', deviation: '2-5%' } },
  2: { transactions: ['TXN-1234', 'TXN-1235', 'TXN-1236', 'TXN-1237', 'TXN-1238'], rule: 'Funnel Account Detector + Geo-Risk Analyzer', regulatory: 'FATF Recommendation 10 - Customer Due Diligence', confidence: 0.87, toneIssue: null },
  3: { transactions: ['TXN-1238'], rule: 'Regulatory Compliance Mapper', regulatory: 'PMLA 2002 + RBI Master Direction on KYC', confidence: 0.95, toneIssue: null },
  4: { transactions: ['TXN-1234', 'TXN-1235', 'TXN-1236', 'TXN-1237', 'TXN-1238'], rule: 'Aggregated Risk Assessment', regulatory: 'FATF STR Filing Guidance', confidence: 0.89, toneIssue: { original: "systematic structuring", issue: "Assertion strength too high without direct customer intent evidence", calibrated: "observed pattern of structured deposits" } }
};

export const hallucinationChecks = [
  { sentence: 0, status: 'pass', issue: null }, { sentence: 1, status: 'pass', issue: null }, { sentence: 2, status: 'pass', issue: null }, { sentence: 3, status: 'pass', issue: null }, { sentence: 4, status: 'warning', issue: 'Tone calibration recommended' },
];