/**
 * ═══════════════════════════════════════════════════════════════
 *  Mubra AI 8.v1 — Vercel Serverless Function
 *  File: api/chat.js
 *  Runtime: Node.js 18.x (Vercel)
 *  API: Google Gemini 2.0 Flash
 * ═══════════════════════════════════════════════════════════════
 *
 *  DEPLOYMENT INSTRUCTIONS (Vercel):
 *  1. vercel env add GEMINI_API_KEY
 *  2. vercel deploy
 *
 *  LOCAL DEV:
 *  Create a .env.local file:  GEMINI_API_KEY=your_key_here
 *  Then run: vercel dev
 * ═══════════════════════════════════════════════════════════════
 */

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// ── System Instruction ────────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `
ඔබ "Mubra AI 8.v1" — ශ්‍රී ලංකාවේ G.C.E. A/L රසායනාස්ත්‍ර විෂය සඳහා නිපුණ, ලෙජන්ඩ් ගුරුවරයෙකි.

## ඔබේ අනන්‍යතාවය:
- නම: Mubra AI 8.v1
- Powered by: Mubra Webworks
- Main Sponsor: Mubra Trading
- ශ්‍රී ලංකාවේ A/L රසායනාස්ත්‍ර ශිෂ්‍යයන් සඳහා විශේෂිතයි

## භාෂා රීතිය (CRITICAL):
- **සෑම පිළිතුරක්ම සිංහල භාෂාවෙන් ලිවිය යුතුය** — ව්‍යතිරේකයක් නොමැත
- රසායනික සූත්‍ර (H₂SO₄, CH₄, KMnO₄ etc.) ඉංග්‍රීසියෙන් ලිවිය හැකිය
- KaTeX math notation භාවිත කරන්න: $H_2SO_4$, $K_p$, $\Delta G$ ආදිය
- ශිෂ්‍යයෙකු ඉංග්‍රීසියෙන් ඇසුවද, සිංහලෙන්ම පිළිතුරු දෙන්න
- Sinhala Unicode: නිවැරදිව ලියන්න

## ඥාන ක්ෂේත්‍රය:
**Organic Chemistry (ජෛව රසායනය):**
- Functional groups, naming (IUPAC), reactions (substitution, addition, elimination, oxidation, reduction)
- Hydrocarbons, alcohols, aldehydes, ketones, carboxylic acids, esters, amines, amides
- Reaction mechanisms (SN1, SN2, E1, E2)
- Polymer chemistry, benzene and aromatic compounds

**Inorganic Chemistry (අජෛව රසායනය):**
- Periodic table trends, s, p, d block elements
- Transition metals, coordination compounds
- Acids, bases, salts, oxides
- Sri Lankan A/L inorganic sections: Group I, II, VII chemistry
- Industrial processes: Haber, Contact, Solvay processes

**Physical Chemistry (භෞතික රසායනය):**
- Chemical equilibrium: $K_c$, $K_p$, Le Chatelier's principle
- Thermodynamics: $\Delta H$, $\Delta G$, $\Delta S$, Hess's law
- Electrochemistry: EMF, Nernst equation, electrolysis
- Chemical kinetics: rate laws, activation energy, Arrhenius equation
- Atomic structure, bonding, molecular geometry

## Past Papers & Marking Schemes:
- 1985–2025 A/L Chemistry past paper ප්‍රශ්නවලට marking scheme logic සඳහන් කරන්න
- 2-mark, 4-mark, 6-mark ලකුණු ලබා ගැනීමේ ක්‍රමය පැහැදිළි කරන්න
- A/L examiner's expectations ගැන දන්වන්න
- Common mistakes ගැන අවවාද කරන්න

## ගුරු ශෛලිය:
1. **උත්සාහජනක හා දිරිගන්වන** — "ශාබාශ්!", "හොඳ ප්‍රශ්නයකි!", "ඔබ හොඳින් කරනවා!" ආදිය
2. **Step-by-step** — සෑම පියවරක්ම පැහැදිළිව
3. **Memory tricks** — සිංහලෙන් mnemonics ලිව්ව
4. **Real-life examples** — ශ්‍රී ලාංකික සන්දර්භය සහිතව
5. **Exam tips** — "පරීක්ෂාවේදී ලකුණු ලබා ගැනීමේ ක්‍රමය..."

## Format රීති:
- Headers: ## සහ ### ලෙස
- Chemical equations: KaTeX: $CH_4 + 2O_2 \rightarrow CO_2 + 2H_2O$
- Bullet points: * ලෙස
- Important points: **bold** ලෙස
- Tables: markdown table format
- Structural formulas: ASCII art හෝ SMILES notation

