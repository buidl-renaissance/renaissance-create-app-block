import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useAppBlock, AppBlockWithInstallations, ProviderConfig } from '@/contexts/AppBlockContext';
import { Loading } from '@/components/Loading';
import { ConnectorHealth, BlockInstallations } from '@/components/app-blocks';

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

const TitleSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
`;

const BlockIcon = styled.div<{ $iconUrl?: string | null }>`
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: ${({ $iconUrl, theme }) => 
    $iconUrl 
      ? `url(${$iconUrl}) center/cover no-repeat` 
      : `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentGold} 100%)`
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  font-family: 'Cormorant Garamond', Georgia, serif;
  flex-shrink: 0;
`;

const TitleInfo = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem 0;
`;

const PageSubtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

const Main = styled.main`
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.section`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const AddButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accent};
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ActionCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    transform: translateY(-2px);
  }
`;

const ActionIcon = styled.span`
  font-size: 1.5rem;
`;

const ActionLabel = styled.span`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
`;

const DangerSection = styled.section`
  background: ${({ theme }) => theme.surface};
  border: 1px solid #ef444440;
  border-radius: 20px;
  padding: 1.5rem;
  animation: ${fadeIn} 0.4s ease-out 0.2s both;
`;

const DangerTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ef4444;
  margin: 0 0 0.5rem 0;
`;

const DangerText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1rem 0;
`;

const DangerButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #ef4444;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ef4444;
    color: white;
  }
`;

const ConfirmModal = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
`;

const ConfirmCard = styled.div`
  width: 100%;
  max-width: 400px;
  background: ${({ theme }) => theme.surface};
  border-radius: 20px;
  padding: 2rem;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ConfirmTitle = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.75rem 0;
`;

const ConfirmText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1.5rem 0;
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ConfirmButton = styled.button<{ $danger?: boolean }>`
  flex: 1;
  padding: 0.75rem;
  border-radius: 10px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $danger, theme }) => $danger ? `
    background: #ef4444;
    border: none;
    color: white;
    
    &:hover {
      background: #dc2626;
    }
  ` : `
    background: transparent;
    border: 1px solid ${theme.border};
    color: ${theme.textSecondary};
    
    &:hover {
      border-color: ${theme.text};
      color: ${theme.text};
    }
  `}
`;

const AppBlockDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: isUserLoading } = useUser();
  const { 
    fetchAppBlock, 
    deleteAppBlock, 
    revokeConnector,
    connectors,
    fetchConnectors,
    getProvider,
  } = useAppBlock();
  
  const [appBlock, setAppBlock] = useState<AppBlockWithInstallations | null>(null);
  const [provider, setProvider] = useState<ProviderConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    if (id && typeof id === 'string' && user) {
      setIsLoading(true);
      Promise.all([
        fetchAppBlock(id),
        getProvider(id),
      ]).then(([block, providerData]) => {
        setAppBlock(block);
        setProvider(providerData);
        setIsLoading(false);
      });
      fetchConnectors();
    }
  }, [id, user, fetchAppBlock, fetchConnectors, getProvider]);

  const handleDelete = async () => {
    if (!appBlock) return;
    
    setIsDeleting(true);
    const success = await deleteAppBlock(appBlock.id);
    
    if (success) {
      router.push('/app-blocks');
    } else {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleRevoke = async (installationId: string) => {
    await revokeConnector(installationId);
    // Refresh the app block data
    if (id && typeof id === 'string') {
      const updated = await fetchAppBlock(id);
      setAppBlock(updated);
    }
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

  return (
    <Container>
      <Head>
        <title>{appBlock.name} | Renaissance City</title>
        <meta name="description" content={appBlock.description || `Manage ${appBlock.name}`} />
      </Head>

      <Header>
        <BackLink href="/app-blocks">← Back to App Blocks</BackLink>
        <TitleSection>
          <BlockIcon $iconUrl={appBlock.iconUrl}>
            {!appBlock.iconUrl && appBlock.name.charAt(0).toUpperCase()}
          </BlockIcon>
          <TitleInfo>
            <PageTitle>{appBlock.name}</PageTitle>
            <PageSubtitle>
              {appBlock.description || 'No description provided'}
            </PageSubtitle>
          </TitleInfo>
        </TitleSection>
      </Header>

      <Main>
        <Section>
          <SectionHeader>
            <SectionTitle>Quick Actions</SectionTitle>
          </SectionHeader>
          <QuickActions>
            <ActionCard 
              type="button"
              onClick={() => router.push('/explore')}
            >
              <ActionIcon>🔗</ActionIcon>
              <ActionLabel>Connect Blocks</ActionLabel>
            </ActionCard>
            <ActionCard 
              type="button"
              onClick={() => router.push(`/app-blocks/${appBlock.id}/provider`)}
            >
              <ActionIcon>🔌</ActionIcon>
              <ActionLabel>{provider ? 'Provider Settings' : 'Become Provider'}</ActionLabel>
            </ActionCard>
            <ActionCard type="button" onClick={() => router.push(`/app-blocks/${appBlock.id}/connect/events`)}>
              <ActionIcon>🏛️</ActionIcon>
              <ActionLabel>Add District</ActionLabel>
            </ActionCard>
          </QuickActions>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Connected App Blocks</SectionTitle>
            <AddButton href="/explore">
              + Browse
            </AddButton>
          </SectionHeader>
          <BlockInstallations 
            appBlockId={appBlock.id}
            showBrowseLink={false}
          />
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Connected Districts</SectionTitle>
            <AddButton href={`/app-blocks/${appBlock.id}/connect/events`}>
              + Add
            </AddButton>
          </SectionHeader>
          <ConnectorHealth 
            installations={appBlock.installations}
            onRevoke={handleRevoke}
          />
        </Section>

        <DangerSection>
          <DangerTitle>Danger Zone</DangerTitle>
          <DangerText>
            Deleting this App Block will permanently remove all its connections and data.
            This action cannot be undone.
          </DangerText>
          <DangerButton type="button" onClick={() => setShowDeleteModal(true)}>
            Delete App Block
          </DangerButton>
        </DangerSection>
      </Main>

      {showDeleteModal && (
        <ConfirmModal onClick={() => setShowDeleteModal(false)}>
          <ConfirmCard onClick={e => e.stopPropagation()}>
            <ConfirmTitle>Delete {appBlock.name}?</ConfirmTitle>
            <ConfirmText>
              This will permanently delete this App Block and all its connections. 
              This action cannot be undone.
            </ConfirmText>
            <ConfirmActions>
              <ConfirmButton 
                type="button" 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </ConfirmButton>
              <ConfirmButton 
                type="button"
                $danger 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </ConfirmButton>
            </ConfirmActions>
          </ConfirmCard>
        </ConfirmModal>
      )}
    </Container>
  );
};

export default AppBlockDetailPage;
