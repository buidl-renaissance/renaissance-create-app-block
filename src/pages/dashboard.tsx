import React, { useEffect, useState } from "react";
import Head from "next/head";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useAppBlock, AppBlock } from "@/contexts/AppBlockContext";
import { Loading } from "@/components/Loading";

// App configuration
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
  background: ${({ theme }) => theme.background};
`;

// Top Header Bar
const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  animation: ${fadeIn} 0.4s ease-out;
`;

const HeaderUser = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  border-radius: 100px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.surface};
  }
`;

const HeaderAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.accentGold};
  background: ${({ theme }) => theme.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HeaderAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HeaderAvatarFallback = styled.div`
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
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Cormorant Garamond', Georgia, serif;
`;

const HeaderUserName = styled.span`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HeaderButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
`;


// Block Content Section
const ContentSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
`;

const BlockTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0rem 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const BlockText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.1rem;
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


const BlockImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0 1.5rem;
  animation: ${scaleIn} 0.6s ease-out 0.1s both;
`;

const BlockImage = styled.img`
  width: 180px;
  height: 180px;
  object-fit: contain;
  animation: ${pulseGlow} 3s ease-in-out infinite;
  
  @media (max-width: 480px) {
    width: 140px;
    height: 140px;
  }
`;

// App Blocks List Styles
const BlocksListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 320px;
  margin-top: 1rem;
`;

const BlockCard = styled(Link) <{ $index: number }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.4s ease-out ${({ $index }) => $index * 0.05}s both;

  &:hover {
    border-color: ${({ theme }) => theme.accent};
    transform: translateX(4px);
    box-shadow: 0 4px 16px ${({ theme }) => theme.shadow};
  }
`;

const BlockCardIcon = styled.div<{ $iconUrl?: string | null }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ $iconUrl, theme }) =>
    $iconUrl
      ? `url(${$iconUrl}) center/cover no-repeat`
      : `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentGold} 100%)`
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Cormorant Garamond', Georgia, serif;
  flex-shrink: 0;
`;

const BlockCardInfo = styled.div`
  flex: 1;
  min-width: 0;
  text-align: left;
`;

const BlockCardName = styled.span`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BlockCardArrow = styled.span`
  color: ${({ theme }) => theme.accent};
  font-size: 1rem;
  transition: transform 0.2s ease;
  
  ${BlockCard}:hover & {
    transform: translateX(2px);
  }
`;

const DraftBadge = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  background: ${({ theme }) => theme.accentGold}20;
  color: ${({ theme }) => theme.accentGold};
  border-radius: 100px;
`;

const BlockCardMeta = styled.span`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

const SectionLabel = styled.h3`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 0.5rem 0;
  text-align: left;
  width: 100%;
`;

const NewBlockButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: transparent;
  border: 2px dashed ${({ theme }) => theme.border};
  border-radius: 12px;
  text-decoration: none;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
    background: ${({ theme }) => theme.accent}08;
  }
`;

// Map onboarding stage to display text
const getStageLabel = (stage: string | null): string => {
  switch (stage) {
    case 'questions': return 'Answering questions';
    case 'followup': return 'Follow-up questions';
    case 'document': return 'Review requirements';
    case 'connectors': return 'Connecting services';
    case 'complete': return 'Complete';
    default: return 'In progress';
  }
};

// Extract tagline from onboardingData
const getBlockTagline = (block: AppBlock): string | null => {
  if (!block.onboardingData) return null;
  try {
    const data = JSON.parse(block.onboardingData as string);
    return data.prd?.overview?.tagline || data.summary?.tagline || null;
  } catch {
    return null;
  }
};

// Get the URL for a block - always goes to the block detail page
const getBlockUrl = (block: AppBlock): string => {
  return `/app-blocks/${block.id}`;
};

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { appBlocks, isLoading: isBlocksLoading, fetchAppBlocks } = useAppBlock();
  const [imageError, setImageError] = useState(false);

  // Separate draft and active blocks
  const draftBlocks = appBlocks.filter(block => block.status === 'draft');
  const activeBlocks = appBlocks.filter(block => block.status !== 'draft');

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [isUserLoading, user, router]);

  // Fetch app blocks when user is available
  useEffect(() => {
    if (user) {
      fetchAppBlocks();
    }
  }, [user, fetchAppBlocks]);

  // Redirect new users to get-started (only if no blocks at all)
  useEffect(() => {
    if (!isBlocksLoading && appBlocks.length === 0 && user) {
      router.push('/get-started');
    }
  }, [isBlocksLoading, appBlocks, user, router]);

  // Show loading while checking auth or fetching blocks
  if (isUserLoading || isBlocksLoading) {
    return <Loading text="Loading..." />;
  }

  // Don't render anything while redirecting
  if (!user || appBlocks.length === 0) {
    return null;
  }

  const displayName = user.username || user.displayName || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Container>
      <Head>
        <title>Dashboard | {APP_NAME}</title>
        <meta name="description" content={`Your ${APP_NAME} dashboard`} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Main>
        <BlockImageContainer>
          <BlockImage src="/app-block.png" alt="Your Block" />
        </BlockImageContainer>

        <ContentSection>
          <BlockTitle>Your Blocks</BlockTitle>
          <Divider />
          <BlockText>
            Building the renaissance, one block at a time.
          </BlockText>

          <BlocksListContainer>
            {/* Draft blocks - in progress */}
            {draftBlocks.length > 0 && (
              <>
                <SectionLabel>In Progress</SectionLabel>
                {draftBlocks.map((block, index) => {
                  const tagline = getBlockTagline(block);
                  return (
                    <BlockCard
                      key={block.id}
                      href={getBlockUrl(block)}
                      $index={index}
                    >
                      <BlockCardIcon $iconUrl={block.iconUrl}>
                        {!block.iconUrl && block.name.charAt(0).toUpperCase()}
                      </BlockCardIcon>
                      <BlockCardInfo>
                        <BlockCardName>{block.name}</BlockCardName>
                        <BlockCardMeta>{tagline || getStageLabel(block.onboardingStage)}</BlockCardMeta>
                      </BlockCardInfo>
                      <DraftBadge>Resume</DraftBadge>
                    </BlockCard>
                  );
                })}
              </>
            )}

            {/* Active blocks */}
            {activeBlocks.length > 0 && (
              <>
                {draftBlocks.length > 0 && <SectionLabel style={{ marginTop: '1rem' }}>Active</SectionLabel>}
                {activeBlocks.map((block, index) => {
                  const tagline = getBlockTagline(block);
                  return (
                    <BlockCard
                      key={block.id}
                      href={`/app-blocks/${block.id}`}
                      $index={index + draftBlocks.length}
                    >
                      <BlockCardIcon $iconUrl={block.iconUrl}>
                        {!block.iconUrl && block.name.charAt(0).toUpperCase()}
                      </BlockCardIcon>
                      <BlockCardInfo>
                        <BlockCardName>{block.name}</BlockCardName>
                        {tagline && <BlockCardMeta>{tagline}</BlockCardMeta>}
                      </BlockCardInfo>
                      <BlockCardArrow>→</BlockCardArrow>
                    </BlockCard>
                  );
                })}
              </>
            )}

            <NewBlockButton href="/get-started?new=true">
              + Create New Block
            </NewBlockButton>
          </BlocksListContainer>
        </ContentSection>
      </Main>
    </Container>
  );
};

export default DashboardPage;
