import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes, createGlobalStyle } from "styled-components";

interface VoiceTranscriberProps {
  onTranscriptReady?: (transcript: string) => void;
  buttonLabel?: string;
  placeholder?: string;
  variant?: 'default' | 'circular';
}

const VoiceTranscriber: React.FC<VoiceTranscriberProps> = ({
  onTranscriptReady,
  buttonLabel = "Answer with Voice",
  placeholder = "Your spoken answer will appear here...",
  variant = "default",
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Setup portal container on mount (SSR safe)
  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

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
        setShowReviewModal(true);
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

  const handleStartClick = () => {
    startRecording();
  };

  const handleUseTranscript = () => {
    if (onTranscriptReady && transcript.trim()) {
      onTranscriptReady(transcript.trim());
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setAudioUrl(null);
    setTranscript("");
    setError(null);
  };

  const handleReRecord = () => {
    setShowReviewModal(false);
    setAudioUrl(null);
    setTranscript("");
    setError(null);
    startRecording();
  };

  return (
    <>
      {/* Hide body scroll when recording */}
      {isRecording && <LockScroll />}
      
      {/* Main trigger button */}
      {variant === 'circular' ? (
        <CircularButton onClick={handleStartClick} type="button" disabled={isRecording}>
          <CircularMicIcon>🎙️</CircularMicIcon>
        </CircularButton>
      ) : (
        <VoiceButton onClick={handleStartClick} type="button" disabled={isRecording}>
          <MicIcon>🎙️</MicIcon>
          {buttonLabel}
        </VoiceButton>
      )}

      {/* Error message */}
      {error && !showReviewModal && <InlineError>{error}</InlineError>}

      {/* Floating Recording Indicator - rendered via portal */}
      {portalContainer && isRecording && createPortal(
        <FloatingRecorder>
          <RecordingDot />
          <RecordingTimer>{formatTime(recordingTime)}</RecordingTimer>
          <StopButton onClick={stopRecording} type="button">
            <StopIcon />
          </StopButton>
        </FloatingRecorder>,
        portalContainer
      )}

      {/* Review Modal - rendered via portal to ensure fixed positioning works */}
      {portalContainer && showReviewModal && createPortal(
        <ReviewModalOverlay onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <ReviewModalContent>
            <ReviewModalHeader>
              <ReviewModalTitle>Review Your Answer</ReviewModalTitle>
              <ReviewCloseButton onClick={handleCloseModal}>×</ReviewCloseButton>
            </ReviewModalHeader>
            
            <ReviewModalBody>
              {audioUrl && (
                <AudioSection>
                  <AudioPlayer controls src={audioUrl} />
                  {isTranscribing && (
                    <TranscribingStatus>
                      <Spinner />
                      Transcribing your voice...
                    </TranscribingStatus>
                  )}
                </AudioSection>
              )}

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <TranscriptSection>
                <TranscriptLabel>Transcript</TranscriptLabel>
                <TextArea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={4}
                  placeholder={placeholder}
                />
                <TranscriptHint>
                  Edit if needed, then tap Process to continue
                </TranscriptHint>
              </TranscriptSection>
            </ReviewModalBody>
            
            <ReviewModalFooter>
              <PrimaryButton
                onClick={handleUseTranscript}
                disabled={!transcript.trim() || isTranscribing}
              >
                {isTranscribing ? 'Transcribing...' : 'Process & Continue →'}
              </PrimaryButton>
              <SecondaryButton onClick={handleReRecord}>
                🎙️ Re-record
              </SecondaryButton>
            </ReviewModalFooter>
          </ReviewModalContent>
        </ReviewModalOverlay>,
        portalContainer
      )}
    </>
  );
};

export default VoiceTranscriber;

// Lock scroll when recording
const LockScroll = createGlobalStyle`
  body {
    overflow: hidden;
  }
`;

// Animations
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

// Styled Components
const VoiceButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  color: ${({ theme }) => theme.text};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px ${({ theme }) => theme.shadow};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CircularButton = styled.button`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 150%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px ${({ theme }) => theme.accent}44;
  margin: 0 auto;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 6px 28px ${({ theme }) => theme.accent}55;
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CircularMicIcon = styled.span`
  font-size: 1.75rem;
`;

const MicIcon = styled.span`
  font-size: 1.1rem;
`;

const InlineError = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  margin-top: 0.75rem;
  text-align: center;
`;

// Floating Recording Indicator
const FloatingRecorder = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 100px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  z-index: 9999;
  animation: ${slideIn} 0.3s ease-out;
`;

const RecordingDot = styled.div`
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  animation: ${pulse} 1.2s ease-in-out infinite;
`;

const RecordingTimer = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  min-width: 50px;
`;

const StopButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ef4444;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const StopIcon = styled.div`
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 3px;
`;

const AudioSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  max-width: 300px;
`;

const TranscribingStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.accent};
  font-style: italic;
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid ${({ theme }) => theme.border};
  border-top-color: ${({ theme }) => theme.accent};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const TranscriptSection = styled.div`
  margin-top: 1rem;
`;

const TranscriptLabel = styled.label`
  display: block;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
`;

const TranscriptHint = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0.5rem 0 0 0;
  font-style: italic;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

// Custom Review Modal - centered on screen
const ReviewModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
`;

const ReviewModalContent = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 16px;
  width: calc(100% - 2rem);
  max-width: 420px;
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  margin: auto;
`;

const ReviewModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  flex-shrink: 0;
`;

const ReviewModalTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const ReviewCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1;
  padding: 0;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

const ReviewModalBody = styled.div`
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

const ReviewModalFooter = styled.div`
  padding: 1rem 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
`;

const SecondaryButton = styled.button`
  width: 100%;
  padding: 0.875rem 1.25rem;
  border-radius: 10px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.textSecondary};
  border: 1px solid ${({ theme }) => theme.border};
  
  &:hover {
    background: ${({ theme }) => theme.surface};
    color: ${({ theme }) => theme.text};
    border-color: ${({ theme }) => theme.text};
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 150%);
  color: white;
  border: none;
  box-shadow: 0 4px 16px ${({ theme }) => theme.accent}44;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${({ theme }) => theme.accent}55;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: none;
  min-height: 100px;
  max-height: 150px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
  
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
