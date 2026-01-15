import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppBlock, RegistryEntryWithProvider, AppBlock } from '@/contexts/AppBlockContext';
import { RegistryDetail, BlockInstaller } from '@/components/app-blocks';
import { useUser } from '@/contexts/UserContext';
import { Modal } from '@/components/Modal';

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

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
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

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.75rem;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem 0;
`;

const ErrorText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1.5rem 0;
`;

const BrowseButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.accent};
  border-radius: 10px;
  color: white;
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${({ theme }) => theme.accent}44;
  }
`;

const ModalContent = styled.div`
  padding: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text};
  margin: 0 0 1rem 0;
`;

const BlockSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  margin-bottom: 1rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
  }
`;

const NoBlocksMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Crimson Pro', Georgia, serif;
`;

const CreateBlockLink = styled(Link)`
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.accent};
  border-radius: 10px;
  color: white;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

export default function ExploreDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useUser();
  const { getRegistryEntry, appBlocks } = useAppBlock();
  
  const [entry, setEntry] = useState<RegistryEntryWithProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [selectedAppBlock, setSelectedAppBlock] = useState<string>('');

  useEffect(() => {
    const fetchEntry = async () => {
      if (!slug || typeof slug !== 'string') return;
      
      setLoading(true);
      setError(null);
      
      const result = await getRegistryEntry(slug);
      
      if (result) {
        setEntry(result);
      } else {
        setError('Block not found');
      }
      
      setLoading(false);
    };
    
    fetchEntry();
  }, [slug, getRegistryEntry]);

  // AppBlockContext already fetches appBlocks when user changes

  useEffect(() => {
    if (appBlocks.length > 0 && !selectedAppBlock) {
      setSelectedAppBlock(appBlocks[0].id);
    }
  }, [appBlocks, selectedAppBlock]);

  const handleInstallClick = () => {
    if (!user) {
      router.push(`/auth?redirect=/explore/${slug}`);
      return;
    }
    
    if (appBlocks.length === 0) {
      setShowInstallModal(true);
      return;
    }
    
    setShowInstallModal(true);
  };

  const handleInstallComplete = () => {
    setShowInstallModal(false);
    router.push(`/app-blocks/${selectedAppBlock}`);
  };

  if (loading) {
    return (
      <Container>
        <Main>
          <BackLink href="/explore">← Back to Registry</BackLink>
          <LoadingState>Loading block details...</LoadingState>
        </Main>
      </Container>
    );
  }

  if (error || !entry) {
    return (
      <Container>
        <Main>
          <BackLink href="/explore">← Back to Registry</BackLink>
          <ErrorState>
            <ErrorIcon>🔍</ErrorIcon>
            <ErrorTitle>Block Not Found</ErrorTitle>
            <ErrorText>
              The block you&apos;re looking for doesn&apos;t exist or has been removed.
            </ErrorText>
            <BrowseButton href="/explore">
              Browse Available Blocks
            </BrowseButton>
          </ErrorState>
        </Main>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{entry.displayName} | Renaissance City</title>
        <meta name="description" content={entry.description || `Explore ${entry.displayName} on Renaissance City`} />
      </Head>
      
      <Container>
        <Main>
          <BackLink href="/explore">← Back to Registry</BackLink>
          
          <RegistryDetail 
            entry={entry} 
            onInstall={entry.installable ? handleInstallClick : undefined}
          />
        </Main>
      </Container>
      
      {showInstallModal && entry && (
        <Modal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)}>
          <ModalContent>
            {appBlocks.length === 0 ? (
              <NoBlocksMessage>
                <ModalTitle>Create an App Block First</ModalTitle>
                <p>You need to have an App Block before you can install other blocks.</p>
                <CreateBlockLink href="/get-started?new=true">
                  Create App Block
                </CreateBlockLink>
              </NoBlocksMessage>
            ) : (
              <>
                <ModalTitle>Install to Your Block</ModalTitle>
                <BlockSelect 
                  value={selectedAppBlock}
                  onChange={e => setSelectedAppBlock(e.target.value)}
                >
                  {appBlocks.map(block => (
                    <option key={block.id} value={block.id}>
                      {block.name}
                    </option>
                  ))}
                </BlockSelect>
                
                <BlockInstaller
                  consumerAppBlockId={selectedAppBlock}
                  providerEntry={entry}
                  onInstall={handleInstallComplete}
                  onCancel={() => setShowInstallModal(false)}
                />
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
