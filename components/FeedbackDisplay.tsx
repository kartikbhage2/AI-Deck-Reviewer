
import React from 'react';

interface FeedbackDisplayProps {
  feedback: string;
}

interface ParsedSection {
    title: string;
    points: string[];
}

// Define a separate component for rendering a section to keep the main component clean
const FeedbackSection: React.FC<{ section: ParsedSection; isSummary: boolean }> = ({ section, isSummary }) => {
    return (
        <div className={`p-4 rounded-lg ${isSummary ? 'bg-indigo-900/30 border border-indigo-700' : 'bg-slate-900/40'}`}>
            <h3 className={`font-bold ${isSummary ? 'text-indigo-300 text-lg' : 'text-slate-300'}`}>
                {section.title}
            </h3>
            <ul className="mt-2 space-y-2 list-disc list-inside text-slate-300">
                {section.points.map((point, i) => (
                    <li key={i} className="leading-relaxed">{point}</li>
                ))}
            </ul>
        </div>
    );
};

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback }) => {
  const parseFeedback = (text: string): ParsedSection[] => {
    if (!text) return [];

    const sections: ParsedSection[] = [];
    const rawSections = text.split(/(?=Slide \d+:|Summary of Improvements:)/g);

    for (const rawSection of rawSections) {
        const trimmedSection = rawSection.trim();
        if (!trimmedSection) continue;
        
        const lines = trimmedSection.split('\n');
        const title = lines.shift()?.trim() || 'Feedback';
        const points = lines.map(line => line.replace(/^- /, '').trim()).filter(Boolean);
        
        sections.push({ title, points });
    }
    
    return sections;
  };

  const feedbackSections = parseFeedback(feedback);

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
      {feedbackSections.map((section, index) => {
          const isSummary = section.title.startsWith('Summary');
          return <FeedbackSection key={index} section={section} isSummary={isSummary} />;
      })}
    </div>
  );
};
