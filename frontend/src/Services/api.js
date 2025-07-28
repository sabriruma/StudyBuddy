const getReferrer = () => {
  // Check if we're in a Vite environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Production on Vercel
    if (import.meta.env.MODE === 'production' || import.meta.env.PROD) {
      return import.meta.env.VITE_WEBSITE_URL || 
             import.meta.env.VITE_VERCEL_URL || 
             window.location.origin;
    }
    // Development
    return import.meta.env.VITE_WEBSITE_URL || 'https://studybuddy-one-chi.vercel.app/';
  }
  
  // Fallback for other environments
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  return 'https://studybuddy-one-chi.vercel.app/';
};

export const askAI = async (messages) => {
  const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  
  // Check for API key in multiple possible environment variables
  const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env) 
    ? (import.meta.env.VITE_OPENROUTER_KEY || 
       import.meta.env.VITE_OPENROUTER_API_KEY ||
       import.meta.env.OPENROUTER_API_KEY)
    : process.env.VITE_OPENROUTER_KEY || 
      process.env.OPENROUTER_API_KEY;
  
  if (!API_KEY) {
    console.error('Missing API key. Expected VITE_OPENROUTER_KEY in environment variables.');
    throw new Error('API service not configured - check your environment variables');
  }

  // Validate messages format
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Invalid messages format');
  }

  try {
    const referrer = getReferrer();
    console.log('Making API request with referrer:', referrer);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': referrer,
        'Content-Type': 'application/json',
        'X-Title': 'StudyBuddy AI Tutor'
      },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b-instruct",
        messages: messages,
        max_tokens: 800, // Increased for better responses
        temperature: 0.7, // Add some creativity while keeping responses helpful
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      let errorMessage = `API Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      
      // Handle specific error cases
      if (response.status === 401) {
        errorMessage = 'API authentication failed. Please check your API key.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      } else if (response.status >= 500) {
        errorMessage = 'AI service is temporarily unavailable. Please try again later.';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Validate response format
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error('Invalid response format from AI service');
    }
    
    if (!data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Empty response from AI service');
    }

    return data;
  } catch (error) {
    console.error('API Error Details:', {
      error: error.message,
      referrer: getReferrer(),
      mode: (typeof import.meta !== 'undefined' && import.meta.env) 
        ? import.meta.env.MODE 
        : 'unknown',
      timestamp: new Date().toISOString()
    });
    
    // Re-throw with more user-friendly message for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Please check your internet connection and try again.');
    }
    
    throw error;
  }
};