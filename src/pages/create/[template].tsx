import React, { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import { defaultTemplates, templateQuestions, Template } from "@/data/template";
import { useUser } from "@/contexts/UserContext";
import { Loading } from "@/components/Loading";
import { Modal, ModalBody, ModalFooter, ModalButton, TextArea } from "@/components/Modal";

const APP_NAME = "Renaissance City";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { template } = context.query;
  const foundTemplate = defaultTemplates.find((t) => t.id === template);

  if (!foundTemplate) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      template: foundTemplate,
    },
  };
};

const TemplateCreatePage = ({ template }: { template: Template }) => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const questions =
    templateQuestions[template.id as keyof typeof templateQuestions] || [];

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [isUserLoading, user, router]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTranscribe = useCallback(async () => {
    if (audioChunksRef.current.length > 0) {
      setIsTranscribing(true);
      setError(null);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ audio: base64Audio }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.success && data.transcript) {
            setTranscript(data.transcript);
          } else {
            setError(data.error || 'Failed to transcribe audio');
          }
        } catch (err) {
          console.error('Error sending audio for transcription:', err);
          setError('Error transcribing audio. Please try again.');
        } finally {
          setIsTranscribing(false);
        }
      };
    }
  }, []);

  const startRecording = async () => {
    setError(null);
    setTranscript("");
    setAudioUrl(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        handleTranscribe();
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Unable to access microphone. Please grant permission and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSubmitTranscript = () => {
    // For now, just redirect to dashboard
    // In future, this could process the transcript and create a project
    router.push('/dashboard');
  };

  if (isUserLoading) {
    return <Loading text="Loading..." />;
  }

  if (!user) {
    return null;
  }

  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <Container>
      <Head>
        <title>{template.name} | {APP_NAME}</title>
        <meta
          name="description"
          content={`Start building: ${template.name}`}
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Header>
        <BackLink href="/get-started">
          ← Back
        </BackLink>
        <TemplateTag>{template.tag}</TemplateTag>
      </Header>

      <Main>
        <PageTitle>{template.name}</PageTitle>
        <PageSubtitle>{template.description}</PageSubtitle>

        <QuestionsCard>
          <QuestionsHeader>
            <QuestionsIcon>📋</QuestionsIcon>
            <QuestionsTitle>Question Guide</QuestionsTitle>
          </QuestionsHeader>
          <QuestionsSubtext>
            Answer these questions out loud to help clarify your vision
          </QuestionsSubtext>
          <QuestionsList>
            {questions.map((question, index) => (
              <QuestionItem key={index}>
                <QuestionNumber>{index + 1}</QuestionNumber>
                <QuestionText>{question}</QuestionText>
              </QuestionItem>
            ))}
          </QuestionsList>
        </QuestionsCard>

        <RecordingSection>
          {!isRecording && !audioUrl && (
            <>
              <RecordingPrompt>
                Tap to start recording your answers
              </RecordingPrompt>
              <RecordButton onClick={startRecording}>
                <MicIcon>🎙️</MicIcon>
              </RecordButton>
            </>
          )}

          {isRecording && (
            <RecordingActive>
              <RecordingIndicator>
                <PulsingDot />
                <RecordingTime>{formatTime(recordingTime)}</RecordingTime>
              </RecordingIndicator>
              <RecordingHint>Speak your answers clearly...</RecordingHint>
              <StopButton onClick={stopRecording}>
                <StopIcon />
                Stop Recording
              </StopButton>
            </RecordingActive>
          )}

          {audioUrl && !isRecording && (
            <ResultsSection>
              <AudioPlayer controls src={audioUrl} />
              
              {isTranscribing && (
                <TranscribingStatus>
                  <Spinner />
                  Transcribing your voice...
                </TranscribingStatus>
              )}

              {transcript && !isTranscribing && (
                <TranscriptSection>
                  <TranscriptLabel>Your Response</TranscriptLabel>
                  <TranscriptText
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={6}
                    placeholder="Your transcribed answers will appear here..."
                  />
                  <TranscriptHint>
                    Feel free to edit the transcript before continuing
                  </TranscriptHint>
                  
                  <ActionButtons>
                    <ActionButton $variant="secondary" onClick={startRecording}>
                      🎙️ Re-record
                    </ActionButton>
                    <ActionButton 
                      $variant="primary" 
                      onClick={handleSubmitTranscript}
                      disabled={!transcript.trim()}
                    >
                      Continue →
                    </ActionButton>
                  </ActionButtons>
                </TranscriptSection>
              )}
            </ResultsSection>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </RecordingSection>

        <ManualInputSection>
          <ManualInputButton onClick={() => setShowManualInput(true)}>
            ✏️ Type your answers instead
          </ManualInputButton>
        </ManualInputSection>

        <Modal 
          isOpen={showManualInput} 
          onClose={() => setShowManualInput(false)}
          title="Type Your Answers"
        >
          <ModalBody>
            <ModalInstructions>
              Answer the questions from the guide in your own words
            </ModalInstructions>
            <TextArea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={8}
              placeholder="Type your answers here..."
            />
          </ModalBody>
          <ModalFooter>
            <ModalButton onClick={() => setShowManualInput(false)}>
              Cancel
            </ModalButton>
            <ModalButton 
              $variant="primary" 
              onClick={() => {
                setShowManualInput(false);
                if (transcript.trim()) {
                  handleSubmitTranscript();
                }
              }}
              disabled={!transcript.trim()}
            >
              Continue →
            </ModalButton>
          </ModalFooter>
        </Modal>
      </Main>
    </Container>
  );
};

export default TemplateCreatePage;

// Animations
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

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.7;
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
`;

const Header = styled.header`
  width: 100%;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`;

const TemplateTag = styled.span`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.accent}22 0%,
    ${({ theme }) => theme.accentGold}22 100%
  );
  color: ${({ theme }) => theme.accent};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: 'Crimson Pro', Georgia, serif;
  border: 1px solid ${({ theme }) => theme.accent}33;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 1.5rem 4rem;
