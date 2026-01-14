import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useAppBlock, AppBlockWithInstallations, ConnectorWithDetails } from '@/contexts/AppBlockContext';
import { Loading } from '@/components/Loading';
import { ConsentScreen, RecipeSelector } from '@/components/app-blocks';

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
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  padding: 2rem 1.5rem;
`;

const Header = styled.header`
  max-width: 600px;
  margin: 0 auto 2rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`;

const PageTitle = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const PageSubtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0.5rem 0 0 0;
`;

const Main = styled.main`
  max-width: 600px;
  margin: 0 auto;
`;

const Section = styled.section`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  padding: 1.5rem;
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

const ConnectorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ConnectorCard = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1rem;
  background: ${({ theme, $selected }) => 
    $selected ? theme.accent + '15' : theme.backgroundAlt};
  border: 2px solid ${({ theme, $selected }) => 
    $selected ? theme.accent : theme.border};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
  }
`;

const ConnectorIcon = styled.span`
  font-size: 2rem;
`;

const ConnectorName = styled.span`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  text-align: center;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
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
    
    &:hover:not(:disabled) {
      border-color: ${theme.text};
      color: ${theme.text};
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background: #ef444420;
  border: 1px solid #ef4444;
  border-radius: 10px;
  color: #ef4444;
  font-family: 'Crimson Pro', Georgia, serif;
  margin-bottom: 1.5rem;
`;

const iconMap: Record<string, string> = {
  events: '📅',
  collab: '🤝',
  djq: '🎵',
  gamenight: '🎮',
};

type Step = 'select' | 'recipe' | 'consent';

