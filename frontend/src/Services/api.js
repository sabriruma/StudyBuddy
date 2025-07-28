const getReferrer = () => {
  // Vite uses import.meta.env
  if (import.meta.env.MODE === 'production') {
    return import.meta.env.VITE_WEBSITE_URL || window.location.origin;
  }
  // need to change to vercel once integrated
  return 'http://localhost:5178';
};

export const askAI = async (messages) => {
  const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const API_KEY = import.meta.env.VITE_OPENROUTER_KEY;
  
  if (!API_KEY) {
    console.error('Missing API key');
    throw new Error('API service not configured - check your environment variables');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': getReferrer(),
        'Content-Type': 'application/json',
        'X-Title': 'StudyBuddy AI Tutor'
      },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b-instruct", // instruction model
        messages,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', {
      error: error.message,
      referrer: getReferrer(),
      mode: import.meta.env.MODE
    });
    throw new Error(`AI service error: ${error.message}`);
  }
};