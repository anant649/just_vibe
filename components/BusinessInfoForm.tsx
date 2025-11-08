import React from 'react';
import type { BusinessInfo, Template } from '../types';

interface BusinessInfoFormProps {
  info: BusinessInfo;
  onInfoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onTemplateSelect: (templateId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  templates: Template[];
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const UndoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
);

const RedoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
    </svg>
);

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }> = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <input
      type="text"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
      required={name === 'name'}
    />
  </div>
);

const SelectField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] | {value: string, label: string}[] }> = ({ label, name, value, onChange, options }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
      >
        {options.map(option => typeof option === 'string' ? <option key={option} value={option}>{option}</option> : <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
);

const TextAreaField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder: string; rows?: number }> = ({ label, name, value, onChange, placeholder, rows=3 }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
      />
    </div>
);

const TemplateSelector: React.FC<{ templates: Template[], selectedTemplate: string, onSelect: (id: string) => void }> = ({ templates, selectedTemplate, onSelect }) => (
    <div>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">1. Select a Template</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {templates.map(template => (
                <div key={template.id} onClick={() => onSelect(template.id)} className={`cursor-pointer rounded-lg border-2 p-1.5 transition-all duration-200 ${selectedTemplate === template.id ? 'border-cyan-500 scale-105 shadow-lg bg-cyan-500/10' : 'border-gray-600 hover:border-cyan-600'}`}>
                    <img src={template.thumbnail} alt={template.name} className="w-full h-auto object-cover rounded-md aspect-[1.6/1]" />
                    <p className="text-center text-sm mt-2 font-semibold text-gray-200">{template.name}</p>
                </div>
            ))}
        </div>
    </div>
);


const ThinkingModeToggle: React.FC<{ checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ checked, onChange }) => (
    <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
        <div>
            <label htmlFor="thinkingMode" className="font-medium text-gray-200">
                Advanced Thinking Mode
            </label>
            <p className="text-xs text-gray-400">For complex requests. Uses a more powerful model.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="thinkingMode" name="thinkingMode" checked={checked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
    </div>
);


export const BusinessInfoForm: React.FC<BusinessInfoFormProps> = ({ info, onInfoChange, onTemplateSelect, onSubmit, isLoading, templates, onUndo, onRedo, canUndo, canRedo }) => {
  const industries = ["Technology", "Healthcare", "Finance", "Retail", "Education", "Real Estate", "Restaurant", "Consulting", "Creative Agency", "Fashion", "Travel"];
  const aspectRatios = [
    { value: "16:9", label: "16:9 (Widescreen)" },
    { value: "1:1", label: "1:1 (Square)" },
    { value: "9:16", label: "9:16 (Vertical)" },
    { value: "4:3", label: "4:3 (Standard)" },
    { value: "3:4", label: "3:4 (Portrait)" },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <TemplateSelector templates={templates} selectedTemplate={info.template} onSelect={onTemplateSelect} />

      <h2 className="text-2xl font-bold pt-4 border-t border-gray-700/50 text-cyan-400">2. Describe Your Business</h2>
      <InputField label="Business Name" name="name" value={info.name} onChange={onInfoChange} placeholder="e.g., Innovatech Solutions" />
      <InputField label="Tagline / Slogan" name="tagline" value={info.tagline} onChange={onInfoChange} placeholder="e.g., Engineering the Future" />
      <SelectField label="Industry" name="industry" value={info.industry} onChange={onInfoChange} options={industries} />
      
      <TextAreaField label="Services / Products" name="services" value={info.services} onChange={onInfoChange} placeholder="e.g., AI-driven analytics, Cloud solutions..." />
      <TextAreaField label="Contact Information" name="contactInfo" value={info.contactInfo} onChange={onInfoChange} placeholder="e.g., website.com, contact@website.com, 555-1234" />
      <InputField label="Call to Action" name="callToAction" value={info.callToAction} onChange={onInfoChange} placeholder="e.g., Visit Our Website Today!" />
      <TextAreaField label="Primary Marketing Goal" name="marketingGoal" value={info.marketingGoal} onChange={onInfoChange} placeholder="e.g., Attract new corporate clients, build brand awareness..." rows={2}/>

      <h2 className="text-2xl font-bold pt-4 border-t border-gray-700/50 text-cyan-400">3. Customize Output</h2>
      <SelectField label="Aspect Ratio" name="aspectRatio" value={info.aspectRatio} onChange={onInfoChange} options={aspectRatios} />
      <ThinkingModeToggle checked={info.thinkingMode} onChange={onInfoChange} />
      
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-700/50">
          <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              aria-label="Undo change"
          >
              <UndoIcon className="w-5 h-5" />
              Undo
          </button>
          <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              aria-label="Redo change"
          >
              Redo
              <RedoIcon className="w-5 h-5" />
          </button>
      </div>

      <button
        type="submit"
        disabled={isLoading || !info.template}
        className="w-full flex justify-center items-center gap-2 bg-cyan-600 text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : 'Generate & Get Suggestions'}
      </button>
       {!info.template && <p className="text-center text-sm text-yellow-500 -mt-2">Please select a template to begin.</p>}
    </form>
  );
};
