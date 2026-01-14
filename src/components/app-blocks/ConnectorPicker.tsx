import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ConnectorWithDetails } from '@/contexts/AppBlockContext';

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

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 transparent;
  }
  50% {
    box-shadow: 0 0 0 4px ${({ theme }) => theme?.accent}33;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const SectionSubtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
`;

const ConnectorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const ConnectorCard = styled.button<{ $selected: boolean; $index: number }>`
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  background: ${({ theme, $selected }) => 
    $selected ? theme.accent + '15' : theme.surface};
  border: 2px solid ${({ theme, $selected }) => 
    $selected ? theme.accent : theme.border};
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.4s ease-out both;
  animation-delay: ${({ $index }) => $index * 0.05}s;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    transform: translateY(-2px);
  }
  
  ${({ $selected }) => $selected && `
    animation: ${pulse} 1s ease-out;
  `}
`;

const ConnectorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
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
`;

const ConnectorName = styled.h4`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const ConnectorDescription = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
`;

const ScopeBadges = styled.div`
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

const CheckIcon = styled.span<{ $visible: boolean }>`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.accent};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  transform: scale(${({ $visible }) => $visible ? 1 : 0.5});
  transition: all 0.2s ease;
`;

const CardWrapper = styled.div`
  position: relative;
`;

const iconMap: Record<string, string> = {
  events: '📅',
  collab: '🤝',
  djq: '🎵',
  gamenight: '🎮',
};

interface ConnectorPickerProps {
  connectors: ConnectorWithDetails[];
  selectedConnectors: string[];
  onSelectionChange: (connectorIds: string[]) => void;
  maxSelections?: number;
}

export const ConnectorPicker: React.FC<ConnectorPickerProps> = ({
  connectors,
  selectedConnectors,
  onSelectionChange,
  maxSelections,
}) => {
  const toggleConnector = (connectorId: string) => {
    if (selectedConnectors.includes(connectorId)) {
      onSelectionChange(selectedConnectors.filter(id => id !== connectorId));
    } else {
      if (maxSelections && selectedConnectors.length >= maxSelections) {
        // Replace the first selection
        onSelectionChange([...selectedConnectors.slice(1), connectorId]);
      } else {
        onSelectionChange([...selectedConnectors, connectorId]);
      }
    }
  };

  return (
    <Container>
      <div>
        <SectionTitle>Choose Districts to Connect</SectionTitle>
        <SectionSubtitle>
          Select which Renaissance City districts your App Block should integrate with
        </SectionSubtitle>
      </div>
      
      <ConnectorGrid>
        {connectors.map((connector, index) => {
          const isSelected = selectedConnectors.includes(connector.id);
          return (
            <CardWrapper key={connector.id}>
              <ConnectorCard
                $selected={isSelected}
                $index={index}
                onClick={() => toggleConnector(connector.id)}
                type="button"
              >
                <ConnectorHeader>
                  <ConnectorIcon $iconUrl={connector.iconUrl}>
                    {!connector.iconUrl && (iconMap[connector.id] || '🔌')}
                  </ConnectorIcon>
                  <ConnectorName>{connector.name}</ConnectorName>
                </ConnectorHeader>
                <ConnectorDescription>
                  {connector.description}
                </ConnectorDescription>
                <ScopeBadges>
                  {connector.scopes.slice(0, 3).map(scope => (
                    <ScopeBadge key={scope.id}>
                      {scope.name.split('.').pop()}
                    </ScopeBadge>
                  ))}
                  {connector.scopes.length > 3 && (
                    <ScopeBadge>+{connector.scopes.length - 3} more</ScopeBadge>
                  )}
                </ScopeBadges>
              </ConnectorCard>
              <CheckIcon $visible={isSelected}>✓</CheckIcon>
            </CardWrapper>
          );
        })}
      </ConnectorGrid>
    </Container>
  );
};

export default ConnectorPicker;
