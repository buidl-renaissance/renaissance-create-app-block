import React, { useState } from 'react';
import Head from 'next/head';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';

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
  display: flex;
`;

const Sidebar = styled.aside`
  width: 280px;
  background: ${({ theme }) => theme.surface};
  border-right: 1px solid ${({ theme }) => theme.border};
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  padding: 1.5rem 0;
  
  @media (max-width: 900px) {
    display: none;
  }
`;

const SidebarHeader = styled.div`
  padding: 0 1.5rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  margin-bottom: 1rem;
`;

const SidebarTitle = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem 0;
`;

const SidebarSubtitle = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
`;

const NavSection = styled.div`
  margin-bottom: 1.5rem;
`;

const NavSectionTitle = styled.h3`
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.textSecondary};
  padding: 0 1.5rem;
  margin: 0 0 0.5rem 0;
`;

const NavLink = styled.button<{ $active?: boolean }>`
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5rem 1.5rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ $active, theme }) => $active ? theme.accent : theme.text};
  background: ${({ $active, theme }) => $active ? `${theme.accent}10` : 'transparent'};
  border: none;
  border-left: 3px solid ${({ $active, theme }) => $active ? theme.accent : 'transparent'};
  cursor: pointer;
  transition: all 0.15s ease;
  
  &:hover {
    background: ${({ theme }) => theme.backgroundAlt};
    color: ${({ theme }) => theme.accent};
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  max-width: 900px;
  
  @media (max-width: 900px) {
    margin-left: 0;
    padding: 1.5rem;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`;

const PageTitle = styled.h1`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem 0;
  animation: ${fadeIn} 0.4s ease-out;
`;

const PageDescription = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 2rem 0;
  line-height: 1.6;
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

const Section = styled.section`
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.4s ease-out 0.2s both;
`;

const SectionTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${({ theme }) => theme.accent};
`;

const EndpointCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  margin-bottom: 1.5rem;
  overflow: hidden;
`;

const EndpointHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.background};
  }
`;

const MethodBadge = styled.span<{ $method: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ $method }) => {
    switch ($method) {
      case 'GET': return '#22c55e20';
      case 'POST': return '#3b82f620';
      case 'PUT': return '#f59e0b20';
      case 'PATCH': return '#8b5cf620';
      case 'DELETE': return '#ef444420';
      default: return '#6b728020';
    }
  }};
  color: ${({ $method }) => {
    switch ($method) {
      case 'GET': return '#22c55e';
      case 'POST': return '#3b82f6';
      case 'PUT': return '#f59e0b';
      case 'PATCH': return '#8b5cf6';
      case 'DELETE': return '#ef4444';
      default: return '#6b7280';
    }
  }};
`;

const EndpointPath = styled.code`
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text};
  flex: 1;
`;

const EndpointDescription = styled.span`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const AuthBadge = styled.span<{ $required?: boolean }>`
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 0.65rem;
  font-weight: 500;
  background: ${({ $required }) => $required ? '#f59e0b20' : '#22c55e20'};
  color: ${({ $required }) => $required ? '#f59e0b' : '#22c55e'};
`;

const EndpointBody = styled.div<{ $expanded?: boolean }>`
  display: ${({ $expanded }) => $expanded ? 'block' : 'none'};
  padding: 1.25rem;
`;

const SubSection = styled.div`
  margin-bottom: 1.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SubSectionTitle = styled.h4`
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 0.5rem 0;
`;

const CodeBlock = styled.pre`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 1rem;
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text};
  overflow-x: auto;
  line-height: 1.5;
  margin: 0;
`;

const ParamTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
`;

const ParamRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ParamCell = styled.td`
  padding: 0.5rem 0.75rem;
  vertical-align: top;
  
  &:first-child {
    padding-left: 0;
    font-family: 'SF Mono', 'Monaco', monospace;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.accent};
    white-space: nowrap;
  }
`;

