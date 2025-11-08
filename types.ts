
export interface BusinessInfo {
  name: string;
  tagline: string;
  industry: string;
  marketingGoal: string;
  contactInfo: string;
  services: string;
  callToAction: string;
  template: string; // template id
  aspectRatio: string;
  thinkingMode: boolean;
}

export type Template = {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // URL to a thumbnail image
};
