export interface IncidentRecordInput {
  incidentDate: string;
  platform: string;
  entityName?: string;
  totalAmount: number;
  transactions?: Array<{
    utrNumber?: string;
    amount: number;
    beneficiaryAccountOrUpi?: string;
    date?: string;
  }>;
  narrative: string;
}

export interface ConsistencyCheckResult {
  consistent: boolean;
  warnings: string[];
}

/**
 * Validates consistency of user-entered incident records across fields.
 */
export function validateIncidentConsistency(record: IncidentRecordInput): ConsistencyCheckResult {
  const warnings: string[] = [];

  // 1. Date checks
  if (record.incidentDate) {
    const incDate = new Date(record.incidentDate);
    if (!isNaN(incDate.getTime())) {
      if (incDate.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
        warnings.push('Incident date cannot be in the future.');
      }
    }
  }

  // 2. Amount checks
  if (record.totalAmount < 0) {
    warnings.push('Total amount cannot be negative.');
  }

  if (record.transactions && record.transactions.length > 0) {
    const txSum = record.transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    if (txSum > 0 && Math.abs(txSum - record.totalAmount) > 1) {
      warnings.push(
        `Total amount (₹${record.totalAmount.toLocaleString('en-IN')}) differs from transaction sum (₹${txSum.toLocaleString('en-IN')}).`
      );
    }
  }

  // 3. Platform & narrative checks
  if (!record.platform || record.platform.trim().length === 0) {
    warnings.push('Platform or communication channel is required.');
  }

  if (!record.narrative || record.narrative.trim().length < 10) {
    warnings.push('Incident summary is too brief. Please describe what occurred.');
  }

  return {
    consistent: warnings.length === 0,
    warnings,
  };
}
