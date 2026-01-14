import React from 'react';
import styled, { keyframes } from 'styled-components';
import { InstallationWithConnector } from '@/contexts/AppBlockContext';

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
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const InstallationCard = styled.div<{ $index: number }>`
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  animation: ${fadeIn} 0.4s ease-out both;
  animation-delay: ${({ $index }) => $index * 0.05}s;
`;

const InstallationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ConnectorIcon = styled.div<{ $iconUrl?: string | null }>`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${({ $iconUrl, theme }) => 
    $iconUrl 
      ? `url(${$iconUrl}) center/cover no-repeat` 
      : `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentGold} 100%)`
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const ConnectorInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ConnectorName = styled.h4`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem 0;
`;

const AuthTypeBadge = styled.span<{ $type: 'user' | 'service' }>`
  padding: 0.125rem 0.5rem;
  background: ${({ theme, $type }) => 
    $type === 'service' ? theme.accentGold + '20' : theme.accent + '20'};
  border-radius: 4px;
  font-size: 0.65rem;
  color: ${({ theme, $type }) => 
    $type === 'service' ? theme.accentGold : theme.accent};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatusIndicator = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusDot = styled.span<{ $status: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $status }) => {
    switch ($status) {
      case 'active': return '#22c55e';
      case 'expired': return '#eab308';
      case 'revoked': return '#ef4444';
      case 'error': return '#ef4444';
      default: return '#9ca3af';
    }
  }};
  box-shadow: ${({ $status }) => {
    switch ($status) {
      case 'active': return '0 0 8px #22c55e';
      case 'expired': return '0 0 8px #eab308';
      case 'error': return '0 0 8px #ef4444';
      default: return 'none';
    }
  }};
`;

const StatusText = styled.span<{ $status: string }>`
  font-size: 0.8rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'active': return '#22c55e';
      case 'expired': return '#eab308';
      case 'revoked': 
      case 'error': return '#ef4444';
      default: return theme.textSecondary;
    }
  }};
  text-transform: capitalize;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.span`
  font-size: 0.7rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: ${({ theme }) => theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.span`
  font-size: 0.85rem;
  font-family: 'Crimson Pro', Georgia, serif;
  color: ${({ theme }) => theme.text};
`;

const ScopesSection = styled.div`
  margin-bottom: 1rem;
`;

const ScopesLabel = styled.div`
  font-size: 0.7rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: ${({ theme }) => theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
`;

const ScopesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const ScopeBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-radius: 6px;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $danger, theme }) => $danger ? `
    background: #ef444420;
    border: 1px solid #ef4444;
    color: #ef4444;
    
    &:hover {
      background: #ef4444;
      color: white;
    }
  ` : `
    background: ${theme.backgroundAlt};
    border: 1px solid ${theme.border};
    color: ${theme.text};
    
    &:hover {
      border-color: ${theme.accent};
      color: ${theme.accent};
    }
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Crimson Pro', Georgia, serif;
`;

const iconMap: Record<string, string> = {
  events: '📅',
  collab: '🤝',
  djq: '🎵',
  gamenight: '🎮',
};

interface ConnectorHealthProps {
  installations: InstallationWithConnector[];
  onReauth?: (installationId: string) => void;
  onRevoke?: (installationId: string) => void;
  onRotateKey?: () => void;
}

export const ConnectorHealth: React.FC<ConnectorHealthProps> = ({
  installations,
  onReauth,
  onRevoke,
  onRotateKey,
}) => {
  const parseScopes = (scopesJson: string): string[] => {
    try {
      return JSON.parse(scopesJson);
    } catch {
      return [];
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (installations.length === 0) {
    return (
      <Container>
        <SectionTitle>Connected Districts</SectionTitle>
        <EmptyState>
          No connectors installed yet. Add connections to integrate with Renaissance City districts.
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <SectionTitle>Connected Districts</SectionTitle>
      
      {installations.map(({ installation, connector }, index) => {
        const scopes = parseScopes(installation.grantedScopes);
        
        return (
          <InstallationCard key={installation.id} $index={index}>
            <InstallationHeader>
              <ConnectorIcon $iconUrl={connector.iconUrl}>
                {!connector.iconUrl && (iconMap[connector.id] || '🔌')}
              </ConnectorIcon>
              <ConnectorInfo>
                <ConnectorName>
                  {connector.name}
                  <AuthTypeBadge $type={installation.authType}>
                    {installation.authType}
                  </AuthTypeBadge>
                </ConnectorName>
              </ConnectorInfo>
              <StatusIndicator $status={installation.status}>
                <StatusDot $status={installation.status} />
                <StatusText $status={installation.status}>
                  {installation.status}
                </StatusText>
              </StatusIndicator>
            </InstallationHeader>
            
            <DetailsGrid>
              <DetailItem>
                <DetailLabel>Connected</DetailLabel>
                <DetailValue>{formatDate(installation.createdAt)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Last Used</DetailLabel>
                <DetailValue>{formatDate(installation.lastUsedAt)}</DetailValue>
              </DetailItem>
            </DetailsGrid>
            
            <ScopesSection>
              <ScopesLabel>Granted Scopes ({scopes.length})</ScopesLabel>
              <ScopesList>
                {scopes.map(scope => (
                  <ScopeBadge key={scope}>{scope}</ScopeBadge>
                ))}
              </ScopesList>
            </ScopesSection>
            
            <Actions>
              {installation.status !== 'active' && onReauth && (
                <ActionButton 
                  type="button"
                  onClick={() => onReauth(installation.id)}
                >
                  Re-authenticate
                </ActionButton>
              )}
              {onRevoke && (
                <ActionButton 
                  type="button"
                  $danger 
                  onClick={() => onRevoke(installation.id)}
                >
                  {installation.status === 'revoked' ? 'Remove' : 'Revoke Access'}
                </ActionButton>
              )}
            </Actions>
          </InstallationCard>
        );
      })}
    </Container>
  );
};

export default ConnectorHealth;
