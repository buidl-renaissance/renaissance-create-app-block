import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAppBlock, RegistryEntryWithProvider } from '@/contexts/AppBlockContext';

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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BlockIcon = styled.div<{ $iconUrl?: string | null; $category: string }>`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: ${({ $iconUrl, $category }) => 
    $iconUrl 
      ? `url(${$iconUrl}) center/cover no-repeat` 
      : getCategoryGradient($category)
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  flex-shrink: 0;
`;

const BlockInfo = styled.div`
  flex: 1;
`;

const BlockName = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const BlockDescription = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0.25rem 0 0 0;
`;

const Section = styled.section`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 1.5rem;
`;

const SectionTitle = styled.h4`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 1rem 0;
`;

const ScopesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ScopeItem = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.border};
  }
`;

const ScopeCheckbox = styled.input`
  width: 18px;
  height: 18px;
  margin-top: 0.125rem;
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
`;

const ScopeDescription = styled.div`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.125rem;
`;

const ScopeBadge = styled.span<{ $type: 'public' | 'role' }>`
  padding: 0.125rem 0.375rem;
  background: ${({ $type }) => 
    $type === 'public' ? '#22c55e20' : '#6366f120'};
  color: ${({ $type }) => 
    $type === 'public' ? '#22c55e' : '#6366f1'};
  border-radius: 4px;
  font-size: 0.65rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  text-transform: uppercase;
`;

const AuthSection = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const AuthOption = styled.label<{ $selected: boolean }>`
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ theme, $selected }) => $selected ? theme.accent + '15' : theme.backgroundAlt};
  border: 2px solid ${({ theme, $selected }) => $selected ? theme.accent : theme.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const AuthRadio = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const AuthInfo = styled.div`
  flex: 1;
`;

const AuthTitle = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const AuthDescription = styled.div`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.125rem;
`;

const ConsentNotice = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.accent}10;
  border: 1px solid ${({ theme }) => theme.accent}30;
  border-radius: 10px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  flex: 1;
  min-width: 180px;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 150%);
  border: none;
  border-radius: 12px;
  color: white;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${({ theme }) => theme.accent}44;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  padding: 1rem 2rem;
  background: transparent;
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  color: ${({ theme }) => theme.text};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
  }
`;

const ErrorMessage = styled.div`
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.error}20;
  border-radius: 8px;
  color: ${({ theme }) => theme.error};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
`;

// Helper functions
function getCategoryGradient(category: string) {
  const gradients: Record<string, string> = {
    events: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)`,
    tools: `linear-gradient(135deg, #10b981 0%, #14b8a6 100%)`,
    music: `linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)`,
    games: `linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)`,
    community: `linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)`,
    other: `linear-gradient(135deg, #6366f1 0%, #a855f7 100%)`,
  };
  return gradients[category] || gradients.other;
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    events: '📅',
    tools: '🛠️',
    music: '🎵',
    games: '🎮',
    community: '👥',
    other: '📦',
  };
  return icons[category] || icons.other;
}

interface BlockInstallerProps {
  consumerAppBlockId: string;
  providerEntry: RegistryEntryWithProvider;
  onInstall?: () => void;
  onCancel?: () => void;
}

