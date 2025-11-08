
import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

export const Header: React.FC = () => {
    return (
        <header className="text-center p-6 border-b border-gray-700/50 shadow-lg bg-gray-900">
            <div className="inline-flex items-center gap-3">
                <SparklesIcon className="w-8 h-8 text-cyan-400"/>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-teal-300 text-transparent bg-clip-text">
                    AI Design Assistant
                </h1>
            </div>
            <p className="mt-2 text-md text-gray-400 max-w-2xl mx-auto">
                Generate professional business templates and receive expert design advice, all powered by AI.
            </p>
        </header>
    );
};
