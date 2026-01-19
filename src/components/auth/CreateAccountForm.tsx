import React, { useState } from 'react';
import styled from 'styled-components';

interface CreateAccountFormProps {
  onSubmit: () => void;
}

interface FormErrors {
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  general?: string;
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
  
  span {
    color: ${({ theme }) => theme.textSecondary};
    font-weight: 400;
    font-size: 0.85rem;
  }
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

const ErrorText = styled.span`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.accent};
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

// Phone number formatting
const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

const unformatPhoneNumber = (value: string): string => {
  return value.replace(/\D/g, '');
};

const CreateAccountForm: React.FC<CreateAccountFormProps> = ({ onSubmit }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Username validation
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation (required)
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (optional but must be valid if provided)
    const phoneDigits = unformatPhoneNumber(phone);
    if (phoneDigits && phoneDigits.length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const phoneDigits = unformatPhoneNumber(phone);
      
      // Call API to register account
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          name: name.trim(),
          email: email.trim(),
          phone: phoneDigits || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.error || 'Failed to create account' });
        }
        return;
      }
      
      // Success - account created and logged in
      onSubmit();
    } catch (error) {
      console.error('Create account error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {errors.general && <GeneralError>{errors.general}</GeneralError>}
      
      <InputGroup>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder="yourname"
          $hasError={!!errors.username}
          autoComplete="username"
          autoCapitalize="none"
        />
        {errors.username && <ErrorText>{errors.username}</ErrorText>}
      </InputGroup>
      
      <InputGroup>
        <Label htmlFor="name">Display Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          $hasError={!!errors.name}
          autoComplete="name"
        />
        {errors.name && <ErrorText>{errors.name}</ErrorText>}
      </InputGroup>
      
      <InputGroup>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          $hasError={!!errors.email}
          autoComplete="email"
        />
        {errors.email && <ErrorText>{errors.email}</ErrorText>}
      </InputGroup>
      
      <InputGroup>
        <Label htmlFor="phone">
          Phone Number <span>(optional)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="(555) 123-4567"
          $hasError={!!errors.phone}
          autoComplete="tel"
        />
        {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
      </InputGroup>
      
      <SubmitButton type="submit" disabled={isLoading} $loading={isLoading}>
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </SubmitButton>
    </Form>
  );
};

export default CreateAccountForm;
