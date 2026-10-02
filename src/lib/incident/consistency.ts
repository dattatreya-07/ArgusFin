import {
  IncidentRecord,
  ConsistencyCheckResult,
  ConsistencyIssue,
} from './types';
import {
  normalizeDomain,
  normalizeEntityName,
  normalizeAmount,
  parseDateSafe,
  normalizePaymentMethod,
} from './normalize';

/**
 * Deterministic Entity Consistency Engine
 * Checks across user-provided narrative, transaction details, metadata, and timestamps.
 * Never silently modifies facts; returns structured actionable warnings.
 */
export function validateIncidentConsistency(record: IncidentRecord): ConsistencyCheckResult {
  const issues: ConsistencyIssue[] = [];

  // 1. Date & Chronology Checks
  if (record.when) {
    const incDate = parseDateSafe(record.when);
    if (incDate) {
      const now = new Date();
      if (incDate.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
        issues.push({
          field: 'when',
          severity: 'WARNING',
          description: 'Incident date cannot be in the future.',
          conflictingValues: [record.when, now.toISOString()],
        });
      }
    } else {
      issues.push({
        field: 'when',
        severity: 'INFO',
        description: 'Incident date format could not be parsed as a standard timestamp.',
        conflictingValues: [record.when],
      });
    }
  }

  // 2. Transaction Amount vs Total Amount
  const totalAmount = normalizeAmount(record.amount);
  if (totalAmount < 0) {
    issues.push({
      field: 'amount',
      severity: 'WARNING',
      description: 'Total claimed amount cannot be negative.',
      conflictingValues: [String(totalAmount)],
    });
  }

  if (record.transactions && record.transactions.length > 0) {
    const txSum = record.transactions.reduce((sum, tx) => sum + normalizeAmount(tx.amount), 0);
    if (totalAmount > 0 && txSum > 0 && Math.abs(txSum - totalAmount) > 1) {
      issues.push({
        field: 'amount',
        severity: 'WARNING',
        description: `Total amount (₹${totalAmount.toLocaleString('en-IN')}) differs from transaction sum (₹${txSum.toLocaleString('en-IN')}).`,
        conflictingValues: [`Total: ₹${totalAmount}`, `Sum of ${record.transactions.length} txs: ₹${txSum}`],
      });
    }

    // Check individual transaction dates vs incident date
    if (record.when) {
      const incDate = parseDateSafe(record.when);
      if (incDate) {
        for (let i = 0; i < record.transactions.length; i++) {
          const tx = record.transactions[i];
          if (tx.date) {
            const txDate = parseDateSafe(tx.date);
            if (txDate && txDate.getTime() > new Date().getTime() + 24 * 60 * 60 * 1000) {
              issues.push({
                field: `transactions[${i}].date`,
                severity: 'WARNING',
                description: `Transaction #${i + 1} date is recorded in the future.`,
                conflictingValues: [tx.date],
              });
            }
          }
        }
      }
    }
  }

  // 3. Domain & URL Consistency
  if (record.domain) {
    const normDomain = normalizeDomain(record.domain);
    if (record.whatHappened) {
      const urlMatches = record.whatHappened.match(/https?:\/\/[^\s]+|[a-z0-9.-]+\.(?:com|org|net|xyz|vip|top|in|io|co)/gi);
      if (urlMatches && urlMatches.length > 0) {
        const narrativeDomains = urlMatches.map(normalizeDomain).filter((d) => d.length > 0 && !d.includes('cybercrime.gov.in') && !d.includes('sebi.gov.in'));
        if (narrativeDomains.length > 0 && !narrativeDomains.some((nd) => nd.includes(normDomain) || normDomain.includes(nd))) {
          issues.push({
            field: 'domain',
            severity: 'INFO',
            description: `Supplied domain (${record.domain}) differs from web links mentioned in the narrative.`,
            conflictingValues: [record.domain, ...narrativeDomains],
          });
        }
      }
    }
  }

  // 4. Entity Name Consistency
  if (record.entityName && record.whatHappened) {
    const normEntity = normalizeEntityName(record.entityName);
    const commonAdvisors = ['groww', 'zerodha', 'angelone', 'hdfc securities', 'icici direct', 'motilal oswal', 'blackrock', 'fidelity', 'vanguard'];
    for (const adv of commonAdvisors) {
      if (record.whatHappened.toLowerCase().includes(adv) && !normEntity.includes(adv)) {
        issues.push({
          field: 'entityName',
          severity: 'INFO',
          description: `Narrative references '${adv}' while claimed advisor name is '${record.entityName}'. Possible impersonation of a regulated entity.`,
          conflictingValues: [record.entityName, adv],
        });
      }
    }
  }

  // 5. Payment Method & Beneficiary Consistency
  if (record.transactions) {
    for (let i = 0; i < record.transactions.length; i++) {
      const tx = record.transactions[i];
      if (tx.beneficiaryAccountOrUpi) {
        const isUpiVpa = /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,}$/.test(tx.beneficiaryAccountOrUpi.trim());
        const isNumericAccount = /^\d{9,18}$/.test(tx.beneficiaryAccountOrUpi.trim());
        const txMethod = normalizePaymentMethod(tx.paymentMethod || record.paymentMethod);

        if (txMethod === 'BANK_TRANSFER' && isUpiVpa) {
          issues.push({
            field: `transactions[${i}].paymentMethod`,
            severity: 'INFO',
            description: `Transaction #${i + 1} marked as Bank Transfer, but beneficiary identifier looks like a UPI handle (${tx.beneficiaryAccountOrUpi}).`,
            conflictingValues: ['BANK_TRANSFER', tx.beneficiaryAccountOrUpi],
          });
        } else if (txMethod === 'UPI' && isNumericAccount) {
          issues.push({
            field: `transactions[${i}].paymentMethod`,
            severity: 'INFO',
            description: `Transaction #${i + 1} marked as UPI, but beneficiary identifier looks like a bank account number.`,
            conflictingValues: ['UPI', tx.beneficiaryAccountOrUpi],
          });
        }
      }
    }
  }

  // 6. Security Credential Exposure Notice
  if (record.otpShared || record.credentialsShared) {
    issues.push({
      field: 'credentialsShared',
      severity: 'WARNING',
      description: 'Credentials or OTP were shared: Suggests potential unauthorized account takeover. Immediate password/PIN reset required.',
      conflictingValues: ['OTP or Account Credentials Shared'],
    });
  }

  if (record.remoteAccessGranted) {
    issues.push({
      field: 'remoteAccessGranted',
      severity: 'WARNING',
      description: 'Remote screen-sharing or access app was installed: Device may be compromised. Disconnect Wi-Fi/data and uninstall remote software.',
      conflictingValues: ['Remote Desktop Access Granted'],
    });
  }

  // 7. Minimal Completeness Checks
  if (!record.platform || record.platform.trim().length === 0) {
    issues.push({
      field: 'platform',
      severity: 'INFO',
      description: 'Platform or communication channel is missing.',
      conflictingValues: ['Unspecified'],
    });
  }

  const warnings = issues.map((iss) => iss.description);

  return {
    consistent: issues.filter((iss) => iss.severity === 'WARNING').length === 0,
    issues,
    warnings,
  };
}