export const BlockInstaller: React.FC<BlockInstallerProps> = ({
  consumerAppBlockId,
  providerEntry,
  onInstall,
  onCancel,
}) => {
  const { installAppBlock } = useAppBlock();
  
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [authType, setAuthType] = useState<'user' | 'service'>('user');
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableScopes = providerEntry.provider?.scopes || [];
  const availableAuthMethods = providerEntry.provider?.auth_methods || ['user'];

  useEffect(() => {
    // Pre-select public read scopes by default
    const publicScopes = availableScopes
      .filter(s => s.is_public_read)
      .map(s => s.name);
    setSelectedScopes(publicScopes);
  }, [availableScopes]);

  const handleScopeToggle = (scopeName: string) => {
    if (selectedScopes.includes(scopeName)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scopeName));
    } else {
      setSelectedScopes([...selectedScopes, scopeName]);
    }
  };

  const handleInstall = async () => {
    if (selectedScopes.length === 0) {
      setError('Please select at least one scope');
      return;
    }

    setInstalling(true);
    setError(null);

    try {
      const result = await installAppBlock(
        consumerAppBlockId,
        providerEntry.appBlockId,
        selectedScopes,
        authType
      );

      if (result) {
        onInstall?.();
      } else {
        throw new Error('Failed to install block');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to install block');
    } finally {
      setInstalling(false);
    }
  };

  return (
    <Container>
      <Header>
        <BlockIcon $iconUrl={providerEntry.iconUrl} $category={providerEntry.category}>
          {!providerEntry.iconUrl && getCategoryIcon(providerEntry.category)}
        </BlockIcon>
        <BlockInfo>
          <BlockName>Install {providerEntry.displayName}</BlockName>
          <BlockDescription>
            {providerEntry.description || 'Connect to this block to access its capabilities'}
          </BlockDescription>
        </BlockInfo>
      </Header>

      <Section>
        <SectionTitle>Select Capabilities</SectionTitle>
        <ScopesList>
          {availableScopes.map((scope, index) => (
            <ScopeItem key={index}>
              <ScopeCheckbox
                type="checkbox"
                checked={selectedScopes.includes(scope.name)}
                onChange={() => handleScopeToggle(scope.name)}
              />
              <ScopeInfo>
                <ScopeName>
                  {scope.name}
                  {scope.is_public_read && (
                    <>
                      {' '}
                      <ScopeBadge $type="public">Public</ScopeBadge>
                    </>
                  )}
                  {scope.required_role && (
                    <>
                      {' '}
                      <ScopeBadge $type="role">{scope.required_role}+</ScopeBadge>
                    </>
                  )}
                </ScopeName>
                {scope.description && (
                  <ScopeDescription>{scope.description}</ScopeDescription>
                )}
              </ScopeInfo>
            </ScopeItem>
          ))}
        </ScopesList>
      </Section>

      {availableAuthMethods.length > 1 && (
        <Section>
          <SectionTitle>Access Type</SectionTitle>
          <AuthSection>
            {availableAuthMethods.includes('user') && (
              <AuthOption $selected={authType === 'user'}>
                <AuthRadio
                  type="radio"
                  name="authType"
                  checked={authType === 'user'}
                  onChange={() => setAuthType('user')}
                />
                <AuthInfo>
                  <AuthTitle>User Access</AuthTitle>
                  <AuthDescription>
                    Access data on behalf of logged-in users
                  </AuthDescription>
                </AuthInfo>
              </AuthOption>
            )}
            {availableAuthMethods.includes('service') && (
              <AuthOption $selected={authType === 'service'}>
                <AuthRadio
                  type="radio"
                  name="authType"
                  checked={authType === 'service'}
                  onChange={() => setAuthType('service')}
                />
                <AuthInfo>
                  <AuthTitle>Service Access</AuthTitle>
                  <AuthDescription>
                    System-level access for background operations
                  </AuthDescription>
                </AuthInfo>
              </AuthOption>
            )}
          </AuthSection>
        </Section>
      )}

      <ConsentNotice>
        🔐 By installing this block, you grant the selected permissions to your app.
        {authType === 'user' && ' Users will be asked to consent when using write capabilities.'}
        {providerEntry.requiresApproval && ' The block owner will need to approve this connection.'}
      </ConsentNotice>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Actions>
        <PrimaryButton
          type="button"
          onClick={handleInstall}
          disabled={installing || selectedScopes.length === 0}
        >
          {installing ? 'Installing...' : 'Install Block'}
        </PrimaryButton>
        {onCancel && (
          <SecondaryButton type="button" onClick={onCancel}>
            Cancel
          </SecondaryButton>
        )}
      </Actions>
    </Container>
  );
};

export default BlockInstaller;
