import officialAlertsData from '../../../data/official_alerts.json';

export interface OfficialAlert {
  id: string;
  title: string;
  publisher: string;
  source_url: string;
  published_at: string;
  verified_at: string;
  aliases: string[];
  summary: string;
}

export interface AlertMatch {
  alertId: string;
  title: string;
  publisher: string;
  sourceUrl: string;
  publishedAt: string;
  verifiedAt: string;
  matchedAlias: string;
  summary: string;
}

export function matchOfficialAlerts(text: string): AlertMatch[] {
  if (!text || typeof text !== 'string') return [];
  const lowerText = text.toLowerCase();
  const matches: AlertMatch[] = [];

  const alerts = officialAlertsData as OfficialAlert[];

  for (const alert of alerts) {
    for (const alias of alert.aliases) {
      const lowerAlias = alias.toLowerCase();
      if (lowerText.includes(lowerAlias)) {
        matches.push({
          alertId: alert.id,
          title: alert.title,
          publisher: alert.publisher,
          sourceUrl: alert.source_url,
          publishedAt: alert.published_at,
          verifiedAt: alert.verified_at,
          matchedAlias: alias,
          summary: alert.summary,
        });
        break; // matched this alert
      }
    }
  }

  return matches;
}