const ParamType = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.75rem;
`;

const RequiredBadge = styled.span`
  background: #ef444420;
  color: #ef4444;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 500;
  margin-left: 0.5rem;
`;

const ErrorList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ErrorItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const ErrorCode = styled.code`
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.75rem;
  padding: 0.15rem 0.4rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-radius: 4px;
  color: ${({ theme }) => theme.text};
`;

// API Documentation Data
interface Endpoint {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  requestBody?: string;
  responseBody?: string;
  queryParams?: { name: string; type: string; description: string; required?: boolean }[];
  errors?: { code: string; description: string }[];
}

interface ApiSection {
  id: string;
  title: string;
  description?: string;
  endpoints: Endpoint[];
}

const API_DOCS: ApiSection[] = [
  {
    id: 'auth',
    title: 'Authentication',
    description: 'Endpoints for user registration, login, and session management.',
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new user account',
        auth: false,
        requestBody: `{
  "username": "string (required)",
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string (optional)",
  "pendingUserData": {
    "renaissanceId": "string",
    "accountAddress": "string"
  }
}`,
        responseBody: `{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "string",
    "displayName": "string",
    "email": "string",
    "role": "user"
  }
}`,
        errors: [
          { code: '400', description: 'Validation error' },
          { code: '409', description: 'Email or username already exists' },
        ],
      },
      {
        method: 'POST',
        path: '/api/auth/phone-login',
        description: 'Login with phone number and PIN',
        auth: false,
        requestBody: `{
  "phone": "string (required)",
  "pin": "string (required for step 2)"
}`,
        responseBody: `{
  "success": true,
  "user": { ... }
}`,
        errors: [
          { code: '401', description: 'Invalid PIN' },
          { code: '404', description: 'No account found' },
          { code: '423', description: 'Account locked' },
        ],
      },
      {
        method: 'POST',
        path: '/api/auth/send-code',
        description: 'Send verification code to email',
        auth: false,
        requestBody: `{
  "email": "string (required)"
}`,
        responseBody: `{
  "success": true,
  "message": "Verification code sent"
}`,
        errors: [
          { code: '404', description: 'No account found with this email' },
        ],
      },
      {
        method: 'POST',
        path: '/api/auth/verify-code',
        description: 'Verify email code and login',
        auth: false,
        requestBody: `{
  "email": "string (required)",
  "code": "string (required)"
}`,
        responseBody: `{
  "success": true,
  "user": { ... }
}`,
      },
      {
        method: 'POST',
        path: '/api/auth/logout',
        description: 'Log out the current user',
        auth: false,
        responseBody: `{
  "success": true
}`,
      },
    ],
  },
  {
    id: 'user',
    title: 'User',
    description: 'User profile management.',
    endpoints: [
      {
        method: 'GET',
        path: '/api/user/me',
        description: 'Get current user profile',
        auth: false,
        queryParams: [
          { name: 'renaissanceUserId', type: 'string', description: 'Look up by Renaissance ID' },
          { name: 'userId', type: 'string', description: 'Look up by user ID' },
        ],
        responseBody: `{
  "user": {
    "id": "uuid",
    "username": "string",
    "displayName": "string",
    "email": "string",
    "phone": "string | null",
    "role": "user | organizer | admin"
  }
}`,
      },
      {
        method: 'PATCH',
        path: '/api/user/update',
        description: 'Update user profile',
        auth: true,
        requestBody: `{
  "displayName": "string (optional)",
  "profilePicture": "string (optional)"
}`,
      },
    ],
  },
  {
    id: 'app-blocks',
    title: 'App Blocks',
    description: 'Create and manage app blocks.',
    endpoints: [
      {
        method: 'GET',
        path: '/api/app-blocks',
        description: 'List all app blocks owned by user',
        auth: true,
        responseBody: `{
  "appBlocks": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "status": "draft | active | archived",
      "iconUrl": "string | null"
    }
  ]
}`,
      },
      {
        method: 'POST',
        path: '/api/app-blocks',
        description: 'Create a new app block',
        auth: true,
        requestBody: `{
  "name": "string (required)",
  "description": "string (optional)",
  "iconUrl": "string (optional)"
}`,
        responseBody: `{
  "appBlock": { ... }
}`,
      },
      {
        method: 'GET',
        path: '/api/app-blocks/{id}',
        description: 'Get app block details',
        auth: true,
        responseBody: `{
  "appBlock": {
    "id": "uuid",
    "name": "string",
    "installations": [ ... ],
    "hasServiceAccount": true
  }
}`,
      },
      {
        method: 'PUT',
        path: '/api/app-blocks/{id}',
        description: 'Update app block',
        auth: true,
        requestBody: `{
  "name": "string",
  "description": "string",
  "iconUrl": "string",
  "githubRepoOwner": "string",
  "githubRepoName": "string"
}`,
      },
      {
        method: 'DELETE',
        path: '/api/app-blocks/{id}',
        description: 'Delete an app block',
        auth: true,
      },
      {
        method: 'POST',
        path: '/api/app-blocks/{id}/dispatch',
        description: 'Trigger Ren.AI code changes',
        auth: true,
        requestBody: `{
  "intent": "branding | features | config | full_build | custom",
  "prompt": "string (optional)",
  "customIntent": "string (if intent is custom)",
  "autoCommit": true
}`,
        responseBody: `{
  "success": true,
  "operationId": "uuid",
  "sessionId": "string"
}`,
      },
    ],
  },
  {
    id: 'block-submissions',
    title: 'Block Submissions',
    description: 'Public endpoint for submitting projects to become app blocks.',
    endpoints: [
      {
        method: 'POST',
        path: '/api/block-submissions',
        description: 'Submit a project (public)',
        auth: false,
        requestBody: `{
  "blockName": "string (required)",
  "submitterName": "string (required)",
  "email": "string (required)",
  "projectDescription": "string (required)",
  "projectUrl": "string (required)",
  "iconUrl": "string (optional, 512x512)"
}`,
        responseBody: `{
  "success": true,
  "submission": {
    "id": "uuid",
    "blockName": "string",
    "status": "pending"
  }
}`,
        errors: [
          { code: '400', description: 'Validation error' },
          { code: '409', description: 'Duplicate submission' },
        ],
      },
      {
        method: 'GET',
        path: '/api/block-submissions',
        description: 'List all submissions (admin)',
        auth: false,
        responseBody: `{
  "submissions": [ ... ]
}`,
      },
    ],
  },
  {
    id: 'connectors',
    title: 'Connectors',
    description: 'Available integrations for app blocks.',
    endpoints: [
      {
        method: 'GET',
        path: '/api/connectors',
        description: 'List all connectors with scopes',
        auth: false,
        responseBody: `{
  "connectors": [
    {
      "id": "uuid",
      "name": "string",
      "scopes": [ ... ],
      "recipes": [ ... ]
    }
  ]
}`,
      },
      {
        method: 'GET',
        path: '/api/connectors/{id}',
        description: 'Get connector details',
        auth: false,
      },
    ],
  },
  {
    id: 'registry',
    title: 'Registry',
    description: 'Browse the public app block registry.',
    endpoints: [
      {
        method: 'GET',
        path: '/api/registry/app-blocks',
        description: 'Browse registry with filters',
        auth: false,
        queryParams: [
          { name: 'category', type: 'string', description: 'events, tools, music, games, community, other' },
          { name: 'query', type: 'string', description: 'Search term' },
          { name: 'tags', type: 'string', description: 'Comma-separated tags' },
          { name: 'visibility', type: 'string', description: 'public (default), unlisted' },
          { name: 'page', type: 'number', description: 'Page number (default: 1)' },
          { name: 'limit', type: 'number', description: 'Items per page (default: 20, max: 100)' },
        ],
        responseBody: `{
  "entries": [ ... ],
  "total": 100,
  "page": 1,
  "limit": 20
}`,
      },
      {
        method: 'GET',
        path: '/api/registry/app-blocks/{slug}',
        description: 'Get registry entry by slug',
        auth: false,
      },
    ],
  },
];

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('auth');
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());

  const toggleEndpoint = (key: string) => {
    setExpandedEndpoints(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Container>
      <Head>
        <title>API Documentation | Renaissance City</title>
        <meta name="description" content="Renaissance City API documentation" />
      </Head>

      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>API Docs</SidebarTitle>
          <SidebarSubtitle>Renaissance City</SidebarSubtitle>
        </SidebarHeader>
        
        {API_DOCS.map(section => (
          <NavSection key={section.id}>
            <NavLink
              $active={activeSection === section.id}
              onClick={() => scrollToSection(section.id)}
            >
              {section.title}
            </NavLink>
          </NavSection>
        ))}
      </Sidebar>

      <MainContent>
        <BackLink href="/dashboard">← Back to Dashboard</BackLink>
        
        <PageTitle>API Documentation</PageTitle>
        <PageDescription>
          Complete reference for the Renaissance City API. Base URL: <code>/api</code>
        </PageDescription>

        {API_DOCS.map(section => (
          <Section key={section.id} id={section.id}>
            <SectionTitle>{section.title}</SectionTitle>
            {section.description && (
              <PageDescription style={{ marginBottom: '1.5rem' }}>
                {section.description}
              </PageDescription>
            )}

            {section.endpoints.map((endpoint, idx) => {
              const key = `${section.id}-${idx}`;
              const isExpanded = expandedEndpoints.has(key);

              return (
                <EndpointCard key={key}>
                  <EndpointHeader onClick={() => toggleEndpoint(key)}>
                    <MethodBadge $method={endpoint.method}>{endpoint.method}</MethodBadge>
                    <EndpointPath>{endpoint.path}</EndpointPath>
                    <EndpointDescription>{endpoint.description}</EndpointDescription>
                    {endpoint.auth && <AuthBadge $required>Auth</AuthBadge>}
                  </EndpointHeader>

                  <EndpointBody $expanded={isExpanded}>
                    {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                      <SubSection>
                        <SubSectionTitle>Query Parameters</SubSectionTitle>
                        <ParamTable>
                          <tbody>
                            {endpoint.queryParams.map(param => (
                              <ParamRow key={param.name}>
                                <ParamCell>
                                  {param.name}
                                  {param.required && <RequiredBadge>required</RequiredBadge>}
                                </ParamCell>
                                <ParamCell>
                                  <ParamType>{param.type}</ParamType>
                                  <br />
                                  {param.description}
                                </ParamCell>
                              </ParamRow>
                            ))}
                          </tbody>
                        </ParamTable>
                      </SubSection>
                    )}

                    {endpoint.requestBody && (
                      <SubSection>
                        <SubSectionTitle>Request Body</SubSectionTitle>
                        <CodeBlock>{endpoint.requestBody}</CodeBlock>
                      </SubSection>
                    )}

                    {endpoint.responseBody && (
                      <SubSection>
                        <SubSectionTitle>Response</SubSectionTitle>
                        <CodeBlock>{endpoint.responseBody}</CodeBlock>
                      </SubSection>
                    )}

                    {endpoint.errors && endpoint.errors.length > 0 && (
                      <SubSection>
                        <SubSectionTitle>Error Codes</SubSectionTitle>
                        <ErrorList>
                          {endpoint.errors.map(error => (
                            <ErrorItem key={error.code}>
                              <ErrorCode>{error.code}</ErrorCode>
                              {error.description}
                            </ErrorItem>
                          ))}
                        </ErrorList>
                      </SubSection>
                    )}
                  </EndpointBody>
                </EndpointCard>
              );
            })}
          </Section>
        ))}
      </MainContent>
    </Container>
  );
};

export default DocsPage;