`;

const PageTitle = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem 0;
  text-align: center;
  animation: ${fadeIn} 0.4s ease-out;
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const PageSubtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.textSecondary};
  text-align: center;
  margin: 0 0 2rem 0;
  max-width: 500px;
  line-height: 1.6;
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

const QuestionsCard = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px ${({ theme }) => theme.shadow};
  animation: ${fadeIn} 0.5s ease-out 0.2s both;
`;

const QuestionsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const QuestionsIcon = styled.span`
  font-size: 1.25rem;
`;

const QuestionsTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const QuestionsSubtext = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1.25rem 0;
  font-style: italic;
`;

const QuestionsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const QuestionItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const QuestionNumber = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  background: ${({ theme }) => theme.accent}22;
  color: ${({ theme }) => theme.accent};
  border-radius: 50%;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.8rem;
  font-weight: 600;
`;

const QuestionText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  margin: 0;
  line-height: 1.5;
`;

const RecordingSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  animation: ${fadeIn} 0.5s ease-out 0.3s both;
`;

const RecordingPrompt = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const RecordButton = styled.button`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 150%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 6px 24px ${({ theme }) => theme.accent}44;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 32px ${({ theme }) => theme.accent}55;
  }
`;

const MicIcon = styled.span`
  font-size: 2.5rem;
`;

const RecordingActive = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
`;

const RecordingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PulsingDot = styled.div`
  width: 14px;
  height: 14px;
  background: #dc3545;
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const RecordingTime = styled.span`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const RecordingHint = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  font-style: italic;
  margin: 0;
`;

const StopButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.75rem;
  background: #dc3545;
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c82333;
  }
`;

const StopIcon = styled.div`
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 2px;
`;

const ResultsSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  max-width: 350px;
`;

const TranscribingStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.accent};
  font-style: italic;
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${({ theme }) => theme.border};
  border-top-color: ${({ theme }) => theme.accent};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const TranscriptSection = styled.div`
  width: 100%;
`;

const TranscriptLabel = styled.label`
  display: block;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.75rem;
`;

const TranscriptText = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 150px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    font-style: italic;
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent}22;
  }
`;

const TranscriptHint = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0.5rem 0 1.5rem 0;
  font-style: italic;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary'; disabled?: boolean }>`
  flex: 1;
  padding: 0.9rem 1.5rem;
  border-radius: 10px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  
  ${({ $variant, theme }) => $variant === 'primary' ? `
    background: linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentGold} 150%);
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px ${theme.accent}44;
    }
  ` : `
    background: transparent;
    color: ${theme.text};
    border: 1px solid ${theme.border};
    
    &:hover:not(:disabled) {
      border-color: ${theme.accent};
      color: ${theme.accent};
    }
  `}
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  width: 100%;
  text-align: center;
`;

const ManualInputSection = styled.div`
  animation: ${fadeIn} 0.5s ease-out 0.4s both;
`;

const ManualInputButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`;

const ModalInstructions = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1rem 0;
  font-style: italic;
`;
