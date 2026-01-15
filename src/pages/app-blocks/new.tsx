import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useAppBlock, ConnectorWithDetails, RegistryEntry, RegistryEntryWithProvider } from '@/contexts/AppBlockContext';
import { Loading } from '@/components/Loading';
import { ConnectorPicker, RecipeSelector, RegistryBrowser } from '@/components/app-blocks';

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
  max-width: 800px;
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
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const PageSubtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0.5rem 0 0 0;
`;

const Main = styled.main`
  max-width: 800px;
  margin: 0 auto;
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  ${({ $active, $completed, theme }) => {
    if ($completed) return `
      background: ${theme.accent};
      color: white;
    `;
    if ($active) return `
      background: ${theme.accent}20;
      color: ${theme.accent};
      border: 2px solid ${theme.accent};
    `;
    return `
      background: ${theme.backgroundAlt};
      color: ${theme.textSecondary};
      border: 2px solid ${theme.border};
    `;
  }}
`;

const StepLine = styled.div<{ $completed: boolean }>`
  width: 40px;
  height: 2px;
  background: ${({ $completed, theme }) => 
    $completed ? theme.accent : theme.border};
  transition: background 0.2s ease;
`;

const FormSection = styled.section`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  padding: 2rem;
  animation: ${fadeIn} 0.4s ease-out 0.2s both;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.background};
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.glow};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    opacity: 0.6;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.background};
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.glow};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    opacity: 0.6;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 1rem 2rem;
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

type WizardStep = 'details' | 'connectors' | 'blocks' | 'recipes' | 'review';

// Selected block for installation
interface SelectedBlock {
  entry: RegistryEntryWithProvider;
  scopes: string[];
}

const NewAppBlockPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { 
    createAppBlock, 
    installConnector, 
    installAppBlock,
    connectors, 
    fetchConnectors, 
    connectorsLoading,
    parseScopes,
    getRegistryEntry,
    browseRegistry,
    registryEntries,
  } = useAppBlock();
  
  const [step, setStep] = useState<WizardStep>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<Record<string, string | 'custom'>>({});
  const [selectedBlocks, setSelectedBlocks] = useState<SelectedBlock[]>([]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  const selectedConnectorObjects = connectors.filter(c => selectedConnectors.includes(c.id));

  const handleNext = () => {
    setError(null);
    
    if (step === 'details') {
      if (!name.trim()) {
        setError('Please enter a name for your App Block');
        return;
      }
      setStep('connectors');
    } else if (step === 'connectors') {
      if (selectedConnectors.length === 0) {
        setError('Please select at least one connector');
        return;
      }
      setStep('blocks');
      // Fetch registry entries when moving to blocks step
      browseRegistry({ installable: true, limit: 20 });
    } else if (step === 'blocks') {
      // Blocks are optional, can proceed without selecting any
      setStep('recipes');
    } else if (step === 'recipes') {
      // Check that all connectors have a recipe selected
      const missingRecipes = selectedConnectors.filter(id => !selectedRecipes[id]);
      if (missingRecipes.length > 0) {
        setError('Please select a blueprint for each connected district');
        return;
      }
      setStep('review');
    }
  };

  const handleBack = () => {
    setError(null);
    if (step === 'connectors') setStep('details');
    else if (step === 'blocks') setStep('connectors');
    else if (step === 'recipes') setStep('blocks');
    else if (step === 'review') setStep('recipes');
  };

  const handleSelectBlock = async (entry: RegistryEntry) => {
    // Check if already selected
    if (selectedBlocks.some(b => b.entry.id === entry.id)) {
      setSelectedBlocks(selectedBlocks.filter(b => b.entry.id !== entry.id));
      return;
    }

    // Fetch full entry with provider info
    const fullEntry = await getRegistryEntry(entry.slug);
    if (fullEntry && fullEntry.provider) {
      // Select all scopes by default
      const allScopes = fullEntry.provider.scopes.map(s => s.name);
      setSelectedBlocks([...selectedBlocks, { entry: fullEntry, scopes: allScopes }]);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create the App Block
      const appBlock = await createAppBlock({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      
      if (!appBlock) {
        throw new Error('Failed to create App Block');
      }
      
      // Install selected connectors with their recipes
      for (const connectorId of selectedConnectors) {
        const recipeId = selectedRecipes[connectorId];
        const connector = connectors.find(c => c.id === connectorId);
        
        if (!connector) continue;
        
        let scopesToInstall: string[];
        
        if (recipeId === 'custom') {
          // For custom, install all scopes
          scopesToInstall = connector.scopes.map(s => s.name);
        } else {
          // Find the recipe and use its scopes
          const recipe = connector.recipes.find(r => r.id === recipeId);
          if (recipe) {
            scopesToInstall = parseScopes(recipe.scopes);
          } else {
            scopesToInstall = connector.scopes.map(s => s.name);
          }
        }
        
        await installConnector(appBlock.id, connectorId, scopesToInstall);
      }

      // Install selected App Blocks
      for (const selectedBlock of selectedBlocks) {
        await installAppBlock(
          appBlock.id,
          selectedBlock.entry.appBlockId,
          selectedBlock.scopes,
          'user'
        );
      }
      
      // Redirect to the new App Block
      router.push(`/app-blocks/${appBlock.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create App Block');
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || connectorsLoading) {
    return <Loading text="Loading..." />;
  }

  if (!user) {
    return null;
  }

  const stepIndex = ['details', 'connectors', 'blocks', 'recipes', 'review'].indexOf(step);

  return (
    <Container>
      <Head>
        <title>Create App Block | Renaissance City</title>
        <meta name="description" content="Create a new App Block for Renaissance City" />
      </Head>

      <Header>
        <BackLink href="/app-blocks">← Back to App Blocks</BackLink>
        <PageTitle>Create New App Block</PageTitle>
        <PageSubtitle>
          Build a new application that connects to Renaissance City districts
        </PageSubtitle>
      </Header>

      <Main>
        <StepIndicator>
          <Step $active={step === 'details'} $completed={stepIndex > 0}>
            {stepIndex > 0 ? '✓' : '1'}
          </Step>
          <StepLine $completed={stepIndex > 0} />
          <Step $active={step === 'connectors'} $completed={stepIndex > 1}>
            {stepIndex > 1 ? '✓' : '2'}
          </Step>
          <StepLine $completed={stepIndex > 1} />
          <Step $active={step === 'blocks'} $completed={stepIndex > 2}>
            {stepIndex > 2 ? '✓' : '3'}
          </Step>
          <StepLine $completed={stepIndex > 2} />
          <Step $active={step === 'recipes'} $completed={stepIndex > 3}>
            {stepIndex > 3 ? '✓' : '4'}
          </Step>
          <StepLine $completed={stepIndex > 3} />
          <Step $active={step === 'review'} $completed={false}>
            5
          </Step>
        </StepIndicator>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <FormSection>
          {step === 'details' && (
            <>
              <FormGroup>
                <Label htmlFor="name">Block Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name for your App Block"
                  maxLength={100}
                  autoFocus
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what your App Block does..."
                  maxLength={500}
                />
              </FormGroup>
            </>
          )}

          {step === 'connectors' && (
            <ConnectorPicker
              connectors={connectors}
              selectedConnectors={selectedConnectors}
              onSelectionChange={setSelectedConnectors}
            />
          )}

          {step === 'blocks' && (
            <div>
              <h3 style={{ 
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.25rem',
                marginBottom: '0.5rem',
              }}>
                Connect to Other App Blocks
              </h3>
              <p style={{
                fontFamily: "'Crimson Pro', Georgia, serif",
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
              }}>
                Optionally connect to other App Blocks in the registry to extend your functionality.
                {selectedBlocks.length > 0 && ` (${selectedBlocks.length} selected)`}
              </p>
              
              {selectedBlocks.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <Label>Selected Blocks</Label>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                  }}>
                    {selectedBlocks.map(block => (
                      <div key={block.entry.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--accent-20)',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                      }}>
                        <span>{block.entry.displayName}</span>
                        <button
                          type="button"
                          onClick={() => handleSelectBlock(block.entry)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            opacity: 0.7,
                            fontSize: '0.8rem',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ 
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1rem',
                maxHeight: '400px',
                overflowY: 'auto',
              }}>
                {registryEntries.length === 0 ? (
                  <p style={{
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontFamily: "'Crimson Pro', Georgia, serif",
                    padding: '2rem',
                  }}>
                    No blocks available in the registry yet. You can skip this step.
                  </p>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '0.75rem',
                  }}>
                    {registryEntries.map(entry => {
                      const isSelected = selectedBlocks.some(b => b.entry.id === entry.id);
                      return (
                        <button
                          type="button"
                          key={entry.id}
                          onClick={() => handleSelectBlock(entry)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            background: isSelected ? 'var(--accent-20)' : 'var(--background-alt)',
                            border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: entry.iconUrl 
                              ? `url(${entry.iconUrl}) center/cover`
                              : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-gold) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1rem',
                            flexShrink: 0,
                          }}>
                            {!entry.iconUrl && entry.displayName.charAt(0)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {entry.displayName}
                            </div>
                            <div style={{
                              fontFamily: "'Crimson Pro', Georgia, serif",
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                            }}>
                              {entry.category}
                            </div>
                          </div>
                          {isSelected && (
                            <span style={{ color: 'var(--accent)' }}>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'recipes' && (
            <RecipeSelector
              connectors={selectedConnectorObjects}
              selectedRecipes={selectedRecipes}
              onRecipeSelect={(connectorId, recipeId) => {
                setSelectedRecipes(prev => ({
                  ...prev,
                  [connectorId]: recipeId,
                }));
              }}
            />
          )}

          {step === 'review' && (
            <div>
              <h3 style={{ 
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.25rem',
                marginBottom: '1rem',
              }}>
                Review Your App Block
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <Label>Name</Label>
                <p style={{ 
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: '1.1rem',
                  margin: '0.25rem 0 0 0',
                }}>
                  {name}
                </p>
              </div>
              
              {description && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <Label>Description</Label>
                  <p style={{ 
                    fontFamily: "'Crimson Pro', Georgia, serif",
                    fontSize: '1rem',
                    margin: '0.25rem 0 0 0',
                  }}>
                    {description}
                  </p>
                </div>
              )}
              
              <div>
                <Label>Connected Districts</Label>
                <div style={{ marginTop: '0.5rem' }}>
                  {selectedConnectorObjects.map(connector => {
                    const recipeId = selectedRecipes[connector.id];
                    const recipe = recipeId !== 'custom' 
                      ? connector.recipes.find(r => r.id === recipeId)
                      : null;
                    
                    return (
                      <div key={connector.id} style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid var(--border)',
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {connector.id === 'events' ? '📅' : 
                           connector.id === 'collab' ? '🤝' :
                           connector.id === 'djq' ? '🎵' :
                           connector.id === 'gamenight' ? '🎮' : '🔌'}
                        </span>
                        <div>
                          <strong>{connector.name}</strong>
                          <span style={{ 
                            marginLeft: '0.5rem',
                            fontSize: '0.85rem',
                            opacity: 0.7,
                          }}>
                            {recipe ? recipe.name : 'Custom configuration'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedBlocks.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <Label>Connected App Blocks</Label>
                  <div style={{ marginTop: '0.5rem' }}>
                    {selectedBlocks.map(block => (
                      <div key={block.entry.id} style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid var(--border)',
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>🔗</span>
                        <div>
                          <strong>{block.entry.displayName}</strong>
                          <span style={{ 
                            marginLeft: '0.5rem',
                            fontSize: '0.85rem',
                            opacity: 0.7,
                          }}>
                            {block.scopes.length} scope{block.scopes.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Actions>
            {step !== 'details' && (
              <Button type="button" onClick={handleBack} disabled={isSubmitting}>
                ← Back
              </Button>
            )}
            
            {step !== 'review' ? (
              <Button type="button" $primary onClick={handleNext}>
                Continue →
              </Button>
            ) : (
              <Button 
                type="button"
                $primary 
                onClick={handleCreate}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create App Block'}
              </Button>
            )}
          </Actions>
        </FormSection>
      </Main>
    </Container>
  );
};

export default NewAppBlockPage;
