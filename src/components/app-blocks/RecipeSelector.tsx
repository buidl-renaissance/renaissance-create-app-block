import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ConnectorRecipe, ConnectorWithDetails } from '@/contexts/AppBlockContext';

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

const ConnectorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ConnectorLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const ConnectorIcon = styled.span`
  font-size: 1.25rem;
`;

const RecipeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RecipeCard = styled.button<{ $selected: boolean; $index: number }>`
  display: flex;
  flex-direction: column;
  padding: 1rem 1.25rem;
  background: ${({ theme, $selected }) => 
    $selected ? theme.accent + '15' : theme.surface};
  border: 2px solid ${({ theme, $selected }) => 
    $selected ? theme.accent : theme.border};
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.4s ease-out both;
  animation-delay: ${({ $index }) => $index * 0.05}s;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
  }
`;

const RecipeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.375rem;
`;

const RecipeName = styled.h4`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const RecipeCheck = styled.span<{ $visible: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ theme, $visible }) => $visible ? theme.accent : theme.border};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.2s ease;
`;

const RecipeDescription = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
`;

const ScopeTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const ScopeTag = styled.span<{ $included: boolean }>`
  padding: 0.2rem 0.5rem;
  background: ${({ theme, $included }) => 
    $included ? theme.accent + '20' : theme.backgroundAlt};
  border-radius: 4px;
  font-size: 0.7rem;
  color: ${({ theme, $included }) => 
    $included ? theme.accent : theme.textSecondary};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const CustomOption = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 2px dashed ${({ theme, $selected }) => 
    $selected ? theme.accent : theme.border};
  border-radius: 12px;
  cursor: pointer;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
  }
`;

const iconMap: Record<string, string> = {
  events: '📅',
  collab: '🤝',
  djq: '🎵',
  gamenight: '🎮',
};

interface RecipeSelectorProps {
  connectors: ConnectorWithDetails[];
  selectedRecipes: Record<string, string | 'custom'>; // connectorId -> recipeId or 'custom'
  onRecipeSelect: (connectorId: string, recipeId: string | 'custom') => void;
}

export const RecipeSelector: React.FC<RecipeSelectorProps> = ({
  connectors,
  selectedRecipes,
  onRecipeSelect,
}) => {
  const parseScopes = (scopesJson: string): string[] => {
    try {
      return JSON.parse(scopesJson);
    } catch {
      return [];
    }
  };

  return (
    <Container>
      <div>
        <SectionTitle>Select Blueprints</SectionTitle>
        <SectionSubtitle>
          Choose preset configurations for each connected district, or customize your own
        </SectionSubtitle>
      </div>
      
      {connectors.map((connector) => (
        <ConnectorSection key={connector.id}>
          <ConnectorLabel>
            <ConnectorIcon>{iconMap[connector.id] || '🔌'}</ConnectorIcon>
            {connector.name}
          </ConnectorLabel>
          
          <RecipeList>
            {connector.recipes.map((recipe, index) => {
              const isSelected = selectedRecipes[connector.id] === recipe.id;
              const recipeScopes = parseScopes(recipe.scopes);
              
              return (
                <RecipeCard
                  key={recipe.id}
                  $selected={isSelected}
                  $index={index}
                  onClick={() => onRecipeSelect(connector.id, recipe.id)}
                  type="button"
                >
                  <RecipeHeader>
                    <RecipeName>{recipe.name}</RecipeName>
                    <RecipeCheck $visible={isSelected}>
                      {isSelected ? '✓' : ''}
                    </RecipeCheck>
                  </RecipeHeader>
                  <RecipeDescription>{recipe.description}</RecipeDescription>
                  <ScopeTags>
                    {connector.scopes.map(scope => (
                      <ScopeTag 
                        key={scope.id} 
                        $included={recipeScopes.includes(scope.name)}
                      >
                        {scope.name.split('.').pop()}
                      </ScopeTag>
                    ))}
                  </ScopeTags>
                </RecipeCard>
              );
            })}
            
            <CustomOption 
              $selected={selectedRecipes[connector.id] === 'custom'}
              onClick={() => onRecipeSelect(connector.id, 'custom')}
              type="button"
            >
              ⚙️ Custom configuration
            </CustomOption>
          </RecipeList>
        </ConnectorSection>
      ))}
    </Container>
  );
};

export default RecipeSelector;
