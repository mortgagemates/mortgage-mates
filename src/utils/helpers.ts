export function generateBrokerId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'MM-BR-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateApplicationId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'MM-APP-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateBrokerUrl(brokerId: string): string {
  return `${window.location.origin}/broker-portal/${brokerId}`;
}

export function generateApplicationUrl(applicationId: string): string {
  return `${window.location.origin}/client/${applicationId}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function addOneYear(iso: string): string {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

export function simulatePdfExtraction(commitmentName: string, creditName: string): Record<string, string> {
  return {
    applicantName: 'John Michael Smith',
    applicantDob: '15/03/1985',
    applicantNin: 'AB 12 34 56 C',
    propertyAddress: '42 Oakwood Avenue, Manchester, M14 5TR',
    propertyType: 'Semi-Detached',
    purchasePrice: '£285,000',
    loanAmount: '£228,000',
    depositAmount: '£57,000',
    loanToValue: '80%',
    interestRate: '4.75%',
    loanTerm: '25 Years',
    repaymentType: 'Repayment',
    employmentStatus: 'Employed (Full-Time)',
    employerName: 'TechCorp Solutions Ltd',
    annualIncome: '£62,500',
    creditScore: '742',
    lenderName: 'Nationwide Building Society',
    commitmentDate: new Date().toLocaleDateString('en-GB'),
    expiryDate: new Date(Date.now() + 90 * 86400000).toLocaleDateString('en-GB'),
    commitmentRef: commitmentName.replace('.pdf', '').toUpperCase(),
    creditRef: creditName.replace('.pdf', '').toUpperCase(),
  };
}
