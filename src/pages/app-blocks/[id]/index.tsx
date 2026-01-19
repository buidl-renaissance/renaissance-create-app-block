import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useAppBlock, AppBlockWithInstallations } from '@/contexts/AppBlockContext';
import { Loading } from '@/components/Loading';
import { BlockInstallations, IconEditModal } from '@/components/app-blocks';

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

const IconWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  
  &:hover > div:last-child {
    opacity: 1;
  }
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
  transition: filter 0.2s ease;
  
  ${IconWrapper}:hover & {
    filter: brightness(0.9);
  }
`;

const IconEditButton = styled.div`
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
  }
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

const RegisterAppCard = styled.div<{ $isRegistered?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: ${({ theme, $isRegistered }) => $isRegistered ? theme.accent + '08' : theme.surface};
  border: 1px solid ${({ theme, $isRegistered }) => $isRegistered ? theme.accent + '40' : theme.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 4px 16px ${({ theme }) => theme.shadow};
    transform: translateY(-2px);
  }
`;

const RegisterAppIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const RegisterAppContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const RegisterAppTitle = styled.h4`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem 0;
`;

const RegisterAppDescription = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
  line-height: 1.4;
`;

const RegisterAppArrow = styled.span`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.accent};
  transition: transform 0.2s ease;
  
  ${RegisterAppCard}:hover & {
    transform: translateX(4px);
  }
`;

const RegisterModal = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const RegisterModalCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 40px ${({ theme }) => theme.shadow};
`;

const RegisterModalTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem 0;
`;

const RegisterModalSubtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1.5rem 0;
`;

const RegisterInputGroup = styled.div`
  margin-bottom: 1rem;
`;

const RegisterLabel = styled.label`
  display: block;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
  
  span {
    color: ${({ theme }) => theme.textSecondary};
    font-weight: 400;
  }
`;

const RegisterInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme, $hasError }) => $hasError ? theme.danger : theme.border};
  border-radius: 8px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const RegisterModalError = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.danger};
  margin: 0 0 1rem 0;
  padding: 0.75rem;
  background: ${({ theme }) => theme.dangerMuted};
  border-radius: 8px;
`;

const RegisterModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const RegisterModalButton = styled.button<{ $primary?: boolean; disabled?: boolean }>`
  flex: 1;
  padding: 0.875rem 1.5rem;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  ${({ $primary, theme, disabled }) => $primary ? `
    background: linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentGold} 100%);
    color: white;
    border: none;
    opacity: ${disabled ? 0.7 : 1};
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px ${theme.accent}40;
    }
  ` : `
    background: transparent;
    color: ${theme.textSecondary};
    border: 1px solid ${theme.border};
    
    &:hover {
      border-color: ${theme.text};
      color: ${theme.text};
    }
  `}
`;

const PRDBriefCard = styled(Link)`
  display: block;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const PRDBriefContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PRDTagline = styled.p`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.15rem;
  font-style: italic;
  color: ${({ theme }) => theme.accent};
  margin: 0;
  line-height: 1.4;
`;

const PRDDescription = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PRDFeaturesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const PRDFeatureTag = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  background: ${({ theme }) => theme.accent}15;
  color: ${({ theme }) => theme.accent};
  border-radius: 100px;
`;

const ViewFullPRD = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.accent};
  margin-top: 0.5rem;
  
  &::after {
    content: '→';
    transition: transform 0.2s ease;
  }
  
  ${PRDBriefCard}:hover &::after {
    transform: translateX(4px);
  }
`;

const EmptyPRDState = styled.div`
  text-align: center;
  padding: 1rem 0;
`;

const EmptyPRDText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 0.5rem 0;
`;

const EmptyPRDSubtext = styled.p`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textSecondary};
  opacity: 0.7;
  margin: 0;
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

const OnboardingBanner = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.accent}15 0%, ${({ theme }) => theme.accentGold}15 100%);
  border: 1px solid ${({ theme }) => theme.accent}40;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  animation: ${fadeIn} 0.4s ease-out;
`;

const OnboardingTitle = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem 0;
`;

const OnboardingText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const OnboardingButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 150%);
  border: none;
  border-radius: 10px;
  color: white;
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px ${({ theme }) => theme.accent}44;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${({ theme }) => theme.accent}55;
  }
`;

const DistrictAppsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const DistrictAppCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent}40;
    background: ${({ theme }) => theme.accent}08;
  }
`;

const DistrictIcon = styled.div<{ $imageUrl: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: url(${({ $imageUrl }) => $imageUrl}) center/cover no-repeat;
  border: 2px solid ${({ theme }) => theme.accent};
  flex-shrink: 0;
`;

const DistrictInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const DistrictName = styled.h4`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem 0;
`;

const DistrictDescription = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
  line-height: 1.4;
`;

const ConnectButton = styled(Link)`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.accent};
  border: none;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background: ${({ theme }) => theme.accent}dd;
    transform: translateY(-1px);
  }
