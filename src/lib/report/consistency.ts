import {
  IncidentRecord,
  ConsistencyCheckResult,
} from '../incident/types';
import { validateIncidentConsistency as validateConsistencyInternal } from '../incident/consistency';

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
    paymentMethod?: string;
  }>;
  narrative: string;
  credentialsShared?: boolean;
  otpShared?: boolean;
  remoteAccessGranted?: boolean;
  category?: string;
  domain?: string;
}

export type { ConsistencyCheckResult };

/**
 * Validates consistency of user-entered incident records across fields.
 */
export function validateIncidentConsistency(
  record: IncidentRecordInput
): ConsistencyCheckResult {
  const incidentRecord: IncidentRecord = {
    language: 'en',
    when: record.incidentDate,
    platform: record.platform,
    entityName: record.entityName,
    amount: record.totalAmount,
    transactions: record.transactions,
    whatHappened: record.narrative,
    credentialsShared: record.credentialsShared,
    otpShared: record.otpShared,
    remoteAccessGranted: record.remoteAccessGranted,
    category: record.category,
    domain: record.domain,
  };

  return validateConsistencyInternal(incidentRecord);
}
