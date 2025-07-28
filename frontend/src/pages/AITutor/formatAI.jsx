import React from 'react';

export const formatAIResponse = (text) => {
  let formatted = text;

  // Apply inline replacements with spans or strong tags
  formatted = formatted.replace(/\$([^$]+)\$/g, '<span class="math">$1</span>');
  formatted = formatted.replace(/Example:/g, '<div class="bg-yellow-50 p-2 rounded">Example:');
  formatted = formatted.replace(/(Step \d+:)/g, '<strong class="text-green-600 dark:text-green-400">$1</strong>');
  formatted = formatted.replace(/(So,|Therefore,|The answer is)/g, '<strong class="text-blue-600 dark:text-blue-400">$1</strong>');

  // Split into paragraphs
  const paragraphs = formatted
    .split('\n')
    .filter((line) => line.trim() !== '');

  // Return JSX with each paragraph inside its own <p>
  return paragraphs.map((paragraph, i) => (
    <p key={i} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: paragraph }} />
  ));
};
