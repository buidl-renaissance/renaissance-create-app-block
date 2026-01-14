import React from 'react';
import styled, { keyframes } from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';
import { RegistryBrowser } from '@/components/app-blocks';

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
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  margin-bottom: 2rem;
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
  margin-bottom: 1rem;
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

const Title = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
  
  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0.5rem 0 0 0;
  max-width: 600px;
  line-height: 1.6;
`;

const CreateButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 150%);
  border-radius: 10px;
  color: white;
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px ${({ theme }) => theme.accent}30;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${({ theme }) => theme.accent}40;
  }
`;

const BrowserSection = styled.section`
  animation: ${fadeIn} 0.5s ease-out 0.1s both;
`;

export default function ExplorePage() {
  return (
    <>
      <Head>
        <title>Explore App Blocks | Renaissance City</title>
        <meta name="description" content="Browse and discover App Blocks in the Renaissance City registry" />
      </Head>
      
      <Container>
        <Main>
          <Header>
            <BackLink href="/dashboard">
              ← Back to Dashboard
            </BackLink>
            
            <TitleRow>
              <div>
                <Title>Explore App Blocks</Title>
                <Subtitle>
                  Discover blocks built by the community. Find tools, connect services, 
                  and extend your own creations with the power of the Renaissance City ecosystem.
                </Subtitle>
              </div>
              
              <CreateButton href="/app-blocks/new">
                + Create Your Block
              </CreateButton>
            </TitleRow>
          </Header>
          
          <BrowserSection>
            <RegistryBrowser pageSize={12} />
          </BrowserSection>
        </Main>
      </Container>
    </>
  );
}
