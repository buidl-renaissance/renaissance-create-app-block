import React, { useEffect } from 'react';
import Head from 'next/head';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useAppBlock } from '@/contexts/AppBlockContext';
import { Loading } from '@/components/Loading';
import { AppBlockList } from '@/components/app-blocks';

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

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
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
  max-width: 600px;
`;

const CreateButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
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

const Main = styled.main`
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  min-width: 120px;
`;

const StatValue = styled.div`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
`;

const StatLabel = styled.div`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const AppBlocksPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const { appBlocks, isLoading: isBlocksLoading, fetchAppBlocks } = useAppBlock();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchAppBlocks();
    }
  }, [user, fetchAppBlocks]);

  if (isUserLoading || isBlocksLoading) {
    return <Loading text="Loading..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <Container>
      <Head>
        <title>App Blocks | Renaissance City</title>
        <meta name="description" content="Manage your Renaissance City App Blocks" />
      </Head>

      <Header>
        <BackLink href="/dashboard">← Back to Dashboard</BackLink>
        <TitleRow>
          <div>
            <PageTitle>Your App Blocks</PageTitle>
            <PageSubtitle>
              Build and manage self-contained applications that connect to Renaissance City districts
            </PageSubtitle>
          </div>
          {appBlocks.length > 0 && (
            <CreateButton href="/app-blocks/new">
              + New Block
            </CreateButton>
          )}
        </TitleRow>
      </Header>

      <Main>
        {appBlocks.length > 0 && (
          <StatsRow>
            <StatCard>
              <StatValue>{appBlocks.length}</StatValue>
              <StatLabel>App Blocks</StatLabel>
            </StatCard>
          </StatsRow>
        )}
        
        <AppBlockList appBlocks={appBlocks} />
      </Main>
    </Container>
  );
};

export default AppBlocksPage;
