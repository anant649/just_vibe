
import React, { useState, useCallback, useEffect } from 'react';
import { BusinessInfoForm } from './components/BusinessInfoForm';
import { ImageDisplay } from './components/ImageDisplay';
import { Header } from './components/Header';
import { generateTemplateWithSuggestions, editBusinessImage, generateImageFromPrompt } from './services/geminiService';
import type { BusinessInfo, Template } from './types';
import { useHistoryState } from './hooks/useHistoryState';

// Placeholder images for templates from placehold.co
const templates: Template[] = [
  { id: 'business_card', name: 'Business Card', description: 'A classic business card layout.', thumbnail: 'https://placehold.co/400x250/1F2937/93C5FD?text=Business%0ACard' },
  { id: 'flyer', name: 'Flyer', description: 'A promotional flyer for events or services.', thumbnail: 'https://placehold.co/400x250/1F2937/93C5FD?text=Flyer' },
  { id: 'social_post', name: 'Social Media Post', description: 'A square post for platforms like Instagram.', thumbnail: 'https://placehold.co/400x250/1F2937/93C5FD?text=Social%0APost' },
];

const WandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-2.25-1.122H7.25a3 3 0 0 0-3 3v.004c0 .597.237 1.17.659 1.591l.245.245a3 3 0 0 0 4.242 0l.245-.245a3 3 0 0 0 .659-1.591v-.004a3 3 0 0 0-2.25-1.122h-.001Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.5a3 3 0 0 0-3 3v.004c0 .597.237 1.17.659 1.591l.245.245a3 3 0 0 0 4.242 0l.245-.245a3 3 0 0 0 .659-1.591v-.004a3 3 0 0 0-3-3h-.001Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25a3 3 0 0 1 3-3h.001a3 3 0 0 1 3 3v.004c0 .597-.237 1.17-.659 1.591l-.245.245a3 3 0 0 1-4.242 0L3.66 11.25a3 3 0 0 1-.659-1.591v-.004Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25a3 3 0 0 0-3-3h-.001a3 3 0 0 0-3 3v.004c0 .597.237 1.17.659 1.591l.245.245a3 3 0 0 0 4.242 0l.245-.245a3 3 0 0 0 .659-1.591v-.004Z" />
    </svg>
);

const DesignSuggestions: React.FC<{ suggestions: string | null }> = ({ suggestions }) => {
  if (!suggestions) return null;

  const formattedSuggestions = suggestions.split('\n').map((line, index) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <h4 key={index} className="font-bold text-cyan-300 mt-3 mb-1">{line.slice(2, -2)}</h4>;
    }
    if (line.trim() === '') return null;
    return <p key={index} className="mb-1">{line}</p>;
  }).filter(Boolean);

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-cyan-400 inline-flex items-center gap-2">
        <WandIcon className="w-6 h-6"/>
        AI Design Suggestions
      </h3>
      <div className="text-gray-300 text-sm space-y-2">
        {formattedSuggestions}
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${active ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
        {children}
    </button>
);


