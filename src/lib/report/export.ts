import { CanonicalReportPacket } from './types';

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates printable HTML string for Citizen Report Review.
 * Safe from HTML/script injection.
 */
export function exportToHtml(packet: CanonicalReportPacket): string {
  const routesHtml = packet.authorityRoutes.routes
    .map(
      (r) => `
    <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 12px; background-color: #f8fafc;">
      <h4 style="margin: 0 0 6px 0; color: #0f172a;">${escapeHtml(r.name)} (${escapeHtml(r.jurisdiction)})</h4>
      <p style="margin: 0 0 4px 0; font-size: 13px; color: #334155;"><strong>Scope:</strong> ${escapeHtml(r.scope)}</p>
      <p style="margin: 0 0 4px 0; font-size: 13px; color: #334155;"><strong>Reasoning:</strong> ${escapeHtml(r.reason)}</p>
      <p style="margin: 0 0 4px 0; font-size: 13px; color: #1e293b;"><strong>Action Guidance:</strong> ${escapeHtml(r.actionGuidance)}</p>
      ${
        r.source_url
          ? `<p style="margin: 4px 0 0 0; font-size: 12px;"><a href="${escapeHtml(r.source_url)}" target="_blank" rel="noopener noreferrer" style="color: #2563eb;">Official Portal (${escapeHtml(r.source_url)})</a></p>`
          : `<p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;"><em>I can't verify this authority contact from the available source material.</em></p>`
      }
    </div>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(packet.locale)}">
