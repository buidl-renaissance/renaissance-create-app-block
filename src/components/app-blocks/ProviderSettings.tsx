import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAppBlock, ProviderConfig } from '@/contexts/AppBlockContext';

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

const SectionTitle = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 1rem 0;
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

const Select = styled.select`
  padding: 0.75rem 1rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.glow};
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const ScopesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ScopeItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-radius: 10px;
`;

const ScopeInputs = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ScopeRow = styled.div`
  display: flex;
  gap: 0.75rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const SmallInput = styled(Input)`
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
`;

const RemoveButton = styled.button`
  padding: 0.5rem;
  background: ${({ theme }) => theme.error}20;
  border: none;
  border-radius: 8px;
  color: ${({ theme }) => theme.error};
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.error}30;
  }
`;

const AddButton = styled.button`
  padding: 0.75rem 1rem;
  background: transparent;
  border: 2px dashed ${({ theme }) => theme.border};
  border-radius: 10px;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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

const DangerButton = styled.button`
  padding: 0.875rem 1.5rem;
  background: ${({ theme }) => theme.error}15;
  border: 2px solid ${({ theme }) => theme.error}40;
  border-radius: 10px;
  color: ${({ theme }) => theme.error};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.error}25;
    border-color: ${({ theme }) => theme.error};
  }
`;

const StatusMessage = styled.div<{ $type: 'success' | 'error' }>`
  padding: 0.75rem 1rem;
  background: ${({ theme, $type }) => 
    $type === 'success' ? '#22c55e' : theme.error}20;
  border-radius: 8px;
  color: ${({ theme, $type }) => 
    $type === 'success' ? '#22c55e' : theme.error};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
`;

interface ScopeInput {
  scope_name: string;
  description: string;
  is_public_read: boolean;
  required_role: string;
}

interface ProviderSettingsProps {
  appBlockId: string;
  existingProvider?: ProviderConfig | null;
  onSave?: (provider: ProviderConfig) => void;
  onDelete?: () => void;
}

