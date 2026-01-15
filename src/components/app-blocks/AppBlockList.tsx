import React from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { AppBlock } from '@/contexts/AppBlockContext';

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

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const AppBlockCard = styled(Link)<{ $index: number }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.4s ease-out ${({ $index }) => $index * 0.05}s both;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${({ theme }) => theme.shadow};
  }
`;

const BlockIcon = styled.div<{ $iconUrl?: string | null }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${({ $iconUrl, theme }) => 
    $iconUrl 
      ? `url(${$iconUrl}) center/cover no-repeat` 
      : `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentGold} 100%)`
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  font-family: 'Cormorant Garamond', Georgia, serif;
  flex-shrink: 0;
`;

const BlockInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const BlockName = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BlockDescription = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BlockMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.8rem;
`;

const ArrowIcon = styled.span`
  color: ${({ theme }) => theme.accent};
  font-size: 1.25rem;
  transition: transform 0.2s ease;
  
  ${AppBlockCard}:hover & {
    transform: translateX(4px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const EmptyTitle = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem 0;
`;

const EmptyText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1.5rem 0;
`;

const CreateButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 150%);
  border: none;
  border-radius: 10px;
  color: white;
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${({ theme }) => theme.accent}44;
  }
`;

interface AppBlockListProps {
  appBlocks: AppBlock[];
  emptyMessage?: string;
}

export const AppBlockList: React.FC<AppBlockListProps> = ({ 
  appBlocks,
  emptyMessage = "You haven't created any App Blocks yet"
}) => {
  if (appBlocks.length === 0) {
    return (
      <EmptyState>
        <EmptyTitle>No App Blocks Yet</EmptyTitle>
        <EmptyText>{emptyMessage}</EmptyText>
        <CreateButton href="/get-started?new=true">
          + Create Your First Block
        </CreateButton>
      </EmptyState>
    );
  }

  return (
    <ListContainer>
      {appBlocks.map((block, index) => (
        <AppBlockCard 
          key={block.id} 
          href={`/app-blocks/${block.id}`}
          $index={index}
        >
          <BlockIcon $iconUrl={block.iconUrl}>
            {!block.iconUrl && block.name.charAt(0).toUpperCase()}
          </BlockIcon>
          <BlockInfo>
            <BlockName>{block.name}</BlockName>
            <BlockDescription>
              {block.description || 'No description'}
            </BlockDescription>
          </BlockInfo>
          <BlockMeta>
            <ArrowIcon>→</ArrowIcon>
          </BlockMeta>
        </AppBlockCard>
      ))}
    </ListContainer>
  );
};

export default AppBlockList;