const App: React.FC = () => {
  const {
    state: businessInfo,
    setState: setBusinessInfo,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistoryState<BusinessInfo>({
    name: '',
    tagline: '',
    industry: 'Technology',
    marketingGoal: '',
    contactInfo: '',
    services: '',
    callToAction: '',
    template: '',
    aspectRatio: '16:9',
    thinkingMode: false,
  });

  const [activeTab, setActiveTab] = useState<'template' | 'image'>('template');

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [designSuggestions, setDesignSuggestions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Image Generator State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');

  const clearOutput = () => {
      setError(null);
      setGeneratedImage(null);
      setDesignSuggestions(null);
  };

  const handleInfoChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // @ts-ignore
    const finalValue = isCheckbox ? e.target.checked : value;
    setBusinessInfo({ ...businessInfo, [name]: finalValue });
  }, [businessInfo, setBusinessInfo]);

  const handleTemplateSelect = useCallback((templateId: string) => {
    setBusinessInfo({ ...businessInfo, template: templateId });
  }, [businessInfo, setBusinessInfo]);

  const handleTemplateSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessInfo.template) {
        setError("Please select a template before generating.");
        return;
    }
    clearOutput();
    setIsLoading(true);
    setLoadingMessage('Generating your design...');

    try {
      const { imageData, suggestions } = await generateTemplateWithSuggestions(businessInfo, templates);
      setGeneratedImage(imageData);
      setDesignSuggestions(suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [businessInfo]);
  
  const handleImageGenerateSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt) {
      setError("Please enter a prompt to generate an image.");
      return;
    }
    clearOutput();
    setIsLoading(true);
    setLoadingMessage('Generating your image...');
    
    try {
      const imageData = await generateImageFromPrompt(imagePrompt, imageAspectRatio);
      setGeneratedImage(imageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [imagePrompt, imageAspectRatio]);

  const handleImageEdit = useCallback(async (editPrompt: string) => {
    if (!generatedImage || !editPrompt) return;
    
    setIsEditing(true);
    setError(null);

    try {
        const editedImageData = await editBusinessImage(generatedImage, editPrompt);
        setGeneratedImage(editedImageData);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during editing.');
        console.error(err);
    } finally {
        setIsEditing(false);
    }
  }, [generatedImage]);

  const renderActiveTab = () => {
    switch(activeTab) {
        case 'template':
            return (
                <BusinessInfoForm
                    info={businessInfo}
                    onInfoChange={handleInfoChange}
                    onTemplateSelect={handleTemplateSelect}
                    onSubmit={handleTemplateSubmit}
                    isLoading={isLoading}
                    templates={templates}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />
            );
        case 'image':
            return (
                <form onSubmit={handleImageGenerateSubmit} className="space-y-5">
                    <h2 className="text-2xl font-bold mb-6 text-cyan-400">1. Create an Image</h2>
                    <div>
                        <label htmlFor="imagePrompt" className="block text-sm font-medium text-gray-300 mb-1">Prompt</label>
                        <textarea id="imagePrompt" value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} placeholder="e.g., A photorealistic image of a cat wearing a spacesuit on Mars" rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200" required />
                    </div>
                    <div>
                        <label htmlFor="imageAspectRatio" className="block text-sm font-medium text-gray-300 mb-1">Aspect Ratio</label>
                        <select id="imageAspectRatio" value={imageAspectRatio} onChange={(e) => setImageAspectRatio(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200">
                            <option value="1:1">1:1 (Square)</option>
                            <option value="16:9">16:9 (Widescreen)</option>
                            <option value="9:16">9:16 (Vertical)</option>
                            <option value="4:3">4:3 (Standard)</option>
                            <option value="3:4">3:4 (Portrait)</option>
                        </select>
                    </div>
                     <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-cyan-600 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg">Generate Image</button>
                </form>
            );
    }
  }


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 self-start">
            <div className="flex justify-center space-x-2 mb-6">
                <TabButton active={activeTab === 'template'} onClick={() => setActiveTab('template')}>Template Generator</TabButton>
                <TabButton active={activeTab === 'image'} onClick={() => setActiveTab('image')}>Image Generator</TabButton>
            </div>
            {renderActiveTab()}
          </div>
          <div className="flex flex-col gap-8">
             <div className="bg-gray-800 p-2 sm:p-4 rounded-xl shadow-2xl border border-gray-700 flex items-center justify-center min-h-[400px] lg:min-h-[500px] overflow-hidden">
                <ImageDisplay
                    imageData={generatedImage}
                    isLoading={isLoading}
                    loadingMessage={loadingMessage}
                    error={error}
                    onEdit={handleImageEdit}
                    isEditing={isEditing}
                />
             </div>
             {(isLoading || designSuggestions) && activeTab === 'template' && (
                <DesignSuggestions suggestions={isLoading ? "Generating suggestions..." : designSuggestions} />
             )}
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>Powered by Gemini API. Your AI-Powered Design Assistant.</p>
      </footer>
    </div>
  );
};

export default App;
