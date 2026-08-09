export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing on Vercel server.' });
  }

  try {
    const { promptText, imageBase64 } = req.body;

    const contents = [{
      parts: [{ text: promptText || "Explain this concept." }]
    }];

    if (imageBase64) {
      contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: imageBase64
        }
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || 'Google API rejected the request.' 
      });
    }

    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      const reason = candidate?.finishReason || 'UNKNOWN';
      return res.status(200).json({ 
        text: `AI Notice: The model returned an empty response. (Finish Reason: ${reason})` 
      });
    }

    return res.status(200).json({ text });

  } catch (error) {
    return res.status(500).json({ error: `Backend exception: ${error.message}` });
  }
}