export const ProviderSettings: React.FC<ProviderSettingsProps> = ({
  appBlockId,
  existingProvider,
  onSave,
  onDelete,
}) => {
  const { createProvider, updateProvider, deleteProvider } = useAppBlock();
  
  const [baseApiUrl, setBaseApiUrl] = useState('');
  const [apiVersion, setApiVersion] = useState('v1');
  const [authMethods, setAuthMethods] = useState<('user' | 'service')[]>(['user']);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(120);
  const [scopes, setScopes] = useState<ScopeInput[]>([]);
  const [status, setStatus] = useState<'active' | 'deprecated' | 'disabled'>('active');
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (existingProvider) {
      setBaseApiUrl(existingProvider.baseApiUrl);
      setApiVersion(existingProvider.apiVersion);
      setAuthMethods(existingProvider.auth_methods_parsed as ('user' | 'service')[]);
      setRateLimitPerMinute(existingProvider.rateLimitPerMinute);
      setStatus(existingProvider.status as 'active' | 'deprecated' | 'disabled');
      setScopes(existingProvider.scopes.map(s => ({
        scope_name: s.scope_name,
        description: s.description || '',
        is_public_read: s.is_public_read,
        required_role: s.required_role || '',
      })));
    }
  }, [existingProvider]);

  const handleAddScope = () => {
    setScopes([...scopes, {
      scope_name: '',
      description: '',
      is_public_read: false,
      required_role: '',
    }]);
  };

  const handleRemoveScope = (index: number) => {
    setScopes(scopes.filter((_, i) => i !== index));
  };

  const handleScopeChange = (index: number, field: keyof ScopeInput, value: string | boolean) => {
    const newScopes = [...scopes];
    newScopes[index] = { ...newScopes[index], [field]: value };
    setScopes(newScopes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const validScopes = scopes.filter(s => s.scope_name.trim());
      
      const data = {
        base_api_url: baseApiUrl,
        api_version: apiVersion,
        auth_methods: authMethods,
        rate_limit_per_minute: rateLimitPerMinute,
        scopes: validScopes,
        status,
      };

      let result;
      if (existingProvider) {
        result = await updateProvider(appBlockId, data);
      } else {
        result = await createProvider(appBlockId, data);
      }

      if (result) {
        setMessage({ type: 'success', text: existingProvider ? 'Provider updated!' : 'Provider created!' });
        onSave?.(result);
      } else {
        throw new Error('Failed to save provider');
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save provider settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingProvider) return;
    
    if (!confirm('Are you sure you want to remove the provider interface? This will prevent other blocks from connecting to yours.')) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const success = await deleteProvider(appBlockId);
      if (success) {
        setMessage({ type: 'success', text: 'Provider removed' });
        onDelete?.();
      } else {
        throw new Error('Failed to delete provider');
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete provider' });
    } finally {
      setDeleting(false);
    }
  };

  const handleAuthMethodToggle = (method: 'user' | 'service') => {
    if (authMethods.includes(method)) {
      if (authMethods.length > 1) {
        setAuthMethods(authMethods.filter(m => m !== method));
      }
    } else {
      setAuthMethods([...authMethods, method]);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Section>
          <SectionTitle>Provider Configuration</SectionTitle>
          
          <Field>
            <Label>Base API URL</Label>
            <HelpText>Where your provider API listens for requests</HelpText>
            <Input
              type="url"
              value={baseApiUrl}
              onChange={e => setBaseApiUrl(e.target.value)}
              placeholder="https://api.yourblock.com/v1"
              required
            />
          </Field>
          
          <Field style={{ marginTop: '1rem' }}>
            <Label>API Version</Label>
            <Input
              type="text"
              value={apiVersion}
              onChange={e => setApiVersion(e.target.value)}
              placeholder="v1"
            />
          </Field>
          
          <Field style={{ marginTop: '1rem' }}>
            <Label>Rate Limit (requests per minute)</Label>
            <Input
              type="number"
              value={rateLimitPerMinute}
              onChange={e => setRateLimitPerMinute(parseInt(e.target.value) || 120)}
              min={1}
              max={10000}
            />
          </Field>
          
          <Field style={{ marginTop: '1rem' }}>
            <Label>Authentication Methods</Label>
            <CheckboxRow>
              <Checkbox
                type="checkbox"
                checked={authMethods.includes('user')}
                onChange={() => handleAuthMethodToggle('user')}
              />
              <span>User-delegated access</span>
            </CheckboxRow>
            <CheckboxRow>
              <Checkbox
                type="checkbox"
                checked={authMethods.includes('service')}
                onChange={() => handleAuthMethodToggle('service')}
              />
              <span>Service account access</span>
            </CheckboxRow>
          </Field>
          
          {existingProvider && (
            <Field style={{ marginTop: '1rem' }}>
              <Label>Status</Label>
              <Select value={status} onChange={e => setStatus(e.target.value as typeof status)}>
                <option value="active">Active</option>
                <option value="deprecated">Deprecated</option>
                <option value="disabled">Disabled</option>
              </Select>
            </Field>
          )}
        </Section>

        <Section>
          <SectionTitle>Scopes</SectionTitle>
          <HelpText style={{ marginBottom: '1rem', display: 'block' }}>
            Define the capabilities other blocks can request
          </HelpText>
          
          <ScopesSection>
            {scopes.map((scope, index) => (
              <ScopeItem key={index}>
                <ScopeInputs>
                  <ScopeRow>
                    <SmallInput
                      type="text"
                      value={scope.scope_name}
                      onChange={e => handleScopeChange(index, 'scope_name', e.target.value)}
                      placeholder="e.g., myblock.data.read"
                    />
                    <SmallInput
                      type="text"
                      value={scope.required_role}
                      onChange={e => handleScopeChange(index, 'required_role', e.target.value)}
                      placeholder="Required role (optional)"
                      style={{ maxWidth: '160px' }}
                    />
                  </ScopeRow>
                  <SmallInput
                    type="text"
                    value={scope.description}
                    onChange={e => handleScopeChange(index, 'description', e.target.value)}
                    placeholder="Description of what this scope allows"
                  />
                  <CheckboxRow>
                    <Checkbox
                      type="checkbox"
                      checked={scope.is_public_read}
                      onChange={e => handleScopeChange(index, 'is_public_read', e.target.checked)}
                    />
                    <span style={{ fontSize: '0.85rem' }}>Public read (no user consent required)</span>
                  </CheckboxRow>
                </ScopeInputs>
                <RemoveButton type="button" onClick={() => handleRemoveScope(index)}>
                  ✕
                </RemoveButton>
              </ScopeItem>
            ))}
            
            <AddButton type="button" onClick={handleAddScope}>
              + Add Scope
            </AddButton>
          </ScopesSection>
        </Section>

        {message && (
          <StatusMessage $type={message.type}>
            {message.text}
          </StatusMessage>
        )}

        <Actions>
          <PrimaryButton type="submit" disabled={saving || !baseApiUrl}>
            {saving ? 'Saving...' : existingProvider ? 'Update Provider' : 'Create Provider'}
          </PrimaryButton>
          
          {existingProvider && (
            <DangerButton type="button" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Removing...' : 'Remove Provider'}
            </DangerButton>
          )}
        </Actions>
      </Form>
    </Container>
  );
};

export default ProviderSettings;
