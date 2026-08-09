export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send({ error: 'Method Not Allowed' });

  const { promptText, imageBase64 } = req.body;
  const apiKey = process.env.VITE_GEMINI_API_KEY; 

  try {
    const contents = [{ parts: [{ text: promptText }] }];
    
    if (imageBase64) {
      contents[0].parts.push({
        inlineData: { mimeType: "image/jpeg", data: imageBase64 }
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const aiText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ text: aiText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
