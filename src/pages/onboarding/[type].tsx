import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { Loading } from "@/components/Loading";
import VoiceTranscriber from "@/components/VoiceTranscriber";
import { blockTypeQuestions, BlockTypeConfig } from "@/data/template";

// Type definitions
interface ProcessedAnswer {
  question: string;
  answer: string;
  keyPoints: string[];
}

interface BlockSummary {
  name: string;
  tagline: string;
  description: string;
  targetAudience: string;
  coreFeatures: string[];
  nextSteps: string[];
}

interface FollowUpQuestion {
  id: string;
  question: string;
  context: string;
  type: 'single' | 'multi' | 'open';
  options?: string[];
}

interface FollowUpAnswer {
  questionId: string;
  question: string;
  answer: string | string[];
  skipped: boolean;
}

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

const APP_NAME = "Renaissance City";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.background};
  z-index: 10;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`;

const BlockTypeLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
`;

const Main = styled.main`
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 3rem;
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const pulseGlow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 15px rgba(167, 139, 250, 0.4)) drop-shadow(0 0 30px rgba(232, 121, 249, 0.2));
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(167, 139, 250, 0.6)) drop-shadow(0 0 50px rgba(232, 121, 249, 0.4));
  }
`;

const BlockImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: contain;
  animation: ${pulseGlow} 3s ease-in-out infinite;
  margin-bottom: 0.5rem;
`;

const Title = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem 0;
`;

const Subtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 auto;
  max-width: 450px;
  line-height: 1.5;
`;

const QuestionsCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 1.25rem;
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

const QuestionsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const QuestionItem = styled.div<{ $index: number }>`
  display: flex;
  gap: 0.75rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  animation: ${fadeIn} 0.3s ease-out ${({ $index }) => $index * 0.03}s both;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
`;

const QuestionNumber = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ theme }) => theme.accent}15;
  color: ${({ theme }) => theme.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  flex-shrink: 0;
`;

const QuestionText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
  margin: 0;
  line-height: 1.4;
`;

const Divider = styled.div`
  width: 50px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    ${({ theme }) => theme.accentGold},
    transparent
  );
  margin: 1.25rem auto;
`;

const RecordSection = styled.div`
  text-align: center;
  animation: ${fadeIn} 0.4s ease-out 0.2s both;
`;

const RecordTitle = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem 0;
`;

const RecordSubtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1.25rem 0;
`;

const ProcessingSection = styled.div`
  text-align: center;
  padding: 2rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${({ theme }) => theme.border};
  border-top-color: ${({ theme }) => theme.accent};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 0 auto 1rem;
`;

const ProcessingText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
`;

// Document Display Styles
const DocumentCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  overflow: hidden;
  animation: ${fadeIn} 0.4s ease-out;
`;

const DocumentHeader = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.accent}15 0%, ${({ theme }) => theme.accentGold}15 100%);
  padding: 1.25rem;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const DocumentTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem 0;
`;

const DocumentTagline = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.accent};
  font-style: italic;
  margin: 0;
`;

const DocumentBody = styled.div`
  padding: 1.25rem;
`;

const Section = styled.div`
  margin-bottom: 1.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 0.5rem 0;
`;

const SectionContent = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
  line-height: 1.5;
  margin: 0;
`;

const FeatureList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  line-height: 1.4;
  
  &::before {
    content: '✦';
    color: ${({ theme }) => theme.accent};
    flex-shrink: 0;
    font-size: 0.75rem;
  }
`;

const AnswerCard = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AnswerQuestion = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 0.375rem;
`;

const AnswerText = styled.div`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  line-height: 1.4;
`;

const KeyPoints = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
`;

const KeyPoint = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;
  background: ${({ theme }) => theme.accent}15;
  color: ${({ theme }) => theme.accent};
  border-radius: 100px;
`;

const NextStepsList = styled.ol`
  margin: 0;
  padding: 0 0 0 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const NextStepItem = styled.li`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  line-height: 1.4;
  
  &::marker {
    color: ${({ theme }) => theme.accent};
    font-weight: 600;
  }
`;

const FollowUpCard = styled.div<{ $index: number }>`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  animation: ${fadeIn} 0.3s ease-out ${({ $index }) => $index * 0.05}s both;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FollowUpQuestion = styled.div`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
  line-height: 1.4;
`;

const FollowUpContext = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 0.75rem;
  line-height: 1.4;
`;

const OptionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const OptionChip = styled.button<{ $selected?: boolean }>`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  background: ${({ $selected, theme }) => $selected ? theme.accent : theme.background};
  border: 1px solid ${({ $selected, theme }) => $selected ? theme.accent : theme.border};
  color: ${({ $selected, theme }) => $selected ? 'white' : theme.text};
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    background: ${({ $selected, theme }) => $selected ? theme.accent : `${theme.accent}15`};
  }
`;

const OpenTextInput = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: none;
  min-height: 80px;
  margin-bottom: 0.5rem;
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
  }
`;

const QuestionActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SkipButton = styled.button`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  
  &:hover {
    color: ${({ theme }) => theme.text};
    text-decoration: underline;
  }
`;

const SkippedBadge = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.textSecondary};
  background: ${({ theme }) => theme.background};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const SubmitSection = styled.div`
  margin-top: 1.5rem;
  text-align: center;
`;

const ProgressText = styled.p`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 1rem;
`;

// PRD Document Styles
const PRDCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  overflow: hidden;
  animation: ${fadeIn} 0.4s ease-out;
  margin-top: 1rem;
`;

const PRDHeader = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.accent}20 0%, ${({ theme }) => theme.accentGold}20 100%);
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const PRDTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem 0;
`;

const PRDMeta = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const PRDBody = styled.div`
  padding: 1.25rem;
`;

const PRDSection = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PRDSectionTitle = styled.h3`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const FeatureRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.border}50;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FeatureName = styled.div`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const FeatureDesc = styled.div`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.125rem;
`;

const PriorityBadge = styled.span<{ $priority: string }>`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;
  border-radius: 100px;
  flex-shrink: 0;
  margin-left: 0.5rem;
  
  ${({ $priority, theme }) => {
    switch ($priority) {
      case 'must-have':
        return `background: ${theme.accent}20; color: ${theme.accent};`;
      case 'should-have':
        return `background: ${theme.accentGold}20; color: ${theme.accentGold};`;
      default:
        return `background: ${theme.border}; color: ${theme.textSecondary};`;
    }
  }}
`;

const TimelineItem = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0;
`;

const TimelinePhase = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  min-width: 80px;
`;

const TimelineDesc = styled.div`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
`;

const RiskItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  
  &::before {
    content: '⚠️';
    font-size: 0.75rem;
    flex-shrink: 0;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $primary, theme }) => $primary ? `
    background: linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentGold} 150%);
    border: none;
    color: white;
    box-shadow: 0 4px 16px ${theme.accent}44;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px ${theme.accent}55;
    }
  ` : `
    background: transparent;
    border: 1px solid ${theme.border};
    color: ${theme.textSecondary};
    
    &:hover:not(:disabled) {
      border-color: ${theme.text};
      color: ${theme.text};
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 10px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  margin-top: 1rem;
  text-align: center;
`;

type ViewState = 'questions' | 'processing' | 'followup' | 'document';

const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const { type, name } = router.query;
  const { user, isLoading: isUserLoading } = useUser();
  
  // Local view state for UI
  const [viewState, setViewState] = useState<ViewState>('questions');
  const [transcript, setTranscript] = useState('');
  const [processedAnswers, setProcessedAnswers] = useState<ProcessedAnswer[]>([]);
  const [summary, setSummary] = useState<BlockSummary | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, FollowUpAnswer>>({});
  const [prd, setPrd] = useState<ProductRequirementsDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // App block state - stores the created block ID
  const [appBlockId, setAppBlockId] = useState<string | null>(null);
  const [blockSubmitted, setBlockSubmitted] = useState(false);
  const [submittingBlock, setSubmittingBlock] = useState(false);
  
  const blockType = type as string;
  const blockName = name as string;
  const blockId = router.query.blockId as string | undefined;
  const config: BlockTypeConfig | undefined = blockTypeQuestions[blockType];

  // Load existing block data if resuming
  useEffect(() => {
    const loadExistingBlock = async () => {
      if (blockId && !appBlockId) {
        try {
          const response = await fetch(`/api/app-blocks/${blockId}`);
          const data = await response.json();
          
          if (data.appBlock) {
            const block = data.appBlock;
            setAppBlockId(block.id);
            setBlockSubmitted(true);
            
            // Parse onboarding data if present
            if (block.onboardingData) {
              try {
                const onboardingData = JSON.parse(block.onboardingData);
                if (onboardingData.summary) setSummary(onboardingData.summary);
                if (onboardingData.processedAnswers) setProcessedAnswers(onboardingData.processedAnswers);
                if (onboardingData.followUpQuestions) setFollowUpQuestions(onboardingData.followUpQuestions);
                if (onboardingData.followUpAnswers) setFollowUpAnswers(onboardingData.followUpAnswers);
                if (onboardingData.prd) setPrd(onboardingData.prd);
              } catch (e) {
                console.error('Failed to parse onboarding data:', e);
              }
            }
            
            // Set view state based on onboarding stage
            if (block.onboardingStage === 'followup' && !prd) {
              setViewState('followup');
            } else if (block.onboardingStage === 'document' || prd) {
              setViewState('document');
            }
          }
        } catch (err) {
          console.error('Failed to load existing block:', err);
        }
      }
    };
    
    loadExistingBlock();
  }, [blockId, appBlockId]);

  // Create app block after initial questions are processed
  const submitAppBlock = useCallback(async () => {
    if (!summary || blockSubmitted || submittingBlock) {
      return;
    }

    setSubmittingBlock(true);

    try {
      const response = await fetch('/api/pending-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockName: blockName || summary.name,
          blockType,
          summary,
          processedAnswers,
        }),
      });

      const data = await response.json();

      if (data.success && data.appBlock) {
        setAppBlockId(data.appBlock.id);
        setBlockSubmitted(true);
        console.log('✅ App block created:', data.appBlock.id);
        
        // Update URL with block ID so user can resume
        router.replace(
          `/onboarding/${blockType}?name=${encodeURIComponent(blockName || summary.name)}&blockId=${data.appBlock.id}`,
          undefined,
          { shallow: true }
        );
      } else {
        console.error('Failed to create app block:', data.error);
      }
    } catch (err) {
      console.error('Error creating app block:', err);
    } finally {
      setSubmittingBlock(false);
    }
  }, [summary, blockName, blockType, processedAnswers, blockSubmitted, submittingBlock, router]);

  // Automatically create app block after initial questions are processed
  useEffect(() => {
    if (summary && processedAnswers.length > 0 && !blockSubmitted && !blockId) {
      submitAppBlock();
    }
  }, [summary, processedAnswers, blockSubmitted, blockId, submitAppBlock]);

  // Update block progress when PRD is generated
  useEffect(() => {
    const updateBlockProgress = async () => {
      if (appBlockId && prd) {
        try {
          await fetch('/api/pending-blocks', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appBlockId,
              onboardingStage: 'document',
              onboardingData: {
                summary,
                processedAnswers,
                followUpQuestions,
                followUpAnswers,
                prd,
              },
            }),
          });
          console.log('✅ Block progress updated with PRD');
        } catch (err) {
          console.error('Error updating block progress:', err);
        }
      }
    };
    
    updateBlockProgress();
  }, [appBlockId, prd, summary, processedAnswers, followUpQuestions, followUpAnswers]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    if (type && !blockTypeQuestions[type as string]) {
      router.push('/get-started');
    }
  }, [type, router]);

  if (isUserLoading || !config) {
    return <Loading text="Loading..." />;
  }

  if (!user) {
    return null;
  }

  const questions = config.questions;

  const processTranscript = async (transcriptText: string, isFollowUp = false, followUpData?: Record<string, FollowUpAnswer>) => {
    setViewState('processing');
    setError(null);
    
    try {
      // Format follow-up answers as text for the API
      let formattedFollowUps = '';
      if (isFollowUp && followUpData) {
        formattedFollowUps = Object.values(followUpData).map(fa => {
          if (fa.skipped) {
            return `Q: ${fa.question}\nA: [Skipped]`;
          }
          const answerText = Array.isArray(fa.answer) ? fa.answer.join(', ') : fa.answer;
          return `Q: ${fa.question}\nA: ${answerText}`;
        }).join('\n\n');
      }

      const response = await fetch('/api/process-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: isFollowUp ? formattedFollowUps : transcriptText,
          questions: isFollowUp ? followUpQuestions.map(q => q.question) : questions,
          blockType: config.name,
          blockName,
          isFollowUp,
          previousAnswers: isFollowUp ? processedAnswers : undefined,
          previousSummary: isFollowUp ? summary : undefined,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process answers');
      }

      if (isFollowUp) {
        // Merge follow-up answers with previous answers
        const newAnswers = data.answers || [];
        setProcessedAnswers(prev => [...prev, ...newAnswers]);
        setSummary(data.summary || summary);
        setPrd(data.prd || null);
        setFollowUpQuestions([]);
        setViewState('document');
      } else {
        setProcessedAnswers(data.answers || []);
        setSummary(data.summary || null);
        
        // If there are follow-up questions, show them
        if (data.followUpQuestions && data.followUpQuestions.length > 0) {
          setFollowUpQuestions(data.followUpQuestions);
          // Initialize follow-up answers state
          const initialAnswers: Record<string, FollowUpAnswer> = {};
          data.followUpQuestions.forEach((q: FollowUpQuestion) => {
            initialAnswers[q.id] = {
              questionId: q.id,
              question: q.question,
              answer: q.type === 'multi' ? [] : '',
              skipped: false,
            };
          });
          setFollowUpAnswers(initialAnswers);
          setViewState('followup');
        } else {
          setViewState('document');
        }
      }
    } catch (err) {
      console.error('Error processing transcript:', err);
      setError(err instanceof Error ? err.message : 'Failed to process answers');
      setViewState(isFollowUp ? 'followup' : 'questions');
    }
  };

  const handleVoiceTranscript = (newTranscript: string) => {
    const fullTranscript = transcript ? `${transcript}\n\n${newTranscript}` : newTranscript;
    setTranscript(fullTranscript);
    processTranscript(fullTranscript, false);
  };

  // Handle follow-up answer changes
  const handleFollowUpAnswer = (questionId: string, value: string | string[]) => {
    setFollowUpAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer: value,
        skipped: false,
      },
    }));
  };

  const handleSkipQuestion = (questionId: string) => {
    setFollowUpAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        skipped: true,
        answer: prev[questionId].answer,
      },
    }));
  };

  const handleToggleOption = (questionId: string, option: string, isMulti: boolean) => {
    setFollowUpAnswers(prev => {
      const current = prev[questionId];
      if (isMulti) {
        const currentArr = Array.isArray(current.answer) ? current.answer : [];
        const newAnswer = currentArr.includes(option)
          ? currentArr.filter(o => o !== option)
          : [...currentArr, option];
        return {
          ...prev,
          [questionId]: { ...current, answer: newAnswer, skipped: false },
        };
      } else {
        return {
          ...prev,
          [questionId]: { ...current, answer: option, skipped: false },
        };
      }
    });
  };

  const handleSubmitFollowUps = () => {
    processTranscript('', true, followUpAnswers);
  };

  const allQuestionsAnswered = () => {
    return followUpQuestions.every(q => {
      const answer = followUpAnswers[q.id];
      if (!answer) return false;
      if (answer.skipped) return true;
      if (q.type === 'multi') {
        return Array.isArray(answer.answer) && answer.answer.length > 0;
      }
      return answer.answer && (typeof answer.answer === 'string' ? answer.answer.trim() : true);
    });
  };

  const handleContinue = () => {
    if (appBlockId) {
      router.push(`/app-blocks/${appBlockId}`);
    } else {
      router.push('/app-blocks/new');
    }
  };

  const handleReRecord = () => {
    // Reset local state
    setTranscript('');
    setProcessedAnswers([]);
    setSummary(null);
    setFollowUpQuestions([]);
    setFollowUpAnswers({});
    setPrd(null);
    setViewState('questions');
    setBlockSubmitted(false);
    setAppBlockId(null);
  };

  return (
    <Container>
      <Head>
        <title>Shape Your {config.name} | {APP_NAME}</title>
        <meta name="description" content={`Define your ${config.name} for Renaissance City`} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Header>
        <BackLink href="/get-started">
          ← Back
        </BackLink>
        <BlockTypeLabel>
          <span>{config.icon}</span>
          {config.name}
        </BlockTypeLabel>
      </Header>

      <Main>
        {viewState === 'questions' && (
          <>
            <HeroSection>
              <BlockImage src="/app-block.png" alt="Your Block" />
              {blockName && <Title>{blockName}</Title>}
              <Subtitle>
                Think through these questions, then record your answers.
              </Subtitle>
            </HeroSection>

            <QuestionsCard>
              <QuestionsList>
                {questions.map((question, idx) => (
                  <QuestionItem key={idx} $index={idx}>
                    <QuestionNumber>{idx + 1}</QuestionNumber>
                    <QuestionText>{question}</QuestionText>
                  </QuestionItem>
                ))}
              </QuestionsList>

              <Divider />

              <RecordSection>
                <RecordTitle>Ready?</RecordTitle>
                <RecordSubtitle>
                  Talk through your answers naturally.
                </RecordSubtitle>
                <VoiceTranscriber
                  onTranscriptReady={handleVoiceTranscript}
                  placeholder="Your spoken answers will appear here..."
                  variant="circular"
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </RecordSection>
            </QuestionsCard>
          </>
        )}

        {viewState === 'processing' && (
          <>
            <HeroSection>
              <BlockImage src="/app-block.png" alt="Your Block" />
              {blockName && <Title>{blockName}</Title>}
              <Subtitle>Processing your answers...</Subtitle>
            </HeroSection>
            <ProcessingSection>
              <Spinner />
              <ProcessingText>Analyzing and building your blueprint...</ProcessingText>
            </ProcessingSection>
          </>
        )}

        {viewState === 'followup' && (
          <>
            <HeroSection>
              <BlockImage src="/app-block.png" alt="Your Block" />
              {blockName && <Title>{blockName}</Title>}
              <Subtitle>
                A few more details to finalize your block requirements.
              </Subtitle>
            </HeroSection>

            <QuestionsCard>
              {followUpQuestions.map((fq, idx) => {
                const answer = followUpAnswers[fq.id];
                const isSkipped = answer?.skipped;
                
                return (
                  <FollowUpCard key={fq.id} $index={idx}>
                    <FollowUpQuestion>
                      {idx + 1}. {fq.question}
                      {isSkipped && <SkippedBadge>Skipped</SkippedBadge>}
                    </FollowUpQuestion>
                    <FollowUpContext>{fq.context}</FollowUpContext>
                    
                    {!isSkipped && fq.type === 'open' && (
                      <OpenTextInput
                        value={typeof answer?.answer === 'string' ? answer.answer : ''}
                        onChange={(e) => handleFollowUpAnswer(fq.id, e.target.value)}
                        placeholder="Type your answer..."
                      />
                    )}
                    
                    {!isSkipped && (fq.type === 'single' || fq.type === 'multi') && fq.options && (
                      <OptionsRow>
                        {fq.options.map((opt, oidx) => {
                          const isSelected = fq.type === 'multi'
                            ? Array.isArray(answer?.answer) && answer.answer.includes(opt)
                            : answer?.answer === opt;
                          return (
                            <OptionChip
                              key={oidx}
                              type="button"
                              $selected={isSelected}
                              onClick={() => handleToggleOption(fq.id, opt, fq.type === 'multi')}
                            >
                              {opt}
                            </OptionChip>
                          );
                        })}
                      </OptionsRow>
                    )}
                    
                    {fq.type === 'multi' && !isSkipped && (
                      <FollowUpContext style={{ marginTop: '0.25rem', fontSize: '0.7rem' }}>
                        Select all that apply
                      </FollowUpContext>
                    )}
                    
                    <QuestionActions>
                      {!isSkipped ? (
                        <SkipButton type="button" onClick={() => handleSkipQuestion(fq.id)}>
                          Skip this question
                        </SkipButton>
                      ) : (
                        <SkipButton type="button" onClick={() => setFollowUpAnswers(prev => ({
                          ...prev,
                          [fq.id]: { ...prev[fq.id], skipped: false }
                        }))}>
                          Answer this question
                        </SkipButton>
                      )}
                    </QuestionActions>
                  </FollowUpCard>
                );
              })}

              <SubmitSection>
                <ProgressText>
                  {Object.values(followUpAnswers).filter(a => 
                    a.skipped || (Array.isArray(a.answer) ? a.answer.length > 0 : a.answer)
                  ).length} of {followUpQuestions.length} questions answered
                </ProgressText>
                <Button 
                  $primary 
                  onClick={handleSubmitFollowUps}
                  disabled={!allQuestionsAnswered()}
                >
                  Generate Requirements →
                </Button>
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </SubmitSection>
            </QuestionsCard>
          </>
        )}

        {viewState === 'document' && summary && (
          <>
            <HeroSection>
              <BlockImage src="/app-block.png" alt="Your Block" />
              {blockName && <Title>{blockName}</Title>}
              <Subtitle>
                {prd ? 'Your product requirements are ready.' : 'Review what we captured, then create your block.'}
              </Subtitle>
            </HeroSection>

            {/* Summary Card */}
            <DocumentCard>
              <DocumentHeader>
                <DocumentTitle>{summary.name}</DocumentTitle>
                <DocumentTagline>{summary.tagline}</DocumentTagline>
              </DocumentHeader>

              <DocumentBody>
                <Section>
                  <SectionTitle>About</SectionTitle>
                  <SectionContent>{summary.description}</SectionContent>
                </Section>

                <Section>
                  <SectionTitle>Audience</SectionTitle>
                  <SectionContent>{summary.targetAudience}</SectionContent>
                </Section>

                <Section>
                  <SectionTitle>Core Features</SectionTitle>
                  <FeatureList>
                    {summary.coreFeatures.map((feature, idx) => (
                      <FeatureItem key={idx}>{feature}</FeatureItem>
                    ))}
                  </FeatureList>
                </Section>
              </DocumentBody>
            </DocumentCard>

            {/* PRD Card - shown after follow-ups */}
            {prd && (
              <PRDCard>
                <PRDHeader>
                  <PRDTitle>{prd.title}</PRDTitle>
                  <PRDMeta>Version {prd.version} • {prd.createdAt}</PRDMeta>
                </PRDHeader>

                <PRDBody>
                  <PRDSection>
                    <PRDSectionTitle>Overview</PRDSectionTitle>
                    <SectionContent style={{ marginBottom: '0.5rem' }}>
                      <strong>Problem:</strong> {prd.overview.problemStatement}
                    </SectionContent>
                    <SectionContent>{prd.overview.description}</SectionContent>
                  </PRDSection>

                  <PRDSection>
                    <PRDSectionTitle>Target Audience</PRDSectionTitle>
                    <SectionContent style={{ marginBottom: '0.5rem' }}>
                      <strong>Primary:</strong> {prd.targetAudience.primary}
                    </SectionContent>
                    <KeyPoints style={{ marginBottom: '0.5rem' }}>
                      {prd.targetAudience.demographics.map((d, i) => (
                        <KeyPoint key={i}>{d}</KeyPoint>
                      ))}
                    </KeyPoints>
                    <SectionContent style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <strong>Pain Points:</strong> {prd.targetAudience.painPoints.join(' • ')}
                    </SectionContent>
                  </PRDSection>

                  <PRDSection>
                    <PRDSectionTitle>Features</PRDSectionTitle>
                    {prd.features.core.map((feature, idx) => (
                      <FeatureRow key={idx}>
                        <div>
                          <FeatureName>{feature.name}</FeatureName>
                          <FeatureDesc>{feature.description}</FeatureDesc>
                        </div>
                        <PriorityBadge $priority={feature.priority}>
                          {feature.priority}
                        </PriorityBadge>
                      </FeatureRow>
                    ))}
                    {prd.features.future.length > 0 && (
                      <SectionContent style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                        <strong>Future:</strong> {prd.features.future.join(' • ')}
                      </SectionContent>
                    )}
                  </PRDSection>

                  <PRDSection>
                    <PRDSectionTitle>Technical Requirements</PRDSectionTitle>
                    <FeatureList>
                      {prd.technicalRequirements.map((req, idx) => (
                        <FeatureItem key={idx}>{req}</FeatureItem>
                      ))}
                    </FeatureList>
                  </PRDSection>

                  <PRDSection>
                    <PRDSectionTitle>Success Metrics</PRDSectionTitle>
                    <FeatureList>
                      {prd.successMetrics.map((metric, idx) => (
                        <FeatureItem key={idx}>{metric}</FeatureItem>
                      ))}
                    </FeatureList>
                  </PRDSection>

                  <PRDSection>
                    <PRDSectionTitle>Timeline</PRDSectionTitle>
                    {prd.timeline.map((item, idx) => (
                      <TimelineItem key={idx}>
                        <TimelinePhase>{item.phase}</TimelinePhase>
                        <TimelineDesc>{item.description}</TimelineDesc>
                      </TimelineItem>
                    ))}
                  </PRDSection>

                  <PRDSection>
                    <PRDSectionTitle>Risks & Challenges</PRDSectionTitle>
                    {prd.risks.map((risk, idx) => (
                      <RiskItem key={idx}>{risk}</RiskItem>
                    ))}
                  </PRDSection>
                </PRDBody>
              </PRDCard>
            )}

            {/* Actions */}
            <ActionsRow style={{ marginTop: '1.5rem' }}>
              <Button onClick={handleReRecord}>
                Start Over
              </Button>
              <Button $primary onClick={handleContinue}>
                Create Block →
              </Button>
            </ActionsRow>
          </>
        )}
      </Main>
    </Container>
  );
};

export default OnboardingPage;
