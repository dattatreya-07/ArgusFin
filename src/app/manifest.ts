import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Argus Fin — SANGYAN Investor Resilience',
    short_name: 'Argus Fin',
    description:
      'Bharat-first educational investor protection, claim verification, and yield reality checks grounded in official benchmarks',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF7F1',
    theme_color: '#B84E00',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    // Web Share Target API Specification for Android / PWA
    share_target: {
      action: '/check',
      method: 'GET',
      enctype: 'application/x-www-form-urlencoded',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
      },
    },
  } as any;
}
