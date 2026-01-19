import React, { useState, useEffect } from "react";
import { NextSeo } from "next-seo";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";
import { useUser } from "@/contexts/UserContext";
import { AuthModal } from "@/components/auth";

const APP_NAME = "Renaissance City";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
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

const floatIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 0.6;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(
    165deg,
    ${({ theme }) => theme.background} 0%,
    ${({ theme }) => theme.backgroundAlt} 40%,
    ${({ theme }) => theme.background} 100%
  );
  padding: 2rem;
  position: relative;
  overflow: hidden;

  /* Renaissance-inspired decorative corner flourishes */
  &::before,
  &::after {
    content: '❧';
    position: absolute;
    font-size: 3rem;
    color: ${({ theme }) => theme.accent};
    opacity: 0.15;
    animation: ${floatIn} 1s ease-out 0.5s both;
  }

  &::before {
    top: 2rem;
    left: 2rem;
  }

  &::after {
    bottom: 2rem;
    right: 2rem;
    transform: rotate(180deg);
  }
`;

const LogoContainer = styled.div`
  animation: ${scaleIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-align: center;
  margin-bottom: 2rem;
`;

const Logo = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 700;
  font-size: 3rem;
  margin: 0;
  text-align: center;
  color: ${({ theme }) => theme.text};
  letter-spacing: 0.02em;
  
  @media (max-width: 768px) {
    font-size: 2.25rem;
  }
`;

const LogoAccent = styled.span`
  display: block;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.accent};
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    letter-spacing: 0.25em;
  }
`;

const GoldBar = styled.div`
  width: 80px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    ${({ theme }) => theme.accentGold},
    transparent
  );
  margin: 1rem auto 0;
`;

const ContentSection = styled.div`
  animation: ${fadeIn} 0.6s ease-out 0.3s both;
  text-align: center;
  max-width: 380px;
`;

const WelcomeText = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 1rem;
`;

const Description = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.6;
  margin: 0 0 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PrimaryButton = styled.button`
  padding: 1rem 2rem;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.accent} 0%,
    ${({ theme }) => theme.accentGold} 100%
  );
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px ${({ theme }) => theme.shadow};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${({ theme }) => theme.shadow};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button`
  padding: 1rem 2rem;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accentGold};
    box-shadow: 0 4px 12px ${({ theme }) => theme.shadow};
  }
`;

const AuthPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading, setUser } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'create' | 'signin'>('create');

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, router]);

  // Check for view query param
  useEffect(() => {
    const view = router.query.view as string;
    if (view === 'signin' || view === 'create') {
      setAuthView(view);
      setShowAuthModal(true);
    }
  }, [router.query.view]);

  const handleOpenAuth = (view: 'create' | 'signin') => {
    setAuthView(view);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (authenticatedUser: typeof user) => {
    setShowAuthModal(false);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      router.replace('/dashboard');
    }
  };

  // Don't render while checking auth or if already authenticated
  if (isLoading || user) {
    return null;
  }

  return (
    <Container>
      <NextSeo
        title="Join"
        description="Create your Renaissance City account and start building your block in Detroit's digital renaissance."
        openGraph={{
          title: `Join | ${APP_NAME}`,
          description: "Create your account and start building your block.",
        }}
      />

      <LogoContainer>
        <Logo>Renaissance City</Logo>
        <LogoAccent>Detroit&apos;s Digital Renaissance</LogoAccent>
        <GoldBar />
      </LogoContainer>

      <ContentSection>
        <WelcomeText>Join the Renaissance</WelcomeText>
        <Description>
          Create your account to claim your block and start building. 
          Together, we&apos;re rebuilding Detroit, one block at a time.
        </Description>
        
        <ButtonGroup>
          <PrimaryButton onClick={() => handleOpenAuth('create')}>
            Create Account
          </PrimaryButton>
          <SecondaryButton onClick={() => handleOpenAuth('signin')}>
            Sign In
          </SecondaryButton>
        </ButtonGroup>
      </ContentSection>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        defaultView={authView}
      />
    </Container>
  );
};

export default AuthPage;
