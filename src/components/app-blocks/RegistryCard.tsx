import React from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { RegistryEntry } from '@/contexts/AppBlockContext';

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

const Card = styled(Link)<{ $index: number }>`
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.4s ease-out both;
  animation-delay: ${({ $index }) => $index * 0.05}s;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    transform: translateY(-4px);
    box-shadow: 0 12px 32px ${({ theme }) => theme.shadow};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const BlockIcon = styled.div<{ $iconUrl?: string | null; $category: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $iconUrl, theme, $category }) => 
    $iconUrl 
      ? `url(${$iconUrl}) center/cover no-repeat` 
      : getCategoryGradient($category, theme)
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const BlockInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const BlockName = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BlockSlug = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.textSecondary};
  opacity: 0.7;
`;

const BlockDescription = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.75rem;
`;

const CategoryBadge = styled.span<{ $category: string }>`
  padding: 0.25rem 0.5rem;
  background: ${({ theme, $category }) => getCategoryColor($category, theme)}20;
  color: ${({ theme, $category }) => getCategoryColor($category, theme)};
  border-radius: 6px;
  font-size: 0.7rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  text-transform: capitalize;
`;

const TagsContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  padding: 0.125rem 0.375rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-radius: 4px;
  font-size: 0.65rem;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const FeaturedBadge = styled.span`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border-radius: 6px;
  font-size: 0.65rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
`;

const CardWrapper = styled.div`
  position: relative;
`;

// Helper functions
function getCategoryGradient(category: string, theme: { accent: string; accentGold: string }) {
  const gradients: Record<string, string> = {
    events: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)`,
    tools: `linear-gradient(135deg, #10b981 0%, #14b8a6 100%)`,
    music: `linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)`,
    games: `linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)`,
    community: `linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)`,
    other: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentGold} 100%)`,
  };
  return gradients[category] || gradients.other;
}

function getCategoryColor(category: string, theme: { accent: string }) {
  const colors: Record<string, string> = {
    events: '#6366f1',
    tools: '#10b981',
    music: '#ec4899',
    games: '#f59e0b',
    community: '#3b82f6',
    other: theme.accent,
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

interface RegistryCardProps {
  entry: RegistryEntry;
  index?: number;
}

export const RegistryCard: React.FC<RegistryCardProps> = ({ entry, index = 0 }) => {
  const tags = entry.tags_parsed || [];

  return (
    <CardWrapper>
      <Card href={`/explore/${entry.slug}`} $index={index}>
        <CardHeader>
          <BlockIcon $iconUrl={entry.iconUrl} $category={entry.category}>
            {!entry.iconUrl && getCategoryIcon(entry.category)}
          </BlockIcon>
          <BlockInfo>
            <BlockName>{entry.displayName}</BlockName>
            <BlockSlug>/{entry.slug}</BlockSlug>
          </BlockInfo>
        </CardHeader>
        
        <BlockDescription>
          {entry.description || 'No description available'}
        </BlockDescription>
        
        <CardFooter>
          <CategoryBadge $category={entry.category}>
            {entry.category}
          </CategoryBadge>
          {tags.length > 0 && (
            <TagsContainer>
              {tags.slice(0, 2).map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
              {tags.length > 2 && <Tag>+{tags.length - 2}</Tag>}
            </TagsContainer>
          )}
        </CardFooter>
      </Card>
      {entry.featuredAt && <FeaturedBadge>Featured</FeaturedBadge>}
    </CardWrapper>
  );
};

export default RegistryCard;
