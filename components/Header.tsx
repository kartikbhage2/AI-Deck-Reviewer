
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
        AI Deck Reviewer
      </h1>
      <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
        Get instant, expert feedback on your presentations. Improve clarity, strengthen your story, and present with confidence.
      </p>
    </header>
  );
};
