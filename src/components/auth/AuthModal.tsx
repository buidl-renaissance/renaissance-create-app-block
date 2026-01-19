import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { User } from '@/db/user';
import CreateAccountForm from './CreateAccountForm';
import SignInForm from './SignInForm';

export type AuthView = 'create' | 'signin';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: User) => void;
  defaultView?: 'create' | 'signin';
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease-out;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px ${({ theme }) => theme.shadow};
  animation: ${slideUp} 0.3s ease-out;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.backgroundAlt};
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.2s ease;
  z-index: 1;
  
  &:hover {
    background: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.text};
  }
`;

const Header = styled.div`
  padding: 2rem 2rem 1rem;
  text-align: center;
`;

const Title = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem;
`;

const Subtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  margin: 0 2rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme, $active }) => $active ? theme.accent : theme.textSecondary};
  background: transparent;
  border: none;
  border-bottom: 2px solid ${({ theme, $active }) => $active ? theme.accent : 'transparent'};
  margin-bottom: -1px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`;

const Content = styled.div`
  padding: 1.5rem 2rem 2rem;
`;

const GoldBar = styled.div`
  width: 60px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    ${({ theme }) => theme.accentGold},
    transparent
  );
  margin: 0.75rem auto 0;
`;

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultView = 'create'
}) => {
  const [view, setView] = useState<AuthView>(defaultView);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setView(defaultView);
    }
  }, [isOpen, defaultView]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Registration now logs in directly (no OTP step)
  const handleCreateSubmit = useCallback(() => {
    // Fetch the current user from /api/user/me since registration sets the session
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          onSuccess?.(data.user);
        }
        onClose();
      })
      .catch(() => {
        onClose();
      });
  }, [onSuccess, onClose]);

  // Sign in with email verification - called when verification is complete
  const handleSignInSubmit = useCallback(() => {
    // Fetch the current user from /api/user/me since sign-in sets the session
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          onSuccess?.(data.user);
        }
        onClose();
      })
      .catch(() => {
        onClose();
      });
  }, [onSuccess, onClose]);

  // Switch to create account view
  const handleNeedsRegister = useCallback(() => {
    setView('create');
  }, []);

  if (!isOpen) return null;

  const getTitle = () => {
    switch (view) {
      case 'create':
        return 'Join the Renaissance';
      case 'signin':
        return 'Welcome Back';
      default:
        return '';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'create':
        return 'Create your account to start building';
      case 'signin':
        return 'Sign in to continue building';
      default:
        return '';
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close">
          ×
        </CloseButton>

        <Header>
          <Title>{getTitle()}</Title>
          <Subtitle>{getSubtitle()}</Subtitle>
          <GoldBar />
        </Header>

        <TabContainer>
          <Tab
            $active={view === 'create'}
            onClick={() => setView('create')}
          >
            Create Account
          </Tab>
          <Tab
            $active={view === 'signin'}
            onClick={() => setView('signin')}
          >
            Sign In
          </Tab>
        </TabContainer>

        <Content>
          {view === 'create' && (
            <CreateAccountForm onSubmit={handleCreateSubmit} />
          )}
          {view === 'signin' && (
            <SignInForm 
              onSubmit={handleSignInSubmit} 
              onNeedsRegister={handleNeedsRegister}
            />
          )}
        </Content>
      </ModalContainer>
    </Overlay>
  );
};

export default AuthModal;