## රූප (Image) විශ්ලේෂණය:
- ශිෂ්‍යයෙකු රූපයක් upload කළ විට, ඒ ගැන සිංහලෙන් විශ්ලේෂණය කරන්න
- Past paper questions, lab diagrams, molecular structures විශ්ලේෂණය
- Detailed marking scheme hints ලිව්ව

ඔබ ශ්‍රී ලංකාවේ A/L Chemistry ශිෂ්‍යයන්ගේ හොඳම ගුරුවරයා සහ සහකාරයා වෙන්න. ඔවුන් Z-score ඉහළ නංවා ගැනීමට, chemistry සාමාර්ථ ලබා ගැනීමට, university entrance ලබා ගැනීමට සහාය වෙන්න.
`;

// ── CORS Headers ─────────────────────────────────────────────────────────────
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

// ── Build Gemini Parts from history ─────────────────────────────────────────
function buildHistoryContents(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(h => h.role && h.parts)
    .map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: h.parts.map(p => {
        if (p.type === 'text') return { text: p.text };
        if (p.type === 'image') {
          return {
            inline_data: {
              mime_type: p.mimeType || 'image/jpeg',
              data: p.data
            }
          };
        }
        return { text: String(p) };
      })
    }));
}

// ── Main Handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).set(getCorsHeaders()).end();
  }

  // Set CORS on all responses
  Object.entries(getCorsHeaders()).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Validate API key
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('[Mubra AI] GEMINI_API_KEY environment variable not set.');
    return res.status(500).json({
      error: 'Server configuration error: API key not configured.'
    });
  }

  try {
    const { message, history, topic, image } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: 'Message or image is required.' });
    }

    // Build the current user message parts
    const currentParts = [];

    // Attach image if provided
    if (image && image.data && image.mimeType) {
      currentParts.push({
        inline_data: {
          mime_type: image.mimeType,
          data: image.data
        }
      });
    }

    // Build topic context prefix
    const topicMap = {
      organic:   'ජෛව රසායනය (Organic Chemistry)',
      inorganic: 'අජෛව රසායනය (Inorganic Chemistry)',
      physical:  'භෞතික රසායනය (Physical Chemistry)'
    };
    const topicContext = topicMap[topic] || 'රසායනාස්ත්‍ර (Chemistry)';

    // Text message
    const userText = message
      ? `[විෂය ක්ෂේත්‍රය: ${topicContext}]\n\n${message}`
      : `[විෂය ක්ෂේත්‍රය: ${topicContext}]\n\nඉහත රූපය A/L Chemistry දෘෂ්ටිකෝණයෙන් විශ්ලේෂණය කරන්න.`;

    currentParts.push({ text: userText });

    // Build conversation history
    const historyContents = buildHistoryContents(history);

    // Construct Gemini API request body
    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      contents: [
        ...historyContents,
        {
          role: 'user',
          parts: currentParts
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        candidateCount: 1
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ]
    };

    // Call Gemini API
    const apiUrl = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error('[Mubra AI] Gemini API error:', geminiResponse.status, errorBody);

      // Parse meaningful error
      let errorMessage = `Gemini API error (${geminiResponse.status})`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.error?.message) errorMessage = parsed.error.message;
      } catch (_) {}

      return res.status(502).json({ error: errorMessage });
    }

    const geminiData = await geminiResponse.json();

    // Extract text from response
    const candidate = geminiData?.candidates?.[0];
    if (!candidate) {
      console.error('[Mubra AI] No candidates in Gemini response:', JSON.stringify(geminiData));
      return res.status(502).json({ error: 'Gemini returned no response candidates.' });
    }

    // Check for safety blocking
    if (candidate.finishReason === 'SAFETY') {
      return res.status(200).json({
        reply: 'ක්ෂමා වන්න, ඔබේ ප්‍රශ්නය සුරක්ෂිතතා රීති මගින් අවහිර කර ඇත. කරුණාකර ප්‍රශ්නය නැවත සකස් කරන්න.'
      });
    }

    const replyText = candidate?.content?.parts
      ?.filter(p => p.text)
      ?.map(p => p.text)
      ?.join('\n') || 'කරගත නොහැකිය. නැවත උත්සාහ කරන්න.';

    return res.status(200).json({ reply: replyText });

  } catch (err) {
    console.error('[Mubra AI] Unexpected error:', err);
    return res.status(500).json({
      error: `Internal server error: ${err.message}`
    });
  }
}
