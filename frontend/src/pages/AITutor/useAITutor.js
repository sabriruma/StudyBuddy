import { useState, useCallback } from 'react';
import { askAI } from '../../Services/api'; // Updated path assumption

export default function useAITutor() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const systemPrompt = {
    role: "system",
    content: "You are StudyBuddy, a patient and helpful AI tutor. Explain concepts step-by-step in a clear, encouraging way. For math problems, show your work before giving the final answer. Use examples when helpful. Keep responses concise but thorough."
  };

  const sendMessage = useCallback(async (input) => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    
    // Add user message to chat immediately
    setMessages(prev => [...prev, { text: input.trim(), sender: 'user' }]);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare conversation history for API
      const conversationHistory = messages
        .filter(msg => msg.sender !== 'error') // Don't include error messages in API call
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      // Send to API with system prompt + conversation history + new message
      const apiMessages = [systemPrompt, ...conversationHistory, userMessage];
      const data = await askAI(apiMessages);
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setMessages(prev => [...prev, {
          text: data.choices[0].message.content,
          sender: 'ai'
        }]);
      } else {
        throw new Error('Invalid response format from AI service');
      }
    } catch (err) {
      console.error('AI Tutor Error:', err);
      const errorMessage = err.message.includes('API service not configured') 
        ? 'AI service not configured. Please check your environment variables.'
        : err.message.includes('fetch')
        ? 'Network error. Please check your internet connection and try again.'
        : `AI service error: ${err.message}`;
      
      setError(errorMessage);
      setMessages(prev => [...prev, {
        text: errorMessage,
        sender: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { 
    messages, 
    isLoading, 
    error, 
    sendMessage,
    clearChat
  };
}