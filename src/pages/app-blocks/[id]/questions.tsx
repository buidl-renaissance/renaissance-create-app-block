import React, { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useAppBlock, AppBlockWithInstallations } from '@/contexts/AppBlockContext';
import { Loading } from '@/components/Loading';
import VoiceTranscriber from '@/components/VoiceTranscriber';
import { blockTypeQuestions, BlockTypeConfig } from '@/data/template';

const APP_NAME = 'Renaissance City';

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

const pulseGlow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 15px rgba(167, 139, 250, 0.4)) drop-shadow(0 0 30px rgba(232, 121, 249, 0.2));
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(167, 139, 250, 0.6)) drop-shadow(0 0 50px rgba(232, 121, 249, 0.4));
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

const ProcessingContainer = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.background};
  z-index: 100;
`;

const ProcessingSection = styled.div`
  text-align: center;
  padding: 2rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const messageRotate = keyframes`
  0%, 100% {
    opacity: 0;
    transform: translateY(8px);
  }
  10%, 90% {
    opacity: 1;
    transform: translateY(0);
  }
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
  min-height: 1.5em;
  animation: ${messageRotate} 3s ease-in-out infinite;
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

// Follow-up styles
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
  margin-left: 0.5rem;
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

type ViewState = 'questions' | 'processing' | 'followup';

const QuestionsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: isUserLoading } = useUser();
  const { fetchAppBlock } = useAppBlock();
  
  const [appBlock, setAppBlock] = useState<AppBlockWithInstallations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewState, setViewState] = useState<ViewState>('questions');
  const [transcript, setTranscript] = useState('');
  const [processedAnswers, setProcessedAnswers] = useState<ProcessedAnswer[]>([]);
  const [summary, setSummary] = useState<BlockSummary | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, FollowUpAnswer>>({});
  const [error, setError] = useState<string | null>(null);
  const [processingMessageIndex, setProcessingMessageIndex] = useState(0);
  
  const processingMessages = [
    'Analyzing your responses...',
    'Identifying key themes and insights...',
    'Building your product blueprint...',
    'Crafting personalized recommendations...',
    'Defining core features...',
    'Structuring requirements...',
    'Almost there...',
  ];
  
  const blockType = appBlock?.blockType || '';
  const config: BlockTypeConfig | undefined = blockTypeQuestions[blockType];

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [isUserLoading, user, router]);

  // Rotate processing messages
  useEffect(() => {
    if (viewState !== 'processing') {
      setProcessingMessageIndex(0);
      return;
    }
    
    const interval = setInterval(() => {
      setProcessingMessageIndex(prev => 
        prev < processingMessages.length - 1 ? prev + 1 : prev
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, [viewState, processingMessages.length]);

  useEffect(() => {
    if (id && typeof id === 'string' && user) {
      setIsLoading(true);
      fetchAppBlock(id).then((block) => {
        setAppBlock(block);
        setIsLoading(false);
        
        // Check if block already has processed answers
        if (block?.onboardingData) {
          try {
            const data = JSON.parse(block.onboardingData);
            if (data.processedAnswers?.length > 0) {
              setProcessedAnswers(data.processedAnswers);
            }
            if (data.summary) {
              setSummary(data.summary);
            }
            if (data.followUpQuestions?.length > 0) {
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
              setFollowUpAnswers(data.followUpAnswers || initialAnswers);
              setViewState('followup');
            }
            if (data.prd) {
              // Already has PRD, redirect to block page
              router.push(`/app-blocks/${id}`);
            }
          } catch (e) {
            console.error('Failed to parse onboarding data:', e);
          }
        }
      });
    }
  }, [id, user, fetchAppBlock, router]);

  const processTranscript = async (transcriptText: string, isFollowUp = false, followUpData?: Record<string, FollowUpAnswer>) => {
    if (!appBlock || !config) return;
    
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
          questions: isFollowUp ? followUpQuestions.map(q => q.question) : config.questions,
          blockType: config.name,
          blockName: appBlock.name,
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
        // Update block with PRD
        await updateBlockProgress({
          onboardingStage: 'document',
          onboardingData: {
            summary: data.summary || summary,
            processedAnswers: [...processedAnswers, ...(data.answers || [])],
            followUpQuestions,
            followUpAnswers: followUpData,
            prd: data.prd,
          },
        });
        
        // Redirect to PRD page to review the generated document
        router.push(`/app-blocks/${appBlock.id}/prd`);
      } else {
        setProcessedAnswers(data.answers || []);
        setSummary(data.summary || null);
        
        // Update block with progress
        await updateBlockProgress({
          onboardingStage: 'followup',
          onboardingData: {
            summary: data.summary,
            processedAnswers: data.answers || [],
            followUpQuestions: data.followUpQuestions || [],
          },
        });
        
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
          // No follow-ups, redirect to block page
          router.push(`/app-blocks/${appBlock.id}`);
        }
      }
    } catch (err) {
      console.error('Error processing transcript:', err);
      setError(err instanceof Error ? err.message : 'Failed to process answers');
      setViewState(isFollowUp ? 'followup' : 'questions');
    }
  };

  const updateBlockProgress = async (data: { onboardingStage?: string; onboardingData?: object }) => {
    if (!appBlock) return;
    
    try {
      await fetch('/api/pending-blocks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appBlockId: appBlock.id,
          ...data,
        }),
      });
    } catch (err) {
      console.error('Error updating block progress:', err);
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

  if (isUserLoading || isLoading) {
    return <Loading text="Loading..." />;
  }

  if (!user || !appBlock) {
    return (
      <Container>
        <Header>
          <BackLink href="/dashboard">← Back</BackLink>
        </Header>
        <Main>
          <HeroSection>
            <Title>Block Not Found</Title>
          </HeroSection>
        </Main>
      </Container>
    );
  }

  if (!config) {
    return (
      <Container>
        <Header>
          <BackLink href={`/app-blocks/${appBlock.id}`}>← Back to {appBlock.name}</BackLink>
        </Header>
        <Main>
          <HeroSection>
            <Title>Unknown Block Type</Title>
            <Subtitle>This block type is not recognized.</Subtitle>
          </HeroSection>
        </Main>
      </Container>
    );
  }

  const questions = config.questions;

  return (
    <Container>
      <Head>
        <title>Questions - {appBlock.name} | {APP_NAME}</title>
        <meta name="description" content={`Define your ${config.name}`} />
      </Head>

      <Header>
        <BackLink href={`/app-blocks/${appBlock.id}`}>← Back</BackLink>
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
              <Title>{appBlock.name}</Title>
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
          <ProcessingContainer>
            <HeroSection>
              <BlockImage src="/app-block.png" alt="Your Block" />
              <Title>{appBlock.name}</Title>
              <Subtitle>Processing your answers...</Subtitle>
            </HeroSection>
            <ProcessingSection>
              <Spinner />
              <ProcessingText key={processingMessageIndex}>
                {processingMessages[processingMessageIndex]}
              </ProcessingText>
            </ProcessingSection>
          </ProcessingContainer>
        )}

        {viewState === 'followup' && (
          <>
            <HeroSection>
              <BlockImage src="/app-block.png" alt="Your Block" />
              <Title>{appBlock.name}</Title>
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
      </Main>
    </Container>
  );
};

export default QuestionsPage;
