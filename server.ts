/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.json());

// Server-side Gemini initialization with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/explain-alert', async (req, res) => {
  try {
    const { indicators, triggeredFlags = [], status = 'WATCH' } = req.body || {};

    const flagsList = Array.isArray(triggeredFlags) ? triggeredFlags : [];
    const flagsSummary = flagsList.length > 0 
      ? flagsList.map((f: { name?: string; reason?: string }) => `${f.name || 'Flag'}: ${f.reason || 'Triggered'}`).join('; ')
      : 'None (Nominal baseline)';

    // Offline / No Key Fallback
    if (!process.env.GEMINI_API_KEY) {
      const fallbackText = `Active telemetry records ${flagsList.length} alert indicator(s) under current status ${status}. Soil and atmospheric metrics reflect localized moisture depletion which may represent micro-site variation rather than broad canopy distress. These automated readings require manual on-site corroboration before any operational response is planned.\n\nSuggested field check: Verify physical probe soil contact at 45cm depth, check module supply voltage, and conduct a visual ground-truth dryness assessment.`;
      return res.json({
        explanation: fallbackText,
        isFallback: true,
      });
    }

    const prompt = `Indicator values:
- Soil moisture: ${indicators?.soilPct ?? 28}% (raw ADC: ${indicators?.soilRaw ?? 2200})
- Air temperature: ${indicators?.tempC ?? 29}°C
- Air humidity: ${indicators?.humidityPct ?? 48}%
- 14-day rainfall: ${indicators?.rain14dMm ?? 4.2} mm
- NDVI anomaly: ${indicators?.ndviAnomaly !== null && indicators?.ndviAnomaly !== undefined ? indicators.ndviAnomaly : 'No clear pass'}
- Active Status: ${status}
- Triggered Flags: ${flagsSummary}`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "You explain forest-stress indicators for field teams in 3 plain sentences plus one suggested field check. Never claim a forest is dying or that fire will occur. State uncertainty. Recommend human review.",
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 6500)
    );

    const response = (await Promise.race([generatePromise, timeoutPromise])) as { text?: string };

    const text = response.text || '';
    return res.json({
      explanation: text,
      isFallback: false,
    });
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : 'API failure';
    console.error('Gemini explanation endpoint error:', errMessage);
    const flagsList = Array.isArray(req.body?.triggeredFlags) ? req.body.triggeredFlags : [];
    const fallbackText = `Telemetry currently records ${flagsList.length} active flag(s) under ${req.body?.status || 'WATCH'} classification. Observed environmental parameters show elevated evapotranspiration and reduced soil moisture that diverge from baseline. Because micro-site soil heterogeneity can introduce sensor bias, physical site confirmation is necessary.\n\nSuggested field check: Conduct a ground survey of leaf turgor and verify capacitive probe calibration.`;
    return res.json({
      explanation: fallbackText,
      isFallback: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
