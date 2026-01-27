import { WorkflowIntent } from '@/db/schema';

interface ProductRequirementsDocument {
  title: string;
  version: string;
  createdAt: string;
  overview: {
    name: string;
    tagline: string;
    description: string;
    problemStatement: string;
  };
  targetAudience: {
    primary: string;
    demographics: string[];
    painPoints: string[];
  };
  features: {
    core: { name: string; description: string; priority: 'must-have' | 'should-have' | 'nice-to-have' }[];
    future: string[];
  };
  technicalRequirements: string[];
  successMetrics: string[];
  timeline: { phase: string; description: string }[];
  risks: string[];
}

interface OnboardingData {
  summary?: {
    name: string;
    tagline: string;
    description: string;
    targetAudience: string;
    coreFeatures: string[];
    nextSteps: string[];
  };
  prd?: ProductRequirementsDocument;
}

interface BuildPromptOptions {
  intent: WorkflowIntent;
  customIntent?: string;
  userPrompt?: string;
  onboardingData: string | null;
  blockName: string;
  blockType: string | null;
}

/**
 * Parse onboarding data JSON string
 */
function parseOnboardingData(data: string | null): OnboardingData | null {
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Extract branding-relevant information from PRD
 */
function extractBrandingContext(prd: ProductRequirementsDocument | undefined, summary: OnboardingData['summary']): string {
  const lines: string[] = [];
  
  if (prd) {
    lines.push(`App Name: ${prd.overview.name}`);
    lines.push(`Tagline: ${prd.overview.tagline}`);
    lines.push(`Description: ${prd.overview.description}`);
    lines.push(`Target Audience: ${prd.targetAudience.primary}`);
  } else if (summary) {
    lines.push(`App Name: ${summary.name}`);
    lines.push(`Tagline: ${summary.tagline}`);
    lines.push(`Description: ${summary.description}`);
    lines.push(`Target Audience: ${summary.targetAudience}`);
  }
  
  return lines.join('\n');
}

/**
 * Extract features-relevant information from PRD
 */
function extractFeaturesContext(prd: ProductRequirementsDocument | undefined, summary: OnboardingData['summary']): string {
  const lines: string[] = [];
  
  if (prd) {
    lines.push('## Core Features');
    prd.features.core.forEach((feature, idx) => {
      lines.push(`${idx + 1}. ${feature.name} (${feature.priority})`);
      lines.push(`   ${feature.description}`);
    });
    
    if (prd.features.future.length > 0) {
      lines.push('\n## Future Features');
      prd.features.future.forEach((feature, idx) => {
        lines.push(`${idx + 1}. ${feature}`);
      });
    }
    
    if (prd.technicalRequirements.length > 0) {
      lines.push('\n## Technical Requirements');
      prd.technicalRequirements.forEach((req, idx) => {
        lines.push(`${idx + 1}. ${req}`);
      });
    }
  } else if (summary) {
    lines.push('## Core Features');
    summary.coreFeatures.forEach((feature, idx) => {
      lines.push(`${idx + 1}. ${feature}`);
    });
  }
  
  return lines.join('\n');
}

/**
 * Extract configuration-relevant information from PRD
 */
function extractConfigContext(prd: ProductRequirementsDocument | undefined, summary: OnboardingData['summary']): string {
  const lines: string[] = [];
  
  if (prd) {
    lines.push(`App Name: ${prd.overview.name}`);
    lines.push(`Problem Statement: ${prd.overview.problemStatement}`);
    
    if (prd.technicalRequirements.length > 0) {
      lines.push('\n## Technical Requirements');
      prd.technicalRequirements.forEach((req, idx) => {
        lines.push(`${idx + 1}. ${req}`);
      });
    }
    
    if (prd.successMetrics.length > 0) {
      lines.push('\n## Success Metrics');
      prd.successMetrics.forEach((metric, idx) => {
        lines.push(`${idx + 1}. ${metric}`);
      });
    }
  } else if (summary) {
    lines.push(`App Name: ${summary.name}`);
    lines.push(`Description: ${summary.description}`);
  }
  
  return lines.join('\n');
}

/**
 * Extract full build context from PRD (comprehensive)
 */
function extractFullBuildContext(prd: ProductRequirementsDocument | undefined, summary: OnboardingData['summary']): string {
  const lines: string[] = [];
  
  if (prd) {
    lines.push('# Product Requirements Document');
    lines.push(`\n## Overview`);
    lines.push(`Name: ${prd.overview.name}`);
    lines.push(`Tagline: ${prd.overview.tagline}`);
    lines.push(`Description: ${prd.overview.description}`);
    lines.push(`Problem Statement: ${prd.overview.problemStatement}`);
    
    lines.push(`\n## Target Audience`);
    lines.push(`Primary: ${prd.targetAudience.primary}`);
    lines.push(`Demographics: ${prd.targetAudience.demographics.join(', ')}`);
    lines.push(`Pain Points: ${prd.targetAudience.painPoints.join(', ')}`);
    
    lines.push(`\n## Core Features`);
    prd.features.core.forEach((feature, idx) => {
      lines.push(`${idx + 1}. ${feature.name} [${feature.priority}]`);
      lines.push(`   ${feature.description}`);
    });
    
    if (prd.features.future.length > 0) {
      lines.push(`\n## Future Features`);
      prd.features.future.forEach((feature, idx) => {
        lines.push(`${idx + 1}. ${feature}`);
      });
    }
    
    if (prd.technicalRequirements.length > 0) {
      lines.push(`\n## Technical Requirements`);
      prd.technicalRequirements.forEach((req, idx) => {
        lines.push(`${idx + 1}. ${req}`);
      });
    }
    
    if (prd.successMetrics.length > 0) {
      lines.push(`\n## Success Metrics`);
      prd.successMetrics.forEach((metric, idx) => {
        lines.push(`${idx + 1}. ${metric}`);
      });
    }
    
    if (prd.risks.length > 0) {
      lines.push(`\n## Risks`);
      prd.risks.forEach((risk, idx) => {
        lines.push(`${idx + 1}. ${risk}`);
      });
    }
  } else if (summary) {
    lines.push('# App Block Summary');
    lines.push(`\nName: ${summary.name}`);
    lines.push(`Tagline: ${summary.tagline}`);
    lines.push(`Description: ${summary.description}`);
    lines.push(`Target Audience: ${summary.targetAudience}`);
    
    lines.push(`\n## Core Features`);
    summary.coreFeatures.forEach((feature, idx) => {
      lines.push(`${idx + 1}. ${feature}`);
    });
    
    lines.push(`\n## Next Steps`);
    summary.nextSteps.forEach((step, idx) => {
      lines.push(`${idx + 1}. ${step}`);
    });
  }
  
  return lines.join('\n');
}

/**
 * Build a prompt for Ren.AI code changes based on intent type
 */
export function buildPromptForIntent(options: BuildPromptOptions): string {
  const { intent, customIntent, userPrompt, onboardingData, blockName, blockType } = options;
  
  const data = parseOnboardingData(onboardingData);
  const prd = data?.prd;
  const summary = data?.summary;
  
  const promptParts: string[] = [];
  
  // Add header with context
  promptParts.push(`# ${blockName}${blockType ? ` (${blockType})` : ''}`);
  promptParts.push('');
  
  // Add intent-specific context from PRD
  switch (intent) {
    case 'branding':
      promptParts.push('## Branding Context');
      promptParts.push(extractBrandingContext(prd, summary));
      promptParts.push('');
      promptParts.push('## Instructions');
      promptParts.push('Update the visual branding, styles, colors, and UI elements to match the app identity.');
      break;
      
    case 'features':
      promptParts.push('## Feature Requirements');
      promptParts.push(extractFeaturesContext(prd, summary));
      promptParts.push('');
      promptParts.push('## Instructions');
      promptParts.push('Implement or update features based on the requirements above.');
      break;
      
    case 'config':
      promptParts.push('## Configuration Context');
      promptParts.push(extractConfigContext(prd, summary));
      promptParts.push('');
      promptParts.push('## Instructions');
      promptParts.push('Update configuration, environment settings, and setup based on the requirements.');
      break;
      
    case 'full_build':
      promptParts.push(extractFullBuildContext(prd, summary));
      promptParts.push('');
      promptParts.push('## Instructions');
      promptParts.push('Build or update the complete application based on this PRD.');
      break;
      
    case 'custom':
      promptParts.push('## Custom Intent: ' + (customIntent || 'unspecified'));
      promptParts.push('');
      promptParts.push('## App Context');
      promptParts.push(extractFullBuildContext(prd, summary));
      promptParts.push('');
      promptParts.push('## Instructions');
      break;
  }
  
  // Add user-provided prompt if any
  if (userPrompt) {
    promptParts.push('');
    promptParts.push('## Additional Instructions');
    promptParts.push(userPrompt);
  }
  
  return promptParts.join('\n');
}

/**
 * Get a description for an intent type
 */
export function getIntentDescription(intent: WorkflowIntent): string {
  switch (intent) {
    case 'branding':
      return 'Update visual styling, colors, typography, and branding elements';
    case 'features':
      return 'Implement or update features based on PRD requirements';
    case 'config':
      return 'Update configuration, environment, and setup files';
    case 'full_build':
      return 'Complete build or major update based on full PRD';
    case 'custom':
      return 'Custom workflow with user-defined intent';
    default:
      return 'Unknown intent';
  }
}

/**
 * Get the default scope for an intent type
 */
export function getDefaultScopeForIntent(intent: WorkflowIntent): string {
  switch (intent) {
    case 'branding':
      return 'src/styles,src/theme,public,docs,README.md';
    case 'features':
      return 'src/components,src/pages,src/lib,src/utils';
    case 'config':
      return '.env.example,config,package.json,tsconfig.json';
    case 'full_build':
      return ''; // No scope restriction for full build
    case 'custom':
      return '';
    default:
      return '';
  }
}
