import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { useAppBlock, AppBlockInstallation } from '@/contexts/AppBlockContext';

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
  animation: ${fadeIn} 0.4s ease-out;
`;

const InstallationCard = styled.div<{ $index: number }>`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  animation: ${fadeIn} 0.4s ease-out both;
  animation-delay: ${({ $index }) => $index * 0.05}s;
`;

const BlockIcon = styled.div<{ $iconUrl?: string | null; $category?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $iconUrl, $category }) => 
    $iconUrl 
      ? `url(${$iconUrl}) center/cover no-repeat` 
      : getCategoryGradient($category || 'other')
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const InstallationInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const InstallationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.375rem;
`;

const BlockName = styled.span`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.5rem;
  background: ${({ $status }) => getStatusColor($status)}20;
  color: ${({ $status }) => getStatusColor($status)};
  border-radius: 6px;
  font-size: 0.7rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  text-transform: capitalize;
`;

const ScopesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
`;

const ScopeBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-radius: 6px;
  font-size: 0.75rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: ${({ theme }) => theme.textSecondary};
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Crimson Pro', Georgia, serif;
`;

const InstallationActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $variant?: 'danger' }>`
  padding: 0.5rem 0.75rem;
  background: ${({ theme, $variant }) => 
    $variant === 'danger' ? theme.error + '20' : theme.backgroundAlt};
  border: none;
  border-radius: 8px;
  color: ${({ theme, $variant }) => 
    $variant === 'danger' ? theme.error : theme.textSecondary};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme, $variant }) => 
      $variant === 'danger' ? theme.error + '30' : theme.border};
    color: ${({ theme, $variant }) => 
      $variant === 'danger' ? theme.error : theme.accent};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: ${({ theme }) => theme.surface};
  border: 1px dashed ${({ theme }) => theme.border};
  border-radius: 14px;
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
`;

const EmptyTitle = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.375rem 0;
`;

const EmptyText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1rem 0;
`;

const BrowseLink = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 150%);
  border-radius: 10px;
  color: white;
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${({ theme }) => theme.accent}44;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Crimson Pro', Georgia, serif;
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

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: '#22c55e',
    pending: '#f59e0b',
    expired: '#ef4444',
    revoked: '#6b7280',
    error: '#ef4444',
  };
  return colors[status] || colors.active;
}

function formatDate(date: Date | null | string): string {
  if (!date) return 'Never';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface BlockInstallationsProps {
  appBlockId: string;
  showBrowseLink?: boolean;
}

export const BlockInstallations: React.FC<BlockInstallationsProps> = ({
  appBlockId,
  showBrowseLink = true,
}) => {
  const { getAppBlockInstallations, revokeAppBlockInstallation } = useAppBlock();
  
  const [installations, setInstallations] = useState<AppBlockInstallation[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstallations = async () => {
      setLoading(true);
      const result = await getAppBlockInstallations(appBlockId);
      setInstallations(result);
      setLoading(false);
    };
    
    fetchInstallations();
  }, [appBlockId, getAppBlockInstallations]);

  const handleRevoke = async (installationId: string) => {
    if (!confirm('Are you sure you want to revoke this connection?')) return;
    
    setRevoking(installationId);
    const success = await revokeAppBlockInstallation(installationId);
    
    if (success) {
      setInstallations(installations.map(i => 
        i.id === installationId ? { ...i, status: 'revoked' } : i
      ));
    }
    
    setRevoking(null);
  };

  if (loading) {
    return <LoadingState>Loading connections...</LoadingState>;
  }

  if (installations.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon>🔗</EmptyIcon>
        <EmptyTitle>No Blocks Connected</EmptyTitle>
        <EmptyText>
          Connect to other App Blocks to extend your functionality
        </EmptyText>
        {showBrowseLink && (
          <BrowseLink href="/explore">
            Browse Registry →
          </BrowseLink>
        )}
      </EmptyState>
    );
  }

  return (
    <Container>
      {installations.map((installation, index) => (
        <InstallationCard key={installation.id} $index={index}>
          <BlockIcon 
            $iconUrl={installation.provider?.registry?.icon_url}
            $category={installation.provider?.registry?.category}
          >
            {!installation.provider?.registry?.icon_url && 
              getCategoryIcon(installation.provider?.registry?.category || 'other')}
          </BlockIcon>
          
          <InstallationInfo>
            <InstallationHeader>
              <BlockName>
                {installation.provider?.registry?.display_name || 'Unknown Block'}
              </BlockName>
              <StatusBadge $status={installation.status}>
                {installation.status}
              </StatusBadge>
            </InstallationHeader>
            
            <ScopesRow>
              {installation.granted_scopes_parsed.slice(0, 3).map((scope, i) => (
                <ScopeBadge key={i}>{scope}</ScopeBadge>
              ))}
              {installation.granted_scopes_parsed.length > 3 && (
                <ScopeBadge>+{installation.granted_scopes_parsed.length - 3} more</ScopeBadge>
              )}
            </ScopesRow>
            
            <MetaRow>
              <span>Auth: {installation.authType}</span>
              {installation.lastUsedAt && (
                <span>Last used: {formatDate(installation.lastUsedAt)}</span>
              )}
              <span>Connected: {formatDate(installation.createdAt)}</span>
            </MetaRow>
          </InstallationInfo>
          
          <InstallationActions>
            {installation.provider?.registry?.slug && (
              <ActionButton as={Link} href={`/explore/${installation.provider.registry.slug}`}>
                View
              </ActionButton>
            )}
            {installation.status === 'active' && (
              <ActionButton 
                $variant="danger"
                onClick={() => handleRevoke(installation.id)}
                disabled={revoking === installation.id}
              >
                {revoking === installation.id ? 'Revoking...' : 'Revoke'}
              </ActionButton>
            )}
          </InstallationActions>
        </InstallationCard>
      ))}
      
      {showBrowseLink && (
        <BrowseLink href="/explore" style={{ alignSelf: 'flex-start' }}>
          + Connect Another Block
        </BrowseLink>
      )}
    </Container>
  );
};

export default BlockInstallations;
