import React from 'react';

export const formatAIResponse = (text) => {
  if (!text || typeof text !== 'string') {
    return <p>No response available</p>;
  }

  let formatted = text;

  // Handle math expressions (LaTeX-style)
  formatted = formatted.replace(/\$([^$]+)\$/g, '<span class="math-inline font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</span>');
  
  // Handle code blocks
  formatted = formatted.replace(/```([^`]+)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto my-2"><code>$1</code></pre>');
  
  // Handle inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded font-mono text-sm">$1</code>');
  
  // Highlight important sections
  formatted = formatted.replace(/(Example:|Solution:|Answer:|Result:)/gi, '<strong class="text-blue-600 dark:text-blue-400 block mt-3 mb-1">$1</strong>');
  formatted = formatted.replace(/(Step \d+:)/g, '<strong class="text-green-600 dark:text-green-400">$1</strong>');
  formatted = formatted.replace(/(Therefore,|So,|Thus,|Hence,|In conclusion,)/gi, '<strong class="text-purple-600 dark:text-purple-400">$1</strong>');
  
  // Handle numbered lists
  formatted = formatted.replace(/^\d+\.\s/gm, '<span class="font-semibold text-gray-700 dark:text-gray-300">$&</span>');
  
  // Handle bullet points
  formatted = formatted.replace(/^[-•]\s/gm, '<span class="text-gray-600 dark:text-gray-400">•</span> ');

  // Split into paragraphs and handle line breaks
  const paragraphs = formatted
    .split('\n\n')
    .filter((paragraph) => paragraph.trim() !== '');

  // If there's only one paragraph but it contains line breaks, handle them
  if (paragraphs.length === 1 && paragraphs[0].includes('\n')) {
    const lines = paragraphs[0].split('\n').filter(line => line.trim() !== '');
    return (
      <div className="space-y-2">
        {lines.map((line, i) => (
          <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </div>
    );
  }

  // Return JSX with each paragraph inside its own <p>
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, i) => {
        // Check if this paragraph contains line breaks (for lists or steps)
        if (paragraph.includes('\n')) {
          const lines = paragraph.split('\n').filter(line => line.trim() !== '');
          return (
            <div key={i} className="space-y-1">
              {lines.map((line, j) => (
                <p key={j} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: line }} />
              ))}
            </div>
          );
        }
        
        return (
          <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph }} />
        );
      })}
    </div>
  );
};