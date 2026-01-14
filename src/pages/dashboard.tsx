import React, { useEffect, useState } from "react";
import Head from "next/head";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
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

// User Section - Vertical Layout
const UserSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
  animation: ${scaleIn} 0.5s ease-out;
`;

const ProfileImageContainer = styled(Link)`
  width: 100px;
  height: 100px;
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
  font-size: 2.5rem;
  font-weight: 600;
  font-family: 'Cormorant Garamond', Georgia, serif;
`;

const Greeting = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.text};
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
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

const CreateButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 150%);
  border: none;
  border-radius: 12px;
  color: white;
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.15rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px ${({ theme }) => theme.accent}44;
  margin-top: 1.5rem;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 24px ${({ theme }) => theme.accent}55;
  }
`;

const SecondaryActions = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 2.5rem;
`;

const SecondaryLink = styled(Link)`
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`;

const BrandMark = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  letter-spacing: 0.05em;
  animation: ${fadeIn} 0.5s ease-out 0.3s both;
  
  @media (max-width: 480px) {
    position: static;
    margin-bottom: 2rem;
  }
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

const NameInputSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 360px;
  animation: ${fadeIn} 0.5s ease-out 0.2s both;
`;

const NameLabel = styled.label`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
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

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [imageError, setImageError] = useState(false);
  const [blockName, setBlockName] = useState('');
  const [isBlockClaimed, setIsBlockClaimed] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [isUserLoading, user, router]);


  // Show loading while checking auth
  if (isUserLoading) {
    return <Loading text="Loading..." />;
  }

  // Don't render anything while redirecting
  if (!user) {
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

      {/* <BrandMark>Renaissance City</BrandMark> */}

      <Main>
        <UserSection>
          <ProfileImageContainer href="/account" title="Account Settings">
            {user.pfpUrl && !imageError ? (
              <ProfileImage
                src={user.pfpUrl}
                alt={displayName}
                onError={() => setImageError(true)}
              />
            ) : (
              <DefaultAvatar>{initials}</DefaultAvatar>
            )}
          </ProfileImageContainer>
          <Greeting>Welcome, {displayName}</Greeting>
        </UserSection>

        <BlockImageContainer>
          <BlockImage src="/app-block.png" alt="Your Block" />
        </BlockImageContainer>

        <ContentSection>
          {!isBlockClaimed ? (
            <>
              <BlockTitle>Name Your Block</BlockTitle>
              <Divider />
              <BlockText>
                Every block in Renaissance City has a name. What will yours be called?
              </BlockText>
              
              <NameInputSection>
                <NameLabel htmlFor="blockName">Block Name</NameLabel>
                <NameInput
                  id="blockName"
                  type="text"
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                  placeholder="Enter block name..."
                  maxLength={40}
                  autoFocus
                />
                <ContinueButton 
                  disabled={!blockName.trim()}
                  onClick={() => {
                    setIsBlockClaimed(true);
                  }}
                >
                  Continue →
                </ContinueButton>
              </NameInputSection>
            </>
          ) : (
            <>
              <BlockTitle>{blockName}</BlockTitle>
              <Divider />
              <BlockText>
                This block is now part of Renaissance City. What you build here 
                will connect to others — together, we&apos;re rebuilding Detroit, 
                one block at a time.
              </BlockText>
              
              <CreateButton href="/app-blocks/new">
                🏗️ Create App Block
              </CreateButton>
            </>
          )}

          <SecondaryActions>
            <SecondaryLink href="/app-blocks">
              My App Blocks
            </SecondaryLink>
            <SecondaryLink href="/account">
              Account Settings
            </SecondaryLink>
          </SecondaryActions>
        </ContentSection>
      </Main>
    </Container>
  );
};

export default DashboardPage;
