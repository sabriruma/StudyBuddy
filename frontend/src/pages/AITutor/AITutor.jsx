import { useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function AITutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    if (input.trim()) {
      // Add user message
      setMessages(prev => [...prev, { sender: 'user', text: input.trim() }]);
      setIsLoading(true);
      
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'ai', text: 'This is a sample AI response to demonstrate the chat interface.' }]);
        setIsLoading(false);
      }, 1000);
      
      setInput('');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Main content */}
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md rounded-lg p-4 text-sm ${
                msg.sender === 'user'
                  ? 'bg-teal-100 dark:bg-teal-900'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>

        {/* DeepSeek Style Input Bar */}
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center px-4 py-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-base"
                  placeholder="Message StudyBuddy"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="ml-3 w-8 h-8 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:opacity-50 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <ArrowUp className="w-4 h-4 text-gray-700 dark:text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}