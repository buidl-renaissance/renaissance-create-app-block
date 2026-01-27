import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useAppBlock, AppBlockWithInstallations } from '@/contexts/AppBlockContext';
import { Loading } from '@/components/Loading';

interface ProductRequirementsDocument {
  title: string;
  version: string;
  createdAt: string;
  overview: {
    name: string;
    tagline: string;
    description: string;
    problemStatement: string;
  };
  targetAudience: {
    primary: string;
    demographics: string[];
    painPoints: string[];
  };
  features: {
    core: { name: string; description: string; priority: 'must-have' | 'should-have' | 'nice-to-have' }[];
    future: string[];
  };
  technicalRequirements: string[];
  successMetrics: string[];
  timeline: { phase: string; description: string }[];
  risks: string[];
}

interface BlockSummary {
  name: string;
  tagline: string;
  description: string;
  targetAudience: string;
  coreFeatures: string[];
  nextSteps: string[];
}

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

const Main = styled.main`
  max-width: 800px;
  margin: 0 auto;
`;

// PRD Card Styles
const PRDCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  overflow: hidden;
  animation: ${fadeIn} 0.4s ease-out;
`;

const PageTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 1rem 0;
`;

const PageIcon = styled.span`
  font-size: 1.25rem;
`;

const PRDHeader = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.accent}15 0%, ${({ theme }) => theme.accentGold}15 100%);
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const PRDTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const PRDTagline = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.accent};
  font-style: italic;
  margin: 0.25rem 0 0 0;
`;

const PRDMeta = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const PRDBody = styled.div`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const SectionContent = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  line-height: 1.6;
  margin: 0;
`;

const FeatureRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.border}50;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FeatureName = styled.div`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const FeatureDesc = styled.div`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.125rem;
`;

const PriorityBadge = styled.span<{ $priority: string }>`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;
  border-radius: 100px;
  flex-shrink: 0;
  margin-left: 0.5rem;
  
  ${({ $priority, theme }) => {
    switch ($priority) {
      case 'must-have':
        return `background: ${theme.accent}20; color: ${theme.accent};`;
      case 'should-have':
        return `background: ${theme.accentGold}20; color: ${theme.accentGold};`;
      default:
        return `background: ${theme.border}; color: ${theme.textSecondary};`;
    }
  }}
`;

const FeatureList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  line-height: 1.4;
  
  &::before {
    content: '✦';
    color: ${({ theme }) => theme.accent};
    flex-shrink: 0;
    font-size: 0.75rem;
  }
`;

const KeyPoints = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
`;

const KeyPoint = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;
  background: ${({ theme }) => theme.accent}15;
  color: ${({ theme }) => theme.accent};
  border-radius: 100px;
`;


const TimelineContainer = styled.div`
  position: relative;
  margin-left: 6px;
  padding-left: 1.25rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 1rem;
    bottom: 1rem;
    width: 2px;
    background: linear-gradient(
      to bottom,
      ${({ theme }) => theme.accent},
      ${({ theme }) => theme.accentGold}
    );
    border-radius: 1px;
    transform: translateX(-50%);
  }
`;

const TimelineItem = styled.div`
  position: relative;
  padding: 0.5rem 0;
  
  &::before {
    content: '';
    position: absolute;
    left: -1.25rem;
    top: 0.625rem;
    width: 10px;
    height: 10px;
    background: ${({ theme }) => theme.surface};
    border: 2px solid ${({ theme }) => theme.accent};
    border-radius: 50%;
    transform: translateX(-50%);
  }
  
  &:first-child::before {
    background: ${({ theme }) => theme.accent};
  }
`;

const TimelinePhase = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const TimelineDesc = styled.div`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  line-height: 1.5;
`;

const RiskItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  
  &::before {
    content: '⚠️';
    font-size: 0.75rem;
    flex-shrink: 0;
  }
`;


const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem 0;
`;

const EmptyText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
`;

const PRDPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: isUserLoading } = useUser();
  const { fetchAppBlock } = useAppBlock();
  
  const [appBlock, setAppBlock] = useState<AppBlockWithInstallations | null>(null);
  const [prd, setPrd] = useState<ProductRequirementsDocument | null>(null);
  const [summary, setSummary] = useState<BlockSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        
        // Parse onboarding data to get PRD
        if (block?.onboardingData) {
          try {
            const data = JSON.parse(block.onboardingData);
            if (data.prd) setPrd(data.prd);
            if (data.summary) setSummary(data.summary);
          } catch (e) {
            console.error('Failed to parse onboarding data:', e);
          }
        }
        
        setIsLoading(false);
      });
    }
  }, [id, user, fetchAppBlock]);

  if (isUserLoading || isLoading) {
    return <Loading text="Loading..." />;
  }

  if (!user || !appBlock) {
    return (
      <Container>
        <Header>
          <BackLink href="/dashboard">← Back to Dashboard</BackLink>
          <PRDTitle>App Block Not Found</PRDTitle>
        </Header>
      </Container>
    );
  }

  // If no PRD, show empty state with summary if available
  if (!prd) {
    return (
      <Container>
        <Head>
          <title>PRD - {appBlock.name} | Renaissance City</title>
        </Head>

        <Header>
          <BackLink href={`/app-blocks/${appBlock.id}`}>← Back to {appBlock.name}</BackLink>
        </Header>

        <Main>
          {summary ? (
            // Show summary as a basic PRD
            <>
              <PageTitle>
                <PageIcon>📋</PageIcon>
                Product Requirements
              </PageTitle>
              <PRDCard>
              <PRDHeader>
                <PRDTitle>{summary.name}</PRDTitle>
                {summary.tagline && (
                  <PRDTagline>{summary.tagline}</PRDTagline>
                )}
              </PRDHeader>
              <PRDBody>
                <Section>
                  <SectionTitle>Overview</SectionTitle>
                  <SectionContent>{summary.description}</SectionContent>
                </Section>

                <Section>
                  <SectionTitle>Target Audience</SectionTitle>
                  <SectionContent>{summary.targetAudience}</SectionContent>
                </Section>

                <Section>
                  <SectionTitle>Core Features</SectionTitle>
                  <FeatureList>
                    {summary.coreFeatures.map((feature, idx) => (
                      <FeatureItem key={idx}>{feature}</FeatureItem>
                    ))}
                  </FeatureList>
                </Section>

                <Section>
                  <SectionTitle>Next Steps</SectionTitle>
                  <FeatureList>
                    {summary.nextSteps.map((step, idx) => (
                      <FeatureItem key={idx}>{step}</FeatureItem>
                    ))}
                  </FeatureList>
                </Section>
              </PRDBody>
            </PRDCard>
            </>
          ) : (
            <EmptyState>
              <EmptyIcon>📋</EmptyIcon>
              <EmptyTitle>No PRD Available</EmptyTitle>
              <EmptyText>
                Complete the onboarding process to generate a Product Requirements Document for this block.
              </EmptyText>
            </EmptyState>
          )}
        </Main>
      </Container>
    );
  }

  return (
    <Container>
      <Head>
        <title>PRD - {appBlock.name} | Renaissance City</title>
        <meta name="description" content={`Product Requirements Document for ${appBlock.name}`} />
      </Head>

      <Header>
        <BackLink href={`/app-blocks/${appBlock.id}`}>← Back to {appBlock.name}</BackLink>
      </Header>

      <Main>
        <PageTitle>
          <PageIcon>📋</PageIcon>
          Product Requirements
        </PageTitle>
        <PRDCard>
          <PRDHeader>
            <PRDTitle>{prd.title}</PRDTitle>
            {prd.overview?.tagline && (
              <PRDTagline>{prd.overview.tagline}</PRDTagline>
            )}
            <PRDMeta>Version {prd.version} • {prd.createdAt}</PRDMeta>
          </PRDHeader>

          <PRDBody>
            <Section>
              <SectionTitle>Overview</SectionTitle>
              <SectionContent style={{ marginBottom: '0.5rem' }}>
                <strong>Problem:</strong> {prd.overview?.problemStatement}
              </SectionContent>
              <SectionContent>{prd.overview?.description}</SectionContent>
            </Section>

            <Section>
              <SectionTitle>Target Audience</SectionTitle>
              <SectionContent style={{ marginBottom: '0.5rem' }}>
                <strong>Primary:</strong> {prd.targetAudience?.primary}
              </SectionContent>
              <KeyPoints style={{ marginBottom: '0.5rem' }}>
                {Array.isArray(prd.targetAudience?.demographics) && prd.targetAudience.demographics.map((d, i) => (
                  <KeyPoint key={i}>{d}</KeyPoint>
                ))}
              </KeyPoints>
              <SectionContent style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Pain Points:</strong> {Array.isArray(prd.targetAudience?.painPoints) ? prd.targetAudience.painPoints.join(' • ') : ''}
              </SectionContent>
            </Section>

            <Section>
              <SectionTitle>Features</SectionTitle>
              {Array.isArray(prd.features?.core) && prd.features.core.map((feature, idx) => (
                <FeatureRow key={idx}>
                  <div>
                    <FeatureName>{feature.name}</FeatureName>
                    <FeatureDesc>{feature.description}</FeatureDesc>
                  </div>
                  <PriorityBadge $priority={feature.priority}>
                    {feature.priority?.replace(/-/g, ' ')}
                  </PriorityBadge>
                </FeatureRow>
              ))}
              {Array.isArray(prd.features?.future) && prd.features.future.length > 0 && (
                <SectionContent style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                  <strong>Future:</strong> {prd.features.future.join(' • ')}
                </SectionContent>
              )}
            </Section>

            <Section>
              <SectionTitle>Technical Requirements</SectionTitle>
              <FeatureList>
                {Array.isArray(prd.technicalRequirements) && prd.technicalRequirements.map((req, idx) => (
                  <FeatureItem key={idx}>{req}</FeatureItem>
                ))}
              </FeatureList>
            </Section>

            <Section>
              <SectionTitle>Success Metrics</SectionTitle>
              <FeatureList>
                {Array.isArray(prd.successMetrics) && prd.successMetrics.map((metric, idx) => (
                  <FeatureItem key={idx}>{metric}</FeatureItem>
                ))}
              </FeatureList>
            </Section>

            <Section>
              <SectionTitle>Timeline</SectionTitle>
              <TimelineContainer>
                {Array.isArray(prd.timeline) && prd.timeline.map((item, idx) => (
                  <TimelineItem key={idx}>
                    <TimelinePhase>{item.phase}</TimelinePhase>
                    <TimelineDesc>{item.description}</TimelineDesc>
                  </TimelineItem>
                ))}
              </TimelineContainer>
            </Section>

            <Section>
              <SectionTitle>Risks & Challenges</SectionTitle>
              {Array.isArray(prd.risks) && prd.risks.map((risk, idx) => (
                <RiskItem key={idx}>{risk}</RiskItem>
              ))}
            </Section>
          </PRDBody>
        </PRDCard>
      </Main>
    </Container>
  );
};

export default PRDPage;
