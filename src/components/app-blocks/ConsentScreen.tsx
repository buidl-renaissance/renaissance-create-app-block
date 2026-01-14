import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ConnectorWithDetails, Scope } from '@/contexts/AppBlockContext';

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

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
`;

const ConsentCard = styled.div`
  width: 100%;
  max-width: 480px;
  background: ${({ theme }) => theme.surface};
  border-radius: 24px;
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-out;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.accent} 0%, 
    ${({ theme }) => theme.accentGold} 100%
  );
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 3s linear infinite;
  }
`;

const ConnectorIconLarge = styled.div<{ $iconUrl?: string | null }>`
  width: 72px;
  height: 72px;
  margin: 0 auto 1rem;
  border-radius: 16px;
  background: ${({ $iconUrl }) => 
    $iconUrl 
      ? `url(${$iconUrl}) center/cover no-repeat` 
      : 'rgba(255, 255, 255, 0.2)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

const HeaderTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  position: relative;
  z-index: 1;
`;

const HeaderSubtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0.5rem 0 0 0;
  position: relative;
  z-index: 1;
`;

const Body = styled.div`
  padding: 1.5rem 2rem;
`;

const PermissionTitle = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 1rem 0;
`;

const ScopeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const ScopeItem = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.border};
  }
`;

const ScopeCheckbox = styled.input`
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: ${({ theme }) => theme.accent};
  cursor: pointer;
`;

const ScopeInfo = styled.div`
  flex: 1;
`;

const ScopeName = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.125rem;
`;

const ScopeDescription = styled.div`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.4;
`;

const RoleBadge = styled.span`
  padding: 0.125rem 0.5rem;
  background: ${({ theme }) => theme.accent}20;
  border-radius: 4px;
  font-size: 0.65rem;
  color: ${({ theme }) => theme.accent};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-left: 0.5rem;
`;

const Notice = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1.5rem 0;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-radius: 8px;
  line-height: 1.5;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
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
    border: 2px solid ${theme.border};
    color: ${theme.textSecondary};
    
    &:hover {
      border-color: ${theme.text};
      color: ${theme.text};
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const iconMap: Record<string, string> = {
  events: '📅',
  collab: '🤝',
  djq: '🎵',
  gamenight: '🎮',
};

interface ConsentScreenProps {
  connector: ConnectorWithDetails;
  appBlockName: string;
  preSelectedScopes?: string[];
  onGrant: (scopes: string[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({
  connector,
  appBlockName,
  preSelectedScopes,
  onGrant,
  onCancel,
  isLoading = false,
}) => {
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(
    new Set(preSelectedScopes || connector.scopes.map(s => s.name))
  );

  const toggleScope = (scopeName: string) => {
    const newSelection = new Set(selectedScopes);
    if (newSelection.has(scopeName)) {
      newSelection.delete(scopeName);
    } else {
      newSelection.add(scopeName);
    }
    setSelectedScopes(newSelection);
  };

  const handleGrant = () => {
    onGrant(Array.from(selectedScopes));
  };

  return (
    <Overlay onClick={onCancel}>
      <ConsentCard onClick={e => e.stopPropagation()}>
        <Header>
          <ConnectorIconLarge $iconUrl={connector.iconUrl}>
            {!connector.iconUrl && (iconMap[connector.id] || '🔌')}
          </ConnectorIconLarge>
          <HeaderTitle>Connect to {connector.name}</HeaderTitle>
          <HeaderSubtitle>
            {appBlockName} is requesting access
          </HeaderSubtitle>
        </Header>
        
        <Body>
          <PermissionTitle>This will allow your App Block to:</PermissionTitle>
          
          <ScopeList>
            {connector.scopes.map(scope => (
              <ScopeItem key={scope.id}>
                <ScopeCheckbox
                  type="checkbox"
                  checked={selectedScopes.has(scope.name)}
                  onChange={() => toggleScope(scope.name)}
                />
                <ScopeInfo>
                  <ScopeName>
                    {scope.description || scope.name}
                    {scope.requiredRole && (
                      <RoleBadge>{scope.requiredRole}+</RoleBadge>
                    )}
                  </ScopeName>
                  <ScopeDescription>
                    {scope.name}
                  </ScopeDescription>
                </ScopeInfo>
              </ScopeItem>
            ))}
          </ScopeList>
          
          <Notice>
            You can revoke access at any time from your App Block settings.
          </Notice>
          
          <Actions>
            <Button type="button" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="button"
              $primary 
              onClick={handleGrant}
              disabled={selectedScopes.size === 0 || isLoading}
            >
              {isLoading ? 'Connecting...' : 'Grant Access'}
            </Button>
          </Actions>
        </Body>
      </ConsentCard>
    </Overlay>
  );
};

export default ConsentScreen;
