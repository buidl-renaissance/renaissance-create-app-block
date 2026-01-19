import React, { useState } from 'react';
import styled from 'styled-components';

interface SignInFormProps {
  onSubmit: () => void;
  onNeedsRegister?: () => void;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.875rem 1rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme, $hasError }) => $hasError ? theme.accent : theme.border};
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    opacity: 0.6;
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => $hasError ? theme.accent : theme.accentGold};
    box-shadow: 0 0 0 3px ${({ theme, $hasError }) => 
      $hasError ? `${theme.accent}20` : `${theme.accentGold}20`};
  }
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
  background: ${({ theme }) => `${theme.accent}10`};
  border: 1px solid ${({ theme }) => `${theme.accent}30`};
  border-radius: 8px;
  color: ${({ theme }) => theme.accent};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  padding: 0.75rem 1rem;
  background: ${({ theme }) => `${theme.accentGold}10`};
  border: 1px solid ${({ theme }) => `${theme.accentGold}30`};
  border-radius: 8px;
  color: ${({ theme }) => theme.accentGold};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  text-align: center;
`;

const HelpText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  text-align: center;
  margin-top: 0.5rem;
`;

const ResendLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.accent};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SignInForm: React.FC<SignInFormProps> = ({ onSubmit, onNeedsRegister }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      // Send verification code to email
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      
      const data = await response.json();
      
      if (response.status === 404) {
        // User not found - redirect to register
        setError('No account found. Please create an account first.');
        if (onNeedsRegister) {
          onNeedsRegister();
        }
        return;
      }
      
      if (!response.ok) {
        setError(data.error || 'Failed to send verification code');
        return;
      }
      
      // Success - move to code verification step
      setMessage(data.message || 'Verification code sent to your email');
      setStep('code');
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Invalid verification code');
        return;
      }
      
      // Success - logged in
      onSubmit();
    } catch (error) {
      console.error('Code verification error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to resend code');
        return;
      }
      
      setMessage(data.message || 'New verification code sent');
    } catch (error) {
      console.error('Resend error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'code') {
    return (
      <Form onSubmit={handleCodeSubmit}>
        {error && <GeneralError>{error}</GeneralError>}
        {message && <SuccessMessage>{message}</SuccessMessage>}
        
        <InputGroup>
          <Label htmlFor="signin-code">Verification Code</Label>
          <Input
            id="signin-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              setError(null);
            }}
            placeholder="123456"
            $hasError={!!error}
            autoComplete="one-time-code"
            autoFocus
          />
        </InputGroup>
        
        <SubmitButton type="submit" disabled={isLoading} $loading={isLoading}>
          {isLoading ? 'Verifying...' : 'Sign In'}
        </SubmitButton>
        
        <HelpText>
          Check your email for a 6-digit code.{' '}
          <ResendLink type="button" onClick={handleResendCode} disabled={isLoading}>
            Resend code
          </ResendLink>
        </HelpText>
      </Form>
    );
  }

  return (
    <Form onSubmit={handleEmailSubmit}>
      {error && <GeneralError>{error}</GeneralError>}
      
      <InputGroup>
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          placeholder="you@example.com"
          $hasError={!!error}
          autoComplete="email"
          autoFocus
        />
      </InputGroup>
      
      <SubmitButton type="submit" disabled={isLoading} $loading={isLoading}>
        {isLoading ? 'Sending Code...' : 'Continue'}
      </SubmitButton>
      
      <HelpText>
        We&apos;ll send a verification code to your email
      </HelpText>
    </Form>
  );
};

export default SignInForm;
