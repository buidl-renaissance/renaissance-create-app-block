import React, { useEffect, useState } from "react";
import Head from "next/head";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useAppBlock } from "@/contexts/AppBlockContext";
import { Loading } from "@/components/Loading";

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

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(167, 139, 250, 0.5)) drop-shadow(0 0 40px rgba(232, 121, 249, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(167, 139, 250, 0.7)) drop-shadow(0 0 60px rgba(232, 121, 249, 0.5));
  }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.background};
  padding: 2rem 1.5rem;
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 600px;
  width: 100%;
`;

// User Welcome Section
const UserSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  animation: ${scaleIn} 0.5s ease-out;
`;

const ProfileImageContainer = styled(Link)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.accentGold};
  background: ${({ theme }) => theme.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 24px ${({ theme }) => theme.shadow},
    inset 0 0 0 1px ${({ theme }) => theme.accent}22;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    border: 1px solid ${({ theme }) => theme.accentGold}40;
  }
  
  &:hover {
    transform: scale(1.05);
    border-color: ${({ theme }) => theme.accent};
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultAvatar = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.accent} 0%,
    ${({ theme }) => theme.accentGold} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  font-family: 'Cormorant Garamond', Georgia, serif;
`;

const Greeting = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.text};
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

// Block Content Section
const ContentSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
`;

const BlockImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem 0 1.5rem;
  animation: ${scaleIn} 0.6s ease-out 0.1s both;
`;

const BlockImage = styled.img`
  width: 160px;
  height: 160px;
  object-fit: contain;
  animation: ${pulseGlow} 3s ease-in-out infinite;
  
  @media (max-width: 480px) {
    width: 120px;
    height: 120px;
  }
`;

const SmallBlockImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: contain;
  animation: ${pulseGlow} 3s ease-in-out infinite;
  margin-bottom: 0.5rem;
`;

const BlockTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const BlockText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  max-width: 480px;
  line-height: 1.7;
  margin: 0;
`;

const Divider = styled.div`
  width: 60px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    ${({ theme }) => theme.accentGold},
    transparent
  );
  margin: 0.5rem 0;
`;

const NameInputSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 360px;
  animation: ${fadeIn} 0.5s ease-out 0.2s both;
  margin-top: 1.5rem;
`;

const NameInput = styled.input`
  width: 100%;
  padding: 1rem 1.25rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.surface};
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 
      0 0 0 4px ${({ theme }) => theme.glow || 'rgba(167, 139, 250, 0.2)'},
      0 0 30px ${({ theme }) => theme.glow || 'rgba(167, 139, 250, 0.2)'};
  }

  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    opacity: 0.5;
  }
`;

const ContinueButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 150%);
  border: none;
  border-radius: 12px;
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px ${({ theme }) => theme.glow || 'rgba(167, 139, 250, 0.3)'};
  margin-top: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px ${({ theme }) => theme.glowSecondary || 'rgba(232, 121, 249, 0.4)'};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

// Block Type Selection
const BlockTypeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  max-width: 440px;
  margin-top: 1.5rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const BlockTypeCard = styled.button<{ $index: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  background: ${({ theme }) => theme.surface};
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.4s ease-out ${({ $index }) => 0.1 + $index * 0.05}s both;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    transform: translateY(-4px);
    box-shadow: 0 8px 24px ${({ theme }) => theme.shadow};
  }
`;

const BlockTypeIcon = styled.span`
  font-size: 2rem;
`;

const BlockTypeName = styled.span`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const BlockTypeDesc = styled.span`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.4;
`;

const GetStartedPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { appBlocks, isLoading: isBlocksLoading, fetchAppBlocks } = useAppBlock();
  
  const [blockName, setBlockName] = useState('');
  const [isBlockClaimed, setIsBlockClaimed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [isUserLoading, user, router]);

  // Fetch app blocks to check if user should be here
  useEffect(() => {
    if (user) {
      fetchAppBlocks();
    }
  }, [user, fetchAppBlocks]);

  // Redirect to dashboard if user already has blocks (unless explicitly creating new)
  useEffect(() => {
    const isCreatingNew = router.query.new === 'true';
    if (!isBlocksLoading && appBlocks.length > 0 && !isCreatingNew) {
      router.push('/dashboard');
    }
  }, [isBlocksLoading, appBlocks, router]);

  // Handle name input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setBlockName(newName);
  };

  // Handle continuing to block type selection
  const handleContinueToTypeSelection = () => {
    setIsBlockClaimed(true);
  };

  // Handle selecting block type - creates the block and redirects to questions
  const handleSelectBlockType = async (type: string) => {
    if (isCreating) return;
    
    setIsCreating(true);
    setCreateError(null);
    
    try {
      const response = await fetch('/api/pending-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockName: blockName.trim(),
          blockType: type,
          summary: {
            name: blockName.trim(),
            tagline: '',
            description: '',
            targetAudience: '',
            coreFeatures: [],
            nextSteps: [],
          },
          processedAnswers: [],
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.appBlock) {
        // Redirect to the questions page
        router.push(`/app-blocks/${data.appBlock.id}/questions`);
      } else {
        setCreateError(data.error || 'Failed to create block');
        setIsCreating(false);
      }
    } catch (err) {
      console.error('Error creating block:', err);
      setCreateError('Failed to create block. Please try again.');
      setIsCreating(false);
    }
  };

  if (isUserLoading || isBlocksLoading) {
    return <Loading text="Loading..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <Container>
      <Head>
        <title>Get Started | {APP_NAME}</title>
        <meta name="description" content={`Start building with ${APP_NAME}`} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Main>
        {!isBlockClaimed ? (
          // Step 1: Name your block
          <>
            <BlockImageContainer>
              <BlockImage src="/app-block.png" alt="Your Block" />
            </BlockImageContainer>

        <ContentSection>
              <BlockTitle>Name Your Block</BlockTitle>
              <Divider />
              <BlockText>
                In Renaissance City, every block has a story.
              </BlockText>
              <BlockText>
                Yours starts with a name.
              </BlockText>
              
              <NameInputSection>
                <NameInput
                  id="blockName"
                  type="text"
                  value={blockName}
                  onChange={handleNameChange}
                  placeholder="Enter block name..."
                  maxLength={40}
                  autoFocus
                />
                <ContinueButton 
                  disabled={!blockName.trim()}
                  onClick={handleContinueToTypeSelection}
                >
                  Continue →
                </ContinueButton>
              </NameInputSection>
        </ContentSection>
          </>
        ) : (
          // Step 2: Choose what to build
          <>
            <SmallBlockImage src="/app-block.png" alt="Your Block" />

            <ContentSection>
              <BlockTitle>{blockName}</BlockTitle>
              <Divider />
              <BlockText>
                What you build here will connect to others — together, we&apos;re rebuilding Detroit, one block at a time.
              </BlockText>
              
              {createError && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  color: '#dc2626',
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: '0.9rem',
                  marginTop: '1rem',
                  width: '100%',
                  maxWidth: '440px',
                  textAlign: 'center',
                }}>
                  {createError}
                </div>
              )}
              
              <BlockTypeGrid style={{ opacity: isCreating ? 0.5 : 1, pointerEvents: isCreating ? 'none' : 'auto' }}>
                <BlockTypeCard $index={0} onClick={() => handleSelectBlockType('creator')} disabled={isCreating}>
                  <BlockTypeIcon>🎨</BlockTypeIcon>
                  <BlockTypeName>Creator Block</BlockTypeName>
                  <BlockTypeDesc>Art, music, writing, culture, expression</BlockTypeDesc>
                </BlockTypeCard>
                
                <BlockTypeCard $index={1} onClick={() => handleSelectBlockType('community')} disabled={isCreating}>
                  <BlockTypeIcon>🧠</BlockTypeIcon>
                  <BlockTypeName>Community Block</BlockTypeName>
                  <BlockTypeDesc>Events, meetups, education, organizing</BlockTypeDesc>
                </BlockTypeCard>
                
                <BlockTypeCard $index={2} onClick={() => handleSelectBlockType('project')} disabled={isCreating}>
                  <BlockTypeIcon>🏗</BlockTypeIcon>
                  <BlockTypeName>Project / Product Block</BlockTypeName>
                  <BlockTypeDesc>Apps, tools, experiments, startups</BlockTypeDesc>
                </BlockTypeCard>
                
                <BlockTypeCard $index={3} onClick={() => handleSelectBlockType('business')} disabled={isCreating}>
                  <BlockTypeIcon>🏪</BlockTypeIcon>
                  <BlockTypeName>Business Block</BlockTypeName>
                  <BlockTypeDesc>Local services, venues, shops</BlockTypeDesc>
                </BlockTypeCard>
                
                <BlockTypeCard $index={4} onClick={() => handleSelectBlockType('game')} disabled={isCreating}>
                  <BlockTypeIcon>🎮</BlockTypeIcon>
                  <BlockTypeName>Game / Interactive Block</BlockTypeName>
                  <BlockTypeDesc>Experiences, quests, play</BlockTypeDesc>
                </BlockTypeCard>
                
                <BlockTypeCard $index={5} onClick={() => handleSelectBlockType('unsure')} disabled={isCreating}>
                  <BlockTypeIcon>🌱</BlockTypeIcon>
                  <BlockTypeName>Not Sure Yet</BlockTypeName>
                  <BlockTypeDesc>Help me shape it</BlockTypeDesc>
                </BlockTypeCard>
              </BlockTypeGrid>
              
              {isCreating && (
                <div style={{
                  marginTop: '1.5rem',
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  color: 'var(--text-secondary)',
                }}>
                  Creating your block...
                </div>
              )}
            </ContentSection>
          </>
        )}
      </Main>
    </Container>
  );
};

export default GetStartedPage;
