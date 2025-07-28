import { useState } from 'react';
import { askAI } from '../../Services/api';

export default function useAITutor() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const systemPrompt = {
    role: "system",
    content: "You are a patient tutor. Explain concepts step-by-step. For math problems, show your work before giving the final answer."
  };

  const sendMessage = async (input) => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setIsLoading(true);
    setError(null);

    try {
      const data = await askAI([systemPrompt, userMessage]);
      setMessages(prev => [...prev, {
        text: data.choices[0].message.content,
        sender: 'ai'
      }]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, {
        text: "AI Service Error: Please try again later",
        sender: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, error, sendMessage };
}
