import React, { useEffect } from "react";
import Head from "next/head";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { Loading } from "@/components/Loading";
import Templates from "@/components/Templates";

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
  background: ${({ theme }) => theme.background};
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  width: 100%;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 2px 8px ${({ theme }) => theme.shadow};
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`;

const BrandName = styled.span`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  letter-spacing: 0.05em;
`;

const HeroSection = styled.section`
  padding: 3rem 1.5rem 2rem;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;
  
  @media (min-width: 768px) {
    padding: 4rem 2rem 2.5rem;
  }
`;

const Title = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.75rem 0;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 auto;
  max-width: 600px;
  line-height: 1.6;
  
  @media (min-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Divider = styled.div`
  width: 80px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    ${({ theme }) => theme.accentGold},
    transparent
  );
  margin: 1.5rem auto 0;
`;

const ContentSection = styled.section`
  flex: 1;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
`;

const FooterNote = styled.div`
  padding: 2rem 1.5rem;
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out 0.4s both;
`;

const FooterText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  font-style: italic;
`;

const GetStartedPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [isUserLoading, user, router]);


  if (isUserLoading) {
    return <Loading text="Loading..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <Container>
      <Head>
        <title>Get Started | {APP_NAME}</title>
        <meta name="description" content={`Start building with ${APP_NAME}`} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Main>
        <Header>
          <BackLink href="/dashboard">
            ← Back to Dashboard
          </BackLink>
          <BrandName>Renaissance City</BrandName>
        </Header>

        <HeroSection>
          <Title>Let&apos;s Build Something</Title>
          <Subtitle>
            Every great project starts with a clear vision. Choose a path below 
            and we&apos;ll help you think through the key questions.
          </Subtitle>
          <Divider />
        </HeroSection>

        <ContentSection>
          <Templates />
        </ContentSection>

        <FooterNote>
          <FooterText>
            Don&apos;t worry about having all the answers — this is just a starting point to 
            help shape your thinking.
          </FooterText>
        </FooterNote>
      </Main>
    </Container>
  );
};

export default GetStartedPage;
