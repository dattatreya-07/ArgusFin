import { ParsedEmail } from '../email/types';
import { CanonicalInput } from '../scam/types';
import { analyzeScam } from '../scam/analyze';
import { extractEvidenceFromImage } from '../ocr/extract';

/**
 * Maps ParsedEmail object to CanonicalInput for unified scam decision engine.
 */
export function mapParsedEmailToCanonicalInput(parsed: ParsedEmail): CanonicalInput {
  const textParts: string[] = [];

  if (parsed.subject) {
    textParts.push(`Subject: ${parsed.subject}`);
  }
  if (parsed.sender.raw) {
    textParts.push(`From: ${parsed.sender.raw}`);
  }
  if (parsed.replyTo?.raw) {
    textParts.push(`Reply-To: ${parsed.replyTo.raw}`);
  }

  // Include sender & reply-to mismatch warnings as text context if present
  if (parsed.senderMismatch) {
    textParts.push(`[Signal: Display name claims authority brand but email address is generic]`);
  }
  if (parsed.replyToMismatch) {
    textParts.push(`[Signal: Reply-To domain differs from From domain]`);
  }

  // Include link destination mismatch signals if present
  const mismatchLinks = parsed.links.filter((l) => l.isMismatch);
  if (mismatchLinks.length > 0) {
    mismatchLinks.forEach((l) => {
      textParts.push(`[Signal Link Destination Mismatch: Visible text "${l.visibleText}" points to "${l.href}"]`);
    });
  }

  textParts.push(parsed.extractedText);

  const aggregatedText = textParts.join('\n\n');

  return {
    source: 'EMAIL',
    text: aggregatedText,
    urls: parsed.urls,
    metadata: {
      emailId: parsed.id,
      subject: parsed.subject,
      senderAddress: parsed.sender.address,
      senderDisplayName: parsed.sender.displayName,
      senderMismatch: parsed.senderMismatch,
      replyToMismatch: parsed.replyToMismatch,
      spfStatus: parsed.authResults.spf,
      dkimStatus: parsed.authResults.dkim,
      dmarcStatus: parsed.authResults.dmarc,
      linkCount: parsed.links.length,
      linkMismatchCount: mismatchLinks.length,
      attachmentCount: parsed.attachments.length,
      untrustedEvidence: true,
    },
    privacyStatus: parsed.privacyStatus,
    provenance: {
      timestamp: new Date().toISOString(),
      channelId: 'EMAIL_INTAKE_PIPELINE',
    },
  };
}

/**
 * Process image attachments through CORE-01F OCR & QR evidence pipeline.
 */
export async function processEmailImageAttachments(parsed: ParsedEmail): Promise<string[]> {
  const ocrTexts: string[] = [];

  for (const att of parsed.attachments) {
    if (att.mimeType.startsWith('image/') && (att.contentBuffer || att.contentBase64)) {
      const payload = att.contentBuffer || att.contentBase64 || '';
      const { validation, evidence } = await extractEvidenceFromImage(payload, {
        filename: att.filename,
        mimeType: att.mimeType,
      });

      if (validation.valid && evidence && evidence.ocrText) {
        ocrTexts.push(`[Attachment OCR (${att.filename})]: ${evidence.ocrText}`);
        if (evidence.extractedUrls.length > 0) {
          evidence.extractedUrls.forEach((u) => {
            if (!parsed.urls.includes(u)) {
              parsed.urls.push(u);
            }
          });
        }
      }
    }
  }

  return ocrTexts;
}

/**
 * Runs the unified scam analysis pipeline on a parsed email intake object.
 */
export async function analyzeEmailScam(parsed: ParsedEmail) {
  // 1. Process image attachments for OCR if present
  const attachmentOcrTexts = await processEmailImageAttachments(parsed);
  if (attachmentOcrTexts.length > 0) {
    parsed.extractedText = `${parsed.extractedText}\n\n${attachmentOcrTexts.join('\n\n')}`;
  }

  // 2. Map to canonical input and call analyzeScam()
  const canonicalInput = mapParsedEmailToCanonicalInput(parsed);
  const result = await analyzeScam(canonicalInput);

  // 3. Annotate result with email provenance and limitations
  return {
    ...result,
    emailProvenance: {
      emailId: parsed.id,
      subject: parsed.subject,
      senderAddress: parsed.sender.address,
      senderMismatch: parsed.senderMismatch,
      replyToMismatch: parsed.replyToMismatch,
      privacyStatus: parsed.privacyStatus,
    },
    limitations: [
      ...result.limitations,
      'Email headers and content are untrusted evidence and do not prove sender authenticity or authority authorization.',
    ],
  };
}
