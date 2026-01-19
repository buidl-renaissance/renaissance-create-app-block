import React, { useEffect, useState } from "react";
import Head from "next/head";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";
import { useUser } from "@/contexts/UserContext";
import { Loading } from "@/components/Loading";

const APP_NAME = "Renaissance City";

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
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ theme }) => theme.background};
  padding: 2rem 1.5rem;
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 500px;
  width: 100%;
  animation: ${fadeIn} 0.5s ease-out;
`;

const BackLink = styled.a`
  align-self: flex-start;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`;

const Title = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const Divider = styled.div`
  width: 60px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    ${({ theme }) => theme.accentGold},
    transparent
  );
  margin: 0 auto 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
`;

const Label = styled.label`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  
  span {
    color: ${({ theme }) => theme.textSecondary};
    font-weight: 400;
    font-size: 0.85rem;
  }
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.875rem 1rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme, $hasError }) => $hasError ? theme.danger : theme.border};
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    opacity: 0.6;
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => $hasError ? theme.danger : theme.accentGold};
    box-shadow: 0 0 0 3px ${({ theme, $hasError }) => 
      $hasError ? theme.dangerMuted : `${theme.accentGold}20`};
  }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  padding: 0.875rem 1rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme, $hasError }) => $hasError ? theme.danger : theme.border};
  border-radius: 8px;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    opacity: 0.6;
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => $hasError ? theme.danger : theme.accentGold};
    box-shadow: 0 0 0 3px ${({ theme, $hasError }) => 
      $hasError ? theme.dangerMuted : `${theme.accentGold}20`};
  }
`;

const ErrorText = styled.span`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.danger};
`;

const SubmitButton = styled.button<{ $loading?: boolean }>`
  margin-top: 0.5rem;
  padding: 1rem 1.5rem;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.accent} 0%,
    ${({ theme }) => theme.accentGold} 100%
  );
  border: none;
  border-radius: 8px;
  cursor: ${({ $loading }) => $loading ? 'wait' : 'pointer'};
  opacity: ${({ $loading }) => $loading ? 0.7 : 1};
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px ${({ theme }) => theme.shadow};
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px ${({ theme }) => theme.shadow};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GeneralError = styled.div`
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.dangerMuted};
  border: 1px solid ${({ theme }) => theme.danger};
  border-radius: 8px;
  color: ${({ theme }) => theme.danger};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  text-align: center;
`;

interface FormErrors {
  name?: string;
  description?: string;
  iconUrl?: string;
  gitHubUrl?: string;
  appUrl?: string;
  tags?: string;
  general?: string;
}

const RegisterAppPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [gitHubUrl, setGitHubUrl] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse tags from comma-separated input
  const parseTags = (input: string): string[] => {
    return input
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
  };

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/auth');
    }
  }, [isUserLoading, user, router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'App name is required';
    } else if (name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less';
    }
    
    if (description && description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }
    
    if (iconUrl) {
      try {
        const url = new URL(iconUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.iconUrl = 'Please enter a valid URL';
        }
      } catch {
        newErrors.iconUrl = 'Please enter a valid URL';
      }
    }
    
    if (gitHubUrl) {
      try {
        const url = new URL(gitHubUrl);
        if (!['github.com', 'www.github.com'].includes(url.hostname)) {
          newErrors.gitHubUrl = 'Please enter a valid GitHub URL';
        }
      } catch {
        newErrors.gitHubUrl = 'Please enter a valid GitHub URL';
      }
    }
    
    if (appUrl) {
      try {
        const url = new URL(appUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.appUrl = 'Please enter a valid URL';
        }
      } catch {
        newErrors.appUrl = 'Please enter a valid URL';
      }
    }
    
    // Validate tags
    const tags = parseTags(tagsInput);
    if (tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    } else if (tags.some(tag => tag.length > 30)) {
      newErrors.tags = 'Each tag must be 30 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const tags = parseTags(tagsInput);
      
      const response = await fetch('/api/app-blocks/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          iconUrl: iconUrl.trim() || undefined,
          gitHubUrl: gitHubUrl.trim() || undefined,
          appUrl: appUrl.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.error || 'Failed to register app' });
        }
        return;
      }
      
      // Success - redirect to the app block page
      router.push(`/app-blocks/${data.appBlock.id}`);
    } catch (error) {
      console.error('Register app error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (isUserLoading || !user) {
    return <Loading text="Loading..." />;
  }

  return (
    <Container>
      <Head>
        <title>Register App | {APP_NAME}</title>
        <meta name="description" content={`Register your app with ${APP_NAME}`} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Main>
        <BackLink onClick={() => router.back()}>← Back</BackLink>
        
        <Title>Register Your App</Title>
        <Subtitle>
          Add your app to Renaissance City by providing the details below.
        </Subtitle>
        <Divider />
        
        <Form onSubmit={handleSubmit}>
          {errors.general && <GeneralError>{errors.general}</GeneralError>}
          
          <InputGroup>
            <Label htmlFor="name">App Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome App"
              $hasError={!!errors.name}
              autoFocus
            />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="description">
              Description <span>(optional)</span>
            </Label>
            <TextArea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief tagline describing what your app does..."
              $hasError={!!errors.description}
            />
            {errors.description && <ErrorText>{errors.description}</ErrorText>}
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="iconUrl">
              Icon URL <span>(optional)</span>
            </Label>
            <Input
              id="iconUrl"
              type="url"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://example.com/icon.png"
              $hasError={!!errors.iconUrl}
            />
            {errors.iconUrl && <ErrorText>{errors.iconUrl}</ErrorText>}
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="gitHubUrl">
              GitHub URL <span>(optional)</span>
            </Label>
            <Input
              id="gitHubUrl"
              type="url"
              value={gitHubUrl}
              onChange={(e) => setGitHubUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              $hasError={!!errors.gitHubUrl}
            />
            {errors.gitHubUrl && <ErrorText>{errors.gitHubUrl}</ErrorText>}
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="appUrl">
              App URL <span>(optional)</span>
            </Label>
            <Input
              id="appUrl"
              type="url"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              placeholder="https://myapp.com"
              $hasError={!!errors.appUrl}
            />
            {errors.appUrl && <ErrorText>{errors.appUrl}</ErrorText>}
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="tags">
              Tags <span>(optional, comma-separated)</span>
            </Label>
            <Input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ai, productivity, tools"
              $hasError={!!errors.tags}
            />
            {errors.tags && <ErrorText>{errors.tags}</ErrorText>}
          </InputGroup>
          
          <SubmitButton type="submit" disabled={isSubmitting} $loading={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register App'}
          </SubmitButton>
        </Form>
      </Main>
    </Container>
  );
};

export default RegisterAppPage;
