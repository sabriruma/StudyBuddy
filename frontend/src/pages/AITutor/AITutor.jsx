import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import useAITutor from './useAITutor';
import { formatAIResponse } from './formatAI';

export default function AITutor() {
  const [input, setInput] = useState('');
  const { messages, isLoading, error, sendMessage } = useAITutor();

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userInput = input.trim();
      setInput(''); // Clear input immediately
      await sendMessage(userInput);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Main content */}
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-2xl rounded-lg p-4 text-sm ${
                msg.sender === 'user'
                  ? 'bg-teal-100 dark:bg-teal-900 text-teal-900 dark:text-teal-100'
                  : msg.sender === 'error'
                  ? 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}>
                {msg.sender === 'ai' ? (
                  <div className="formatted-response">
                    {formatAIResponse(msg.text)}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg px-4 py-2 text-sm">
                Error: {error}
              </div>
            </div>
          )}
        </div>

        {/* DeepSeek Style Input Bar */}
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center px-4 py-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-base resize-none min-h-[24px] max-h-32 overflow-y-auto"
                  placeholder="Message StudyBuddy"
                  style={{
                    height: 'auto',
                    minHeight: '24px'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="ml-3 w-8 h-8 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:opacity-50 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0"
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