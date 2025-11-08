
import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

type Shape = 'default' | 'circle' | 'arch' | 'blob';

interface ImageDisplayProps {
  imageData: string | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  onEdit: (prompt: string) => Promise<void>;
  isEditing: boolean;
}

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const ShapeButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${active ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
        {children}
    </button>
)

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageData, isLoading, loadingMessage, error, onEdit, isEditing }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [shape, setShape] = useState<Shape>('default');

  const imageUrl = imageData ? `data:image/png;base64,${imageData}` : null;
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPrompt.trim()) {
      onEdit(editPrompt);
    }
  };

  const shapeClasses: Record<Shape, string> = {
    default: 'rounded-lg',
    circle: 'rounded-full aspect-square',
    arch: '[clip-path:ellipse(120%_80%_at_50%_100%)]',
    blob: '[clip-path:polygon(41%_0,83%_14%,100%_59%,85%_96%,32%_100%,0_65%,3%_23%)]'
  };


  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-gray-300">{loadingMessage || 'Generating...'}</p>
        <p className="text-sm text-gray-500">This might take a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (imageUrl) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-4 p-4">
          <style>{`
            @keyframes gradient-animation {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .live-background {
              background: linear-gradient(-45deg, #13223d, #0f343b, #2c3e50, #1e3a4a);
              background-size: 400% 400%;
              animation: gradient-animation 15s ease infinite;
            }
          `}</style>
          <div className="w-full flex-grow relative flex items-center justify-center live-background rounded-xl p-2">
            <img src={imageUrl} alt="Generated Media" className={`max-w-full max-h-full h-auto object-contain transition-all duration-300 ${shapeClasses[shape]}`} style={{maxHeight: '450px'}}/>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
             <a
                href={imageUrl}
                download="generated-image.png"
                className="inline-flex items-center gap-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-700 transition duration-300"
            >
                <DownloadIcon className="w-5 h-5" />
                Download
            </a>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Shape:</span>
                <ShapeButton active={shape === 'default'} onClick={() => setShape('default')}>Default</ShapeButton>
                <ShapeButton active={shape === 'circle'} onClick={() => setShape('circle')}>Circle</ShapeButton>
                <ShapeButton active={shape === 'arch'} onClick={() => setShape('arch')}>Arch</ShapeButton>
                <ShapeButton active={shape === 'blob'} onClick={() => setShape('blob')}>Blob</ShapeButton>
            </div>
          </div>
          

          <div className="w-full max-w-lg pt-4 mt-4 border-t border-gray-700">
              <h4 className="text-lg font-semibold text-cyan-400 mb-3 text-center">Edit with AI</h4>
              <form onSubmit={handleEditSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g., Add a retro filter, make it black and white..."
                      className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                      disabled={isEditing}
                      aria-label="Image edit prompt"
                  />
                  <button
                      type="submit"
                      disabled={isEditing || !editPrompt.trim()}
                      className="flex justify-center items-center gap-2 bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 min-w-[120px]"
                  >
                      {isEditing ? (
                          <>
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Applying...
                          </>
                      ) : 'Apply Edit'}
                  </button>
              </form>
          </div>
        </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-500 p-4 border-2 border-dashed border-gray-600 rounded-lg">
      <ImageIcon className="w-16 h-16 mb-4 text-gray-600" />
      <h3 className="text-xl font-semibold text-gray-400">Your Generated Media</h3>
      <p className="mt-1">Your image will appear here.</p>
    </div>
  );
};