<head>
  <meta charset="UTF-8">
  <title>SANGYAN Citizen Incident Review Summary</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 24px; }
    h1 { font-size: 20px; color: #0f172a; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    h2 { font-size: 16px; color: #1e293b; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    ul { margin: 0; padding-left: 20px; }
    li { margin-bottom: 4px; font-size: 14px; }
    .banner { background-color: #fef2f2; border: 2px solid #ef4444; color: #991b1b; padding: 12px 16px; border-radius: 8px; font-weight: bold; text-align: center; margin-bottom: 24px; font-size: 14px; }
    .meta { font-size: 12px; color: #64748b; margin-bottom: 16px; }
    .section { margin-bottom: 20px; }
    .hash { font-family: monospace; font-size: 11px; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; word-break: break-all; }
    @media print {
      body { padding: 0; max-width: 100%; }
      .banner { border-color: #000; color: #000; background: #fff; }
    }
  </style>
</head>
<body>
  <div class="banner">
    ⚠️ ${escapeHtml(packet.submissionNotice)}
  </div>

  <h1>CITIZEN INCIDENT REVIEW PACKET</h1>
  <div class="meta">
    Report Version: ${escapeHtml(packet.reportVersion)} | Generated: ${escapeHtml(packet.generatedAt)} | Jurisdiction: ${escapeHtml(packet.jurisdiction)}
  </div>

  <div class="section">
    <h2>1. Incident Summary & Observed Facts</h2>
    <ul>
      ${packet.observedFacts.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2>2. Sender Claims & Requests</h2>
    <p style="font-size: 13px; font-weight: bold; margin-bottom: 4px;">Observed Sender Claims:</p>
    <ul>
      ${packet.observedClaims.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}
    </ul>
    <p style="font-size: 13px; font-weight: bold; margin-top: 8px; margin-bottom: 4px;">Observed Sender Requests:</p>
    <ul>
      ${packet.observedRequests.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2>3. Observed URLs & Payment Details</h2>
    <p style="font-size: 13px; font-weight: bold; margin-bottom: 4px;">URLs / Domains:</p>
    <ul>
      ${packet.urls.length > 0 ? packet.urls.map((u) => `<li>${escapeHtml(u.fullUrl)} (Domain: ${escapeHtml(u.domain)})</li>`).join('') : '<li>None reported</li>'}
    </ul>
    <p style="font-size: 13px; font-weight: bold; margin-top: 8px; margin-bottom: 4px;">Payment Transactions:</p>
    <ul>
      ${packet.paymentDetails.length > 0 ? packet.paymentDetails.map((p) => `<li>${escapeHtml(p.handleOrAccount)} — ₹${p.amount || 0} (${escapeHtml(p.paymentMethod)})</li>`).join('') : '<li>None recorded</li>'}
    </ul>
  </div>

  <div class="section">
    <h2>4. SANGYAN Risk Analysis</h2>
    <p style="font-size: 14px;"><strong>Risk Level:</strong> ${escapeHtml(packet.sangyanAnalysis.riskBand)} (Confidence: ${Math.round(packet.sangyanAnalysis.confidence * 100)}%)</p>
    <p style="font-size: 14px;"><strong>Explanation:</strong> ${escapeHtml(packet.sangyanAnalysis.riskExplanation)}</p>
  </div>

  <div class="section">
    <h2>5. User Statement & Unverified Claims</h2>
    <p style="font-size: 13px; font-weight: bold; margin-bottom: 4px;">User Statements:</p>
    <ul>
      ${packet.userStatements.map((u) => `<li>${escapeHtml(u)}</li>`).join('')}
    </ul>
    <p style="font-size: 13px; font-weight: bold; margin-top: 8px; margin-bottom: 4px;">Unverified Claims & Uncertainty:</p>
    <ul>
      ${packet.unverifiedClaims.concat(packet.uncertainty).map((uc) => `<li>${escapeHtml(uc)}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2>6. Suggested Statutory Authorities & Channels</h2>
    ${routesHtml || '<p>No specific authority routed.</p>'}
  </div>

  <div class="section">
    <h2>7. Export Integrity Verification</h2>
    <p class="hash">SHA-256 Content Hash: ${escapeHtml(packet.exportIntegrityHash)}</p>
  </div>
</body>
</html>`;
}

/**
 * Generates clean Plaintext export.
 */
export function exportToPlainText(packet: CanonicalReportPacket): string {
  const lines: string[] = [];

  lines.push('================================================================');
  lines.push(`⚠️ ${packet.submissionNotice.toUpperCase()}`);
  lines.push('================================================================');
  lines.push('SANGYAN CITIZEN INCIDENT REVIEW PACKET');
  lines.push(`Generated: ${packet.generatedAt}`);
  lines.push(`Report Version: ${packet.reportVersion}`);
  lines.push(`Jurisdiction: ${packet.jurisdiction}`);
  lines.push(`Locale: ${packet.locale}`);
  lines.push('----------------------------------------------------------------');
  lines.push('');

  lines.push('1. OBSERVED FACTS');
  packet.observedFacts.forEach((f) => lines.push(`  * ${f}`));
  lines.push('');

  lines.push('2. SENDER CLAIMS & DEMANDS');
  lines.push('  Observed Claims:');
  packet.observedClaims.forEach((c) => lines.push(`    - ${c}`));
  lines.push('  Observed Requests:');
  packet.observedRequests.forEach((r) => lines.push(`    - ${r}`));
  lines.push('');

  lines.push('3. OBSERVED URLS & PAYMENT DETAILS');
  lines.push('  URLs:');
  packet.urls.forEach((u) => lines.push(`    - ${u.fullUrl} (Domain: ${u.domain})`));
  lines.push('  Payments:');
  packet.paymentDetails.forEach((p) => lines.push(`    - ${p.handleOrAccount}: ₹${p.amount || 0} (${p.paymentMethod || 'N/A'})`));
  lines.push('');

  lines.push('4. SANGYAN ANALYSIS');
  lines.push(`  Risk Level: ${packet.sangyanAnalysis.riskBand}`);
  lines.push(`  Confidence: ${Math.round(packet.sangyanAnalysis.confidence * 100)}%`);
  lines.push(`  Explanation: ${packet.sangyanAnalysis.riskExplanation}`);
  lines.push('');

  lines.push('5. USER STATEMENTS & UNVERIFIED CLAIMS');
  lines.push('  User Statements:');
  packet.userStatements.forEach((u) => lines.push(`    - ${u}`));
  lines.push('  Unverified / Uncertainty:');
  packet.unverifiedClaims.concat(packet.uncertainty).forEach((uc) => lines.push(`    - ${uc}`));
  lines.push('');

  lines.push('6. SUGGESTED AUTHORITIES & OFFICIAL CHANNELS');
  packet.authorityRoutes.routes.forEach((r, idx) => {
    lines.push(`  ${idx + 1}. ${r.name} (${r.jurisdiction})`);
    lines.push(`     Scope: ${r.scope}`);
    lines.push(`     Reason: ${r.reason}`);
    lines.push(`     Guidance: ${r.actionGuidance}`);
    if (r.source_url) {
      lines.push(`     Official Portal: ${r.source_url}`);
    } else {
      lines.push('     Official Portal: I can\'t verify this authority contact from the available source material.');
    }
  });
  lines.push('');

  lines.push('7. EXPORT INTEGRITY HASH');
  lines.push(`  SHA-256: ${packet.exportIntegrityHash}`);
  lines.push('================================================================');

  return lines.join('\n');
}

/**
 * Generates JSON string export.
 */
export function exportToJson(packet: CanonicalReportPacket): string {
  return JSON.stringify(packet, null, 2);
}
