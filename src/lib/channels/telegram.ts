import { TelegramUpdate } from './types';
import { normalizeChannelInput } from './normalize';
import { checkChannelContent } from './service';
import { formatChannelResponse } from './formatters';
import { withTimeout, logAppEvent, generateRequestId } from '../observability';

export interface TelegramConfig {
  botToken?: string;
  webhookSecret?: string;
  baseUrl?: string;
}

export function getTelegramConfig(): TelegramConfig {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || undefined,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || undefined,
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://sangyan.in',
  };
}

/**
 * Validates whether an incoming webhook request has the correct Telegram secret token.
 */
export function verifyTelegramWebhookSecret(
  headerSecret: string | null,
  configuredSecret?: string
): boolean {
  if (!configuredSecret) return true; // If no secret configured, pass-through (dev/test)
  if (!headerSecret) return false;
  return headerSecret === configuredSecret;
}

/**
 * Sends a Markdown formatted response message to a Telegram chat using standard Bot API.
 */
export async function sendTelegramMessage(
  chatId: number,
  text: string,
  botToken: string,
  timeoutMs = 4000
): Promise<{ success: boolean; error?: string }> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    disable_web_page_preview: false,
  };

  try {
    const fetchPromise = fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const timeoutRes = await withTimeout(
      fetchPromise,
      timeoutMs,
      null,
      'Telegram_SendMessage'
    );

    if (timeoutRes.timedOut || !timeoutRes.result) {
      return { success: false, error: 'Telegram API timeout.' };
    }

    const res = timeoutRes.result;
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      return { success: false, error: `Telegram API error: ${res.status} ${errBody}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network exception' };
  }
}

/**
 * Processes an incoming Telegram update through the SANGYAN check pipeline.
 */
export async function handleTelegramUpdate(
  update: TelegramUpdate,
  config = getTelegramConfig()
): Promise<{ status: 'PROCESSED' | 'SKIPPED' | 'UNCONFIGURED' | 'ERROR'; reason?: string }> {
  const requestId = generateRequestId();

  if (!config.botToken) {
    logAppEvent({
      name: 'request_failed',
      requestId,
      subsystem: 'telegram',
      status: 'unavailable',
      errorCode: 'UNAVAILABLE',
    });
    return { status: 'UNCONFIGURED', reason: 'TELEGRAM_BOT_TOKEN is not configured.' };
  }

  const message = update.message;
  if (!message || !message.chat) {
    return { status: 'SKIPPED', reason: 'Update does not contain a supported message object.' };
  }

  const chatId = message.chat.id;
  const isGroup = message.chat.type === 'group' || message.chat.type === 'supergroup';

  // 1. Extract raw content
  const rawText = message.text || message.caption || '';
  if (!rawText.trim()) {
    return { status: 'SKIPPED', reason: 'Message contains no text or caption.' };
  }

  // 2. In groups, respond only when explicitly addressed
  if (isGroup) {
    const isCommand = rawText.startsWith('/check') || rawText.startsWith('/start') || rawText.startsWith('/sangyan');
    const mentionsBot = rawText.includes('@SangyanBot') || rawText.includes('@ArgusFinBot') || rawText.includes('@sangyan');
    if (!isCommand && !mentionsBot) {
      return { status: 'SKIPPED', reason: 'Group message was not addressed to bot.' };
    }
  }

  // Handle /start or help command
  if (rawText.trim() === '/start' || rawText.trim() === '/help') {
    const welcomeText = `🛡️ *Argus Fin / SANGYAN: Investor Protection Assistant*

Send or forward any suspicious investment promise, high-return scheme, WhatsApp message, or trading group pitch here.

Argus Fin will analyze the claim, detect red flags, calculate annualised return multiples vs RBI/SEBI benchmarks, and provide verified guidance.

*Privacy Note:* Your message is processed on-device / statelessly for this check. No phone numbers or chat contents are stored.

_Try forwarding a message like:_ "Invest ₹10,000 get ₹20,000 in 30 days guaranteed."`;

    await sendTelegramMessage(chatId, welcomeText, config.botToken);
    return { status: 'PROCESSED' };
  }

  // 3. Normalize input
  const normalized = normalizeChannelInput({
    channel: 'telegram',
    text: rawText,
    language: message.from?.language_code,
  });

  // 4. Run through shared core check service
  try {
    const checkResult = await checkChannelContent(normalized);

    // 5. Format compact channel response
    const channelResponse = formatChannelResponse(checkResult, config.baseUrl);

    // 6. Send reply to Telegram
    const sendResult = await sendTelegramMessage(chatId, channelResponse.formattedMarkdown, config.botToken);

    logAppEvent({
      name: 'request_completed',
      requestId,
      subsystem: 'telegram',
      status: sendResult.success ? 'success' : 'failure',
      language: normalized.language,
      durationMs: checkResult.durationMs,
    });

    return {
      status: sendResult.success ? 'PROCESSED' : 'ERROR',
      reason: sendResult.error,
    };
  } catch (err: any) {
    logAppEvent({
      name: 'request_failed',
      requestId,
      subsystem: 'telegram',
      status: 'failure',
      errorCode: 'INTERNAL_ERROR',
    });

    const errorReply = `⚠️ *Argus Fin / SANGYAN Check Unavailable*

We could not process this message right now. You can verify it directly on our web app:
🔗 ${config.baseUrl}/en/check`;

    await sendTelegramMessage(chatId, errorReply, config.botToken);
    return { status: 'ERROR', reason: err.message };
  }
}
