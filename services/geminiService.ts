
import { GoogleGenAI, Modality } from "@google/genai";
import type { BusinessInfo, Template } from '../types';

// API_KEY is expected to be set in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImageFromPrompt = async (prompt: string, aspectRatio: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error('No image was generated. The response may have been blocked.');
        }
    } catch (error) {
        console.error("Error generating image with Gemini API:", error);
        throw new Error('Failed to generate image. Please check your input for sensitive content or try again later.');
    }
};

const getTemplateDescription = (template: Template, info: BusinessInfo): string => {
    switch (template.id) {
        case 'business_card':
            return `A professional business card. It should feature the business name "${info.name}" prominently. A space for a logo should be in the top-left corner. The tagline "${info.tagline}" should be underneath the name. The contact information "${info.contactInfo}" should be at the bottom. The services "${info.services}" can be listed in a small section. The call to action is "${info.callToAction}". The design should be clean and professional.`;
        case 'flyer':
            return `A promotional A5 flyer. It should have a large, eye-catching headline, which is the business name "${info.name}". The tagline is "${info.tagline}". The flyer should list the services offered: "${info.services}". The contact details "${info.contactInfo}" and a strong call to action "${info.callToAction}" must be clearly visible at the bottom. A space for a logo should be present at the top.`;
        case 'social_post':
            return `A square social media post for platforms like Instagram. The design should be vibrant and engaging. The business name "${info.name}" and a space for a logo are key elements. The main message should revolve around the services: "${info.services}" or tagline: "${info.tagline}". Include the call to action "${info.callToAction}" clearly in the design. Contact info "${info.contactInfo}" can be smaller or omitted in favor of a website URL if provided.`;
        default:
            return `A professional brand image for ${info.name}.`;
    }
}

const generateBusinessImage = async (info: BusinessInfo, templates: Template[]): Promise<string> => {
  const selectedTemplate = templates.find(t => t.id === info.template);
  if (!selectedTemplate) {
      throw new Error("Invalid template selected.");
  }
  
  const templateLayoutDescription = getTemplateDescription(selectedTemplate, info);

  const prompt = `
    Create a professional, high-resolution, photorealistic brand asset based on the following template and business details.
    The final image should look like a professionally designed graphic, ready for print or digital use.
    Render the actual text provided, not placeholder text like "[Business Name]".
    
    Template: ${selectedTemplate.name}
    Layout Description: ${templateLayoutDescription}
    
    Business Details to incorporate:
    - Name: ${info.name}
    - Tagline: ${info.tagline}
    - Services: ${info.services}
    - Contact Info: ${info.contactInfo}
    - Call to Action: ${info.callToAction}
    
    Visual Style Guidance:
    - Industry: ${info.industry}. The style should reflect this (e.g., tech should be modern, healthcare should be trustworthy).
    - Marketing Goal: ${info.marketingGoal}. The visual tone should support this goal.
    - Leave a suitable space for a logo as described in the layout.
    
    The final image must be clean, modern, with legible text and a professional layout. Avoid garbled or nonsensical text.
  `;

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: info.aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    } else {
      throw new Error('No image was generated. The response may have been blocked.');
    }
  } catch (error) {
    console.error("Error generating image with Gemini API:", error);
    throw new Error('Failed to generate image. Please check your input for sensitive content or try again later.');
  }
};

const getDesignSuggestions = async (info: BusinessInfo): Promise<string> => {
    const prompt = `
        As an expert graphic designer, provide actionable design suggestions for a business in the "${info.industry}" industry.
        Their primary marketing goal is: "${info.marketingGoal}".
        Their business name is "${info.name}".

        Based on this information, provide clear recommendations. Format your response as a single string. Use "**Title**" for headings and newlines to separate paragraphs.
        
        **Color Palette:** Suggest a primary, secondary, and accent color with hex codes. Explain the psychology behind your choices.
        **Font Pairing:** Recommend a headline font and a body font. Explain why they work well together for this brand.
        **Imagery & Style:** Suggest the type of imagery or graphic style that would best represent their brand.
        **Layout Tips:** Give a general tip for arranging elements for their chosen template ("${info.template}").
    `;

    try {
        const model = info.thinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
        const config = info.thinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting design suggestions:", error);
        return "**Error**\nCould not retrieve design suggestions at this time.";
    }
}

export const generateTemplateWithSuggestions = async (info: BusinessInfo, templates: Template[]): Promise<{ imageData: string; suggestions: string; }> => {
    // Run these in parallel to speed things up.
    const [imageData, suggestions] = await Promise.all([
        generateBusinessImage(info, templates),
        getDesignSuggestions(info)
    ]);

    return { imageData, suggestions };
}

export const editBusinessImage = async (base64ImageData: string, prompt: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64ImageData,
                mimeType: 'image/png',
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
  
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
      
      throw new Error('No edited image was generated. The response may have been blocked.');
  
    } catch (error) {
      console.error("Error editing image with Gemini API:", error);
      throw new Error('Failed to edit image. Please check your prompt for sensitive content or try again later.');
    }
  };
