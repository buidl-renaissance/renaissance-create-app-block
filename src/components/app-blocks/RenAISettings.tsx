import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { RenAIConfig } from '@/db/schema';

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

const Section = styled.section`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 1.5rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const RenAIIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
`;

const SectionTitle = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const SectionDescription = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const HelpText = styled.span`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.glow};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    opacity: 0.6;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

const PrimaryButton = styled.button`
  flex: 1;
  min-width: 150px;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 150%);
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${({ theme }) => theme.accent}44;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  color: ${({ theme }) => theme.text};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
  }
`;

const StatusMessage = styled.div<{ $type: 'success' | 'error' }>`
  padding: 0.75rem 1rem;
  background: ${({ $type }) => 
    $type === 'success' ? '#22c55e20' : '#ef444420'};
  border-radius: 8px;
  color: ${({ $type }) => 
    $type === 'success' ? '#22c55e' : '#ef4444'};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
`;

const ConnectionStatus = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: ${({ $connected }) => $connected ? '#22c55e15' : '#f59e0b15'};
  border-radius: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.8rem;
  color: ${({ $connected }) => $connected ? '#22c55e' : '#f59e0b'};
`;

const StatusDot = styled.div<{ $connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $connected }) => $connected ? '#22c55e' : '#f59e0b'};
`;

interface RenAISettingsProps {
  appBlockId: string;
  existingConfig?: RenAIConfig | null;
  onSave?: (config: RenAIConfig) => void;
}

export const RenAISettings: React.FC<RenAISettingsProps> = ({
  appBlockId,
  existingConfig,
  onSave,
}) => {
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [workflowFile, setWorkflowFile] = useState('');
  const [branch, setBranch] = useState('main');
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (existingConfig) {
      setRepoOwner(existingConfig.repoOwner || '');
      setRepoName(existingConfig.repoName || '');
      setWorkflowFile(existingConfig.workflowFile || '');
      setBranch(existingConfig.branch || 'main');
    }
  }, [existingConfig]);

  const isConfigured = !!repoOwner && !!repoName;
  const hasExistingConfig = !!existingConfig?.repoOwner && !!existingConfig?.repoName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/app-blocks/${appBlockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubRepoOwner: repoOwner || null,
          githubRepoName: repoName || null,
          githubWorkflowFile: workflowFile || null,
          githubBranch: branch || 'main',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save settings');
      }

      const newConfig: RenAIConfig = {
        repoOwner,
        repoName,
        workflowFile,
        branch,
      };

      setMessage({ type: 'success', text: 'Ren.AI settings saved!' });
      onSave?.(newConfig);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save settings' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setRepoOwner('');
    setRepoName('');
    setWorkflowFile('');
    setBranch('main');
    setMessage(null);
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Section>
          <SectionHeader>
            <RenAIIcon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </RenAIIcon>
            <SectionTitle>Ren.AI Repository</SectionTitle>
          </SectionHeader>
          
          <SectionDescription>
            Connect a repository in the Ren.AI workspace to enable automated code changes. 
            When triggered, Claude will make updates directly to your codebase based on 
            your app block&apos;s PRD and requirements.
          </SectionDescription>

          <ConnectionStatus $connected={hasExistingConfig}>
            <StatusDot $connected={hasExistingConfig} />
            {hasExistingConfig 
              ? `Connected to ${existingConfig?.repoOwner}/${existingConfig?.repoName}` 
              : 'Not configured'}
          </ConnectionStatus>
          
          <Row style={{ marginTop: '1.5rem' }}>
            <Field>
              <Label>Repository Owner</Label>
              <HelpText>GitHub username or organization</HelpText>
              <Input
                type="text"
                value={repoOwner}
                onChange={e => setRepoOwner(e.target.value)}
                placeholder="my-org"
              />
            </Field>
            
            <Field>
              <Label>Repository Name</Label>
              <HelpText>Name of the repository</HelpText>
              <Input
                type="text"
                value={repoName}
                onChange={e => setRepoName(e.target.value)}
                placeholder="my-app-block"
              />
            </Field>
          </Row>

          <Row style={{ marginTop: '1rem' }}>
            <Field>
              <Label>Workflow File (Optional)</Label>
              <HelpText>GitHub workflow file name</HelpText>
              <Input
                type="text"
                value={workflowFile}
                onChange={e => setWorkflowFile(e.target.value)}
                placeholder="build.yml"
              />
            </Field>
            
            <Field>
              <Label>Branch</Label>
              <HelpText>Target branch for changes</HelpText>
              <Input
                type="text"
                value={branch}
                onChange={e => setBranch(e.target.value)}
                placeholder="main"
              />
            </Field>
          </Row>
        </Section>

        {message && (
          <StatusMessage $type={message.type}>
            {message.text}
          </StatusMessage>
        )}

        <Actions>
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? 'Saving...' : hasExistingConfig ? 'Update Settings' : 'Save Settings'}
          </PrimaryButton>
          
          {(isConfigured || hasExistingConfig) && (
            <SecondaryButton type="button" onClick={handleClear}>
              Clear
            </SecondaryButton>
          )}
        </Actions>
      </Form>
    </Container>
  );
};

export default RenAISettings;