const ConnectPage: React.FC = () => {
  const router = useRouter();
  const { id, connector: connectorParam } = router.query;
  const { user, isLoading: isUserLoading } = useUser();
  const { 
    fetchAppBlock,
    fetchConnector,
    installConnector,
    connectors,
    fetchConnectors,
    parseScopes,
  } = useAppBlock();
  
  const [appBlock, setAppBlock] = useState<AppBlockWithInstallations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<Step>('select');
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const [selectedConnector, setSelectedConnector] = useState<ConnectorWithDetails | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<string | 'custom' | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  useEffect(() => {
    if (id && typeof id === 'string' && user) {
      setIsLoading(true);
      fetchAppBlock(id).then(block => {
        setAppBlock(block);
        setIsLoading(false);
      });
    }
  }, [id, user, fetchAppBlock]);

  useEffect(() => {
    // Pre-select connector from URL param
    if (connectorParam && typeof connectorParam === 'string' && connectors.length > 0) {
      const connector = connectors.find(c => c.id === connectorParam);
      if (connector) {
        setSelectedConnectorId(connectorParam);
        setSelectedConnector(connector);
        setStep('recipe');
      }
    }
  }, [connectorParam, connectors]);

  const handleSelectConnector = async (connectorId: string) => {
    setSelectedConnectorId(connectorId);
    const connector = await fetchConnector(connectorId);
    setSelectedConnector(connector);
    setStep('recipe');
  };

  const handleSelectRecipe = (connectorId: string, recipeId: string | 'custom') => {
    setSelectedRecipe(recipeId);
  };

  const handleProceedToConsent = () => {
    if (!selectedRecipe) {
      setError('Please select a blueprint');
      return;
    }
    setError(null);
    setStep('consent');
  };

  const handleGrant = async (scopes: string[]) => {
    if (!appBlock || !selectedConnectorId) return;
    
    setIsInstalling(true);
    setError(null);
    
    try {
      await installConnector(appBlock.id, selectedConnectorId, scopes);
      router.push(`/app-blocks/${appBlock.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsInstalling(false);
    }
  };

  const handleCancel = () => {
    if (step === 'consent') {
      setStep('recipe');
    } else if (step === 'recipe') {
      setStep('select');
      setSelectedConnectorId(null);
      setSelectedConnector(null);
      setSelectedRecipe(null);
    } else {
      router.push(`/app-blocks/${id}`);
    }
  };

  // Get scopes for consent screen
  const getScopesForConsent = (): string[] => {
    if (!selectedConnector || !selectedRecipe) return [];
    
    if (selectedRecipe === 'custom') {
      return selectedConnector.scopes.map(s => s.name);
    }
    
    const recipe = selectedConnector.recipes.find(r => r.id === selectedRecipe);
    if (recipe) {
      return parseScopes(recipe.scopes);
    }
    
    return selectedConnector.scopes.map(s => s.name);
  };

  if (isUserLoading || isLoading) {
    return <Loading text="Loading..." />;
  }

  if (!user || !appBlock) {
    return (
      <Container>
        <Header>
          <BackLink href="/app-blocks">← Back to App Blocks</BackLink>
          <PageTitle>App Block Not Found</PageTitle>
        </Header>
      </Container>
    );
  }

  // Filter out already connected connectors
  const installedConnectorIds = appBlock.installations.map(i => i.installation.connectorId);
  const availableConnectors = connectors.filter(c => !installedConnectorIds.includes(c.id));

  return (
    <Container>
      <Head>
        <title>Connect District | {appBlock.name}</title>
        <meta name="description" content={`Connect ${appBlock.name} to a Renaissance City district`} />
      </Head>

      {step === 'consent' && selectedConnector && appBlock ? (
        <ConsentScreen
          connector={selectedConnector}
          appBlockName={appBlock.name}
          preSelectedScopes={getScopesForConsent()}
          onGrant={handleGrant}
          onCancel={handleCancel}
          isLoading={isInstalling}
        />
      ) : (
        <>
          <Header>
            <BackLink href={`/app-blocks/${id}`}>← Back to {appBlock.name}</BackLink>
            <PageTitle>
              {step === 'select' ? 'Connect a District' : `Connect to ${selectedConnector?.name}`}
            </PageTitle>
            <PageSubtitle>
              {step === 'select' 
                ? 'Choose a Renaissance City district to integrate with your App Block'
                : 'Choose a blueprint for this connection'
              }
            </PageSubtitle>
          </Header>

          <Main>
            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Section>
              {step === 'select' && (
                <>
                  {availableConnectors.length === 0 ? (
                    <p style={{ 
                      textAlign: 'center', 
                      color: 'var(--text-secondary)',
                      fontFamily: "'Crimson Pro', Georgia, serif",
                    }}>
                      All available districts are already connected to this App Block.
                    </p>
                  ) : (
                    <ConnectorGrid>
                      {availableConnectors.map(connector => (
                        <ConnectorCard
                          key={connector.id}
                          $selected={selectedConnectorId === connector.id}
                          onClick={() => handleSelectConnector(connector.id)}
                          type="button"
                        >
                          <ConnectorIcon>
                            {iconMap[connector.id] || '🔌'}
                          </ConnectorIcon>
                          <ConnectorName>{connector.name}</ConnectorName>
                        </ConnectorCard>
                      ))}
                    </ConnectorGrid>
                  )}
                </>
              )}

              {step === 'recipe' && selectedConnector && (
                <>
                  <RecipeSelector
                    connectors={[selectedConnector]}
                    selectedRecipes={selectedRecipe ? { [selectedConnector.id]: selectedRecipe } : {}}
                    onRecipeSelect={handleSelectRecipe}
                  />
                  
                  <Actions>
                    <Button type="button" onClick={handleCancel}>
                      ← Back
                    </Button>
                    <Button 
                      type="button"
                      $primary 
                      onClick={handleProceedToConsent}
                      disabled={!selectedRecipe}
                    >
                      Continue →
                    </Button>
                  </Actions>
                </>
              )}
            </Section>
          </Main>
        </>
      )}
    </Container>
  );
};

export default ConnectPage;
