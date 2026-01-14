import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppBlock, ProviderConfig, AppBlockWithInstallations } from '@/contexts/AppBlockContext';
import { ProviderSettings } from '@/components/app-blocks';
import { useUser } from '@/contexts/UserContext';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
  padding: 2rem;
  
  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const Main = styled.main`
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
`;

const Title = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const Subtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  font-family: 'Crimson Pro', Georgia, serif;
  color: ${({ theme }) => theme.textSecondary};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
`;

const ErrorTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem 0;
`;

const ErrorText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
`;

const Section = styled.section`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 1rem 0;
`;

const SectionDescription = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1rem 0;
  line-height: 1.6;
`;

const NotConfiguredSection = styled.div`
  text-align: center;
  padding: 2rem;
`;

const NotConfiguredIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const NotConfiguredTitle = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem 0;
`;

const NotConfiguredText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1.5rem 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const ConfigureButton = styled.button`
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 150%);
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${({ theme }) => theme.accent}44;
  }
`;

export default function ProviderPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: userLoading } = useUser();
  const { fetchAppBlock, getProvider } = useAppBlock();
  
  const [appBlock, setAppBlock] = useState<AppBlockWithInstallations | null>(null);
  const [provider, setProvider] = useState<ProviderConfig | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || typeof id !== 'string') return;
      
      setLoading(true);
      
      const block = await fetchAppBlock(id);
      setAppBlock(block);
      
      if (block) {
        const providerData = await getProvider(id);
        setProvider(providerData);
      }
      
      setLoading(false);
    };
    
    if (!userLoading) {
      fetchData();
    }
  }, [id, userLoading, fetchAppBlock, getProvider]);

  const handleProviderSave = async (newProvider: ProviderConfig) => {
    setProvider(newProvider);
    setShowSettings(false);
  };

  const handleProviderDelete = () => {
    setProvider(null);
    setShowSettings(false);
  };

  if (userLoading || loading) {
    return (
      <Container>
        <Main>
          <LoadingState>Loading...</LoadingState>
        </Main>
      </Container>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  if (!appBlock) {
    return (
      <Container>
        <Main>
          <ErrorState>
            <ErrorTitle>App Block Not Found</ErrorTitle>
            <ErrorText>The requested App Block could not be found.</ErrorText>
          </ErrorState>
        </Main>
      </Container>
    );
  }

  if (appBlock.ownerUserId !== user.id) {
    return (
      <Container>
        <Main>
          <ErrorState>
            <ErrorTitle>Access Denied</ErrorTitle>
            <ErrorText>You don&apos;t have permission to configure this block.</ErrorText>
          </ErrorState>
        </Main>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Provider Settings - {appBlock.name} | Renaissance City</title>
        <meta name="description" content={`Configure provider settings for ${appBlock.name}`} />
      </Head>
      
      <Container>
        <Main>
          <Header>
            <BackLink href={`/app-blocks/${id}`}>
              ← Back to {appBlock.name}
            </BackLink>
            
            <TitleSection>
              <Title>Provider Settings</Title>
            </TitleSection>
            <Subtitle>
              Configure {appBlock.name} as a provider so other blocks can connect to it.
            </Subtitle>
          </Header>
          
          <Section>
            <SectionTitle>What is a Provider?</SectionTitle>
            <SectionDescription>
              When you configure your block as a provider, other App Blocks can connect to yours 
              and access the scopes you define. This enables powerful app-to-app integrations 
              across the Renaissance City ecosystem.
            </SectionDescription>
          </Section>
          
          {provider === undefined ? (
            <LoadingState>Loading provider configuration...</LoadingState>
          ) : provider === null && !showSettings ? (
            <Section>
              <NotConfiguredSection>
                <NotConfiguredIcon>🔌</NotConfiguredIcon>
                <NotConfiguredTitle>Not Configured as Provider</NotConfiguredTitle>
                <NotConfiguredText>
                  This block is not yet set up as a provider. Configure it to let other 
                  blocks connect and access your capabilities.
                </NotConfiguredText>
                <ConfigureButton onClick={() => setShowSettings(true)}>
                  Configure as Provider
                </ConfigureButton>
              </NotConfiguredSection>
            </Section>
          ) : (
            <ProviderSettings
              appBlockId={id as string}
              existingProvider={provider}
              onSave={handleProviderSave}
              onDelete={handleProviderDelete}
            />
          )}
        </Main>
      </Container>
    </>
  );
}