`;

const DISTRICT_APPS = [
  {
    id: 'events',
    name: 'Renaissance Events',
    description: 'City-wide events and gatherings',
    imageUrl: '/renaissance-events.png',
  },
  {
    id: 'people',
    name: 'Renaissance People',
    description: 'Connections and social graph',
    imageUrl: '/renaissance-people.png',
  },
];

const AppBlockDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: isUserLoading } = useUser();
  const { 
    fetchAppBlock, 
    deleteAppBlock, 
    fetchConnectors,
  } = useAppBlock();
  
  const [appBlock, setAppBlock] = useState<AppBlockWithInstallations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showIconEditModal, setShowIconEditModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [prdData, setPrdData] = useState<{
    tagline?: string;
    description?: string;
    features?: string[];
  } | null>(null);
  
  // Registration form state
  const [gitHubUrl, setGitHubUrl] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [isSavingUrls, setIsSavingUrls] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    if (id && typeof id === 'string' && user) {
      setIsLoading(true);
      fetchAppBlock(id).then((block) => {
        setAppBlock(block);
        
        // Check if block needs onboarding and extract PRD data
        if (block && block.onboardingData) {
          try {
            const data = JSON.parse(block.onboardingData as string);
            const hasPrd = !!data.prd;
            const stage = block.onboardingStage;
            setNeedsOnboarding(stage !== 'complete' && stage !== 'document' && !hasPrd);
            
            // Extract PRD brief data
            if (data.prd) {
              setPrdData({
                tagline: data.prd.overview?.tagline || data.summary?.tagline,
                description: data.prd.overview?.description || data.summary?.description,
                features: data.prd.features?.core?.slice(0, 4).map((f: { name: string }) => f.name) || 
                          data.summary?.coreFeatures?.slice(0, 4),
              });
            } else if (data.summary) {
              setPrdData({
                tagline: data.summary.tagline,
                description: data.summary.description,
                features: data.summary.coreFeatures?.slice(0, 4),
              });
            }
          } catch {
            const stage = block.onboardingStage;
            setNeedsOnboarding(stage !== 'complete' && stage !== 'document');
          }
        } else if (block) {
          const stage = block.onboardingStage;
          setNeedsOnboarding(stage !== 'complete' && stage !== 'document');
        }
        
        setIsLoading(false);
      });
      fetchConnectors();
    }
  }, [id, user, fetchAppBlock, fetchConnectors]);

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

  const handleIconSave = (iconUrl: string) => {
    // Update the local state with the new icon URL
    if (appBlock) {
      setAppBlock({ ...appBlock, iconUrl });
    }
  };

  const handleOpenRegisterModal = () => {
    // Initialize form with current values
    setGitHubUrl(appBlock?.gitHubUrl || '');
    setAppUrl(appBlock?.appUrl || '');
    setUrlError(null);
    setShowRegisterModal(true);
  };

  const handleSaveUrls = async () => {
    if (!appBlock) return;
    
    // Validate both URLs are provided
    if (!gitHubUrl.trim() || !appUrl.trim()) {
      setUrlError('Both GitHub URL and App URL are required');
      return;
    }
    
    setIsSavingUrls(true);
    setUrlError(null);
    
    try {
      const response = await fetch(`/api/app-blocks/${appBlock.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gitHubUrl: gitHubUrl.trim(),
          appUrl: appUrl.trim(),
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        setUrlError(data.error || 'Failed to save URLs');
        return;
      }
      
      const data = await response.json();
      
      // Update local state
      setAppBlock({ ...appBlock, gitHubUrl: data.appBlock.gitHubUrl, appUrl: data.appBlock.appUrl });
      setShowRegisterModal(false);
    } catch (error) {
      console.error('Error saving URLs:', error);
      setUrlError('Something went wrong. Please try again.');
    } finally {
      setIsSavingUrls(false);
    }
  };

  const isRegistered = !!(appBlock?.gitHubUrl && appBlock?.appUrl);

  if (isUserLoading || isLoading) {
    return <Loading text="Loading..." />;
  }

  if (!user || !appBlock) {
    return (
      <Container>
        <Header>
          <BackLink href="/dashboard">← Back to Dashboard</BackLink>
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
        <BackLink href="/dashboard">← Back to Dashboard</BackLink>
        <TitleSection>
          <IconWrapper onClick={() => setShowIconEditModal(true)}>
            <BlockIcon $iconUrl={appBlock.iconUrl}>
              {!appBlock.iconUrl && appBlock.name.charAt(0).toUpperCase()}
            </BlockIcon>
            <IconEditButton>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </IconEditButton>
          </IconWrapper>
          <TitleInfo>
            <PageTitle>{appBlock.name}</PageTitle>
            <PageSubtitle>
              {prdData?.tagline || appBlock.description || 'No description provided'}
            </PageSubtitle>
          </TitleInfo>
        </TitleSection>
      </Header>

      <Main>
        {needsOnboarding && (
          <OnboardingBanner>
            <OnboardingTitle>Complete Your Block Setup</OnboardingTitle>
            <OnboardingText>
              Answer a few questions to generate your Product Requirements Document and bring your block to life.
            </OnboardingText>
            <OnboardingButton href={`/app-blocks/${appBlock.id}/questions`}>
              Continue Setup →
            </OnboardingButton>
          </OnboardingBanner>
        )}

        <Section>
          <SectionHeader>
            <SectionTitle>Product Details</SectionTitle>
          </SectionHeader>
          {prdData && (prdData.description || prdData.features?.length) ? (
            <PRDBriefCard href={`/app-blocks/${appBlock.id}/prd`}>
              <PRDBriefContent>
                {prdData.description && (
                  <PRDDescription>{prdData.description}</PRDDescription>
                )}
                {prdData.features && prdData.features.length > 0 && (
                  <PRDFeaturesList>
                    {prdData.features.map((feature, idx) => (
                      <PRDFeatureTag key={idx}>{feature}</PRDFeatureTag>
                    ))}
                  </PRDFeaturesList>
                )}
                <ViewFullPRD>View full documentation</ViewFullPRD>
              </PRDBriefContent>
            </PRDBriefCard>
          ) : (
            <EmptyPRDState>
              <EmptyPRDText>No requirements document yet</EmptyPRDText>
              <EmptyPRDSubtext>Complete the onboarding to generate your PRD</EmptyPRDSubtext>
            </EmptyPRDState>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>District Apps</SectionTitle>
          </SectionHeader>
          <DistrictAppsGrid>
            {DISTRICT_APPS.map((district) => (
              <DistrictAppCard key={district.id}>
                <DistrictIcon $imageUrl={district.imageUrl} />
                <DistrictInfo>
                  <DistrictName>{district.name}</DistrictName>
                  <DistrictDescription>{district.description}</DistrictDescription>
                </DistrictInfo>
              </DistrictAppCard>
            ))}
          </DistrictAppsGrid>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>App Registration</SectionTitle>
          </SectionHeader>
          <RegisterAppCard onClick={handleOpenRegisterModal} $isRegistered={isRegistered}>
            <RegisterAppIcon>
              {isRegistered ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </RegisterAppIcon>
            <RegisterAppContent>
              <RegisterAppTitle>
                {isRegistered ? 'App Registered' : 'Register This App'}
              </RegisterAppTitle>
              <RegisterAppDescription>
                {isRegistered 
                  ? 'GitHub and App URL linked'
                  : 'Add a GitHub URL and app link to register this block'
                }
              </RegisterAppDescription>
            </RegisterAppContent>
            <RegisterAppArrow>{isRegistered ? '✎' : '→'}</RegisterAppArrow>
          </RegisterAppCard>
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

      <IconEditModal
        isOpen={showIconEditModal}
        onClose={() => setShowIconEditModal(false)}
        onSave={handleIconSave}
        appBlockId={appBlock.id}
        currentIconUrl={appBlock.iconUrl}
      />

      {showRegisterModal && (
        <RegisterModal onClick={() => setShowRegisterModal(false)}>
          <RegisterModalCard onClick={e => e.stopPropagation()}>
            <RegisterModalTitle>Register {appBlock.name}</RegisterModalTitle>
            <RegisterModalSubtitle>
              Add links to your app&apos;s GitHub repository and live URL
            </RegisterModalSubtitle>
            
            {urlError && <RegisterModalError>{urlError}</RegisterModalError>}
            
            <RegisterInputGroup>
              <RegisterLabel htmlFor="gitHubUrl">
                GitHub URL <span>(required)</span>
              </RegisterLabel>
              <RegisterInput
                id="gitHubUrl"
                type="url"
                value={gitHubUrl}
                onChange={(e) => setGitHubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                $hasError={!!urlError && !gitHubUrl.trim()}
              />
            </RegisterInputGroup>
            
            <RegisterInputGroup>
              <RegisterLabel htmlFor="appUrl">
                App URL <span>(required)</span>
              </RegisterLabel>
              <RegisterInput
                id="appUrl"
                type="url"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://myapp.com"
                $hasError={!!urlError && !appUrl.trim()}
              />
            </RegisterInputGroup>
            
            <RegisterModalActions>
              <RegisterModalButton 
                type="button" 
                onClick={() => setShowRegisterModal(false)}
              >
                Cancel
              </RegisterModalButton>
              <RegisterModalButton 
                type="button"
                $primary 
                onClick={handleSaveUrls}
                disabled={isSavingUrls}
              >
                {isSavingUrls ? 'Saving...' : 'Save'}
              </RegisterModalButton>
            </RegisterModalActions>
          </RegisterModalCard>
        </RegisterModal>
      )}
    </Container>
  );
};

export default AppBlockDetailPage;
