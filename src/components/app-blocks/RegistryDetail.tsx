import React from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { RegistryEntryWithProvider } from '@/contexts/AppBlockContext';

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
  align-items: flex-start;
  gap: 1.5rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const BlockIcon = styled.div<{ $iconUrl?: string | null; $category: string }>`
  width: 96px;
  height: 96px;
  border-radius: 20px;
  background: ${({ $iconUrl, $category }) => 
    $iconUrl 
      ? `url(${$iconUrl}) center/cover no-repeat` 
      : getCategoryGradient($category)
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const BlockName = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem 0;
`;

const BlockSlug = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 0.75rem;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const CategoryBadge = styled.span<{ $category: string }>`
  padding: 0.375rem 0.75rem;
  background: ${({ $category }) => getCategoryColor($category)}20;
  color: ${({ $category }) => getCategoryColor($category)};
  border-radius: 8px;
  font-size: 0.8rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  text-transform: capitalize;
  font-weight: 500;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.375rem 0.75rem;
  background: ${({ $status }) => $status === 'active' ? '#22c55e' : '#ef4444'}20;
  color: ${({ $status }) => $status === 'active' ? '#22c55e' : '#ef4444'};
  border-radius: 8px;
  font-size: 0.8rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 500;
`;

const Description = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.7;
  margin: 0;
`;

const Section = styled.section`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 1rem 0;
`;

const ScopesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ScopeItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-radius: 10px;
`;

const ScopeIcon = styled.span`
  font-size: 1rem;
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

const ScopeBadges = styled.div`
  display: flex;
  gap: 0.375rem;
`;

const ScopeBadge = styled.span<{ $type: 'public' | 'role' }>`
  padding: 0.125rem 0.375rem;
  background: ${({ $type, theme }) => 
    $type === 'public' ? '#22c55e20' : theme.accent + '20'};
  color: ${({ $type, theme }) => 
    $type === 'public' ? '#22c55e' : theme.accent};
  border-radius: 4px;
  font-size: 0.65rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  text-transform: uppercase;
`;

const TagsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  padding: 0.375rem 0.75rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-radius: 8px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoLabel = styled.span`
  font-size: 0.7rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: ${({ theme }) => theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.span`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  flex: 1;
  min-width: 200px;
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
  box-shadow: 0 4px 16px ${({ theme }) => theme.accent}44;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${({ theme }) => theme.accent}55;
  }
`;

const SecondaryButton = styled(Link)`
  flex: 1;
  min-width: 200px;
  padding: 1rem 2rem;
  background: transparent;
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  color: ${({ theme }) => theme.text};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
  }
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

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    events: '#6366f1',
    tools: '#10b981',
    music: '#ec4899',
    games: '#f59e0b',
    community: '#3b82f6',
    other: '#6366f1',
  };
  return colors[category] || colors.other;
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

interface RegistryDetailProps {
  entry: RegistryEntryWithProvider;
  onInstall?: () => void;
}

export const RegistryDetail: React.FC<RegistryDetailProps> = ({
  entry,
  onInstall,
}) => {
  const tags = entry.tags_parsed || [];

  return (
    <Container>
      <Header>
        <BlockIcon $iconUrl={entry.iconUrl} $category={entry.category}>
          {!entry.iconUrl && getCategoryIcon(entry.category)}
        </BlockIcon>
        <HeaderInfo>
          <BlockName>{entry.displayName}</BlockName>
          <BlockSlug>/{entry.slug}</BlockSlug>
          <MetaRow>
            <CategoryBadge $category={entry.category}>
              {entry.category}
            </CategoryBadge>
            {entry.provider && (
              <StatusBadge $status={entry.provider.status}>
                {entry.provider.status}
              </StatusBadge>
            )}
            {entry.installable && (
              <span style={{ 
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)',
                fontFamily: "'Inter', sans-serif"
              }}>
                ✓ Installable
              </span>
            )}
          </MetaRow>
        </HeaderInfo>
      </Header>

      {entry.description && (
        <Description>{entry.description}</Description>
      )}

      <Actions>
        {entry.installable && onInstall && (
          <PrimaryButton type="button" onClick={onInstall}>
            Install This Block
          </PrimaryButton>
        )}
        <SecondaryButton href={`/explore`}>
          ← Back to Registry
        </SecondaryButton>
      </Actions>

      {entry.provider && entry.provider.scopes.length > 0 && (
        <Section>
          <SectionTitle>Available Capabilities</SectionTitle>
          <ScopesList>
            {entry.provider.scopes.map((scope, index) => (
              <ScopeItem key={index}>
                <ScopeIcon>
                  {scope.is_public_read ? '🔓' : '🔐'}
                </ScopeIcon>
                <ScopeInfo>
                  <ScopeName>{scope.name}</ScopeName>
                  {scope.description && (
                    <ScopeDescription>{scope.description}</ScopeDescription>
                  )}
                </ScopeInfo>
                <ScopeBadges>
                  {scope.is_public_read && (
                    <ScopeBadge $type="public">Public</ScopeBadge>
                  )}
                  {scope.required_role && (
                    <ScopeBadge $type="role">{scope.required_role}+</ScopeBadge>
                  )}
                </ScopeBadges>
              </ScopeItem>
            ))}
          </ScopesList>
        </Section>
      )}

      {tags.length > 0 && (
        <Section>
          <SectionTitle>Tags</SectionTitle>
          <TagsSection>
            {tags.map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagsSection>
        </Section>
      )}

      <Section>
        <SectionTitle>Details</SectionTitle>
        <InfoGrid>
          {entry.provider && (
            <>
              <InfoItem>
                <InfoLabel>API Version</InfoLabel>
                <InfoValue>{entry.provider.api_version}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Rate Limit</InfoLabel>
                <InfoValue>{entry.provider.rate_limit_per_minute} req/min</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Auth Methods</InfoLabel>
                <InfoValue>{entry.provider.auth_methods.join(', ')}</InfoValue>
              </InfoItem>
            </>
          )}
          {entry.contactEmail && (
            <InfoItem>
              <InfoLabel>Contact</InfoLabel>
              <InfoValue>{entry.contactEmail}</InfoValue>
            </InfoItem>
          )}
          {entry.contactUrl && (
            <InfoItem>
              <InfoLabel>Website</InfoLabel>
              <InfoValue>
                <a href={entry.contactUrl} target="_blank" rel="noopener noreferrer">
                  {entry.contactUrl}
                </a>
              </InfoValue>
            </InfoItem>
          )}
        </InfoGrid>
      </Section>
    </Container>
  );
};

export default RegistryDetail;
