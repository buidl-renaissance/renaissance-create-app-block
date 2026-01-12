import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import styled, { keyframes } from "styled-components";
import { useRouter } from "next/router";
import { useUser } from "@/contexts/UserContext";
import { Loading } from "@/components/Loading";

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

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px ${({ theme }) => theme.glow || 'rgba(167, 139, 250, 0.4)'};
  }
  50% {
    box-shadow: 0 0 30px ${({ theme }) => theme.glowSecondary || 'rgba(232, 121, 249, 0.4)'};
  }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background};
`;

const Header = styled.header`
  width: 100%;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary};
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.accent};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Title = styled.h1`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
  letter-spacing: -0.02em;
`;

const Spacer = styled.div`
  width: 60px;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 400px;
  background: ${({ theme }) => theme.surface};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: 
    0 4px 24px ${({ theme }) => theme.shadow},
    0 0 0 1px ${({ theme }) => theme.border};
  overflow: hidden;
`;

const ProfileSection = styled.div`
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 0 2px ${({ theme }) => theme.accent},
    0 0 20px ${({ theme }) => theme.glow || 'rgba(167, 139, 250, 0.3)'};
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 
      0 0 0 2px ${({ theme }) => theme.accentGold},
      0 0 30px ${({ theme }) => theme.glowSecondary || 'rgba(232, 121, 249, 0.4)'};
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultAvatar = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.accent} 0%,
    ${({ theme }) => theme.accentGold} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const EditOverlay = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.accent};
  border: 2px solid ${({ theme }) => theme.surface};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 12px ${({ theme }) => theme.glow || 'rgba(167, 139, 250, 0.5)'};

  &:hover {
    background: ${({ theme }) => theme.accentGold};
    transform: scale(1.1);
    box-shadow: 0 0 16px ${({ theme }) => theme.glowSecondary || 'rgba(232, 121, 249, 0.6)'};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ProfileInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const NameInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 
      0 0 0 3px ${({ theme }) => theme.glow || 'rgba(167, 139, 250, 0.2)'},
      0 0 20px ${({ theme }) => theme.glow || 'rgba(167, 139, 250, 0.15)'};
  }

  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    opacity: 0.5;
  }
`;

const RemoveButton = styled.button`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;
  transition: all 0.2s ease;

  &:hover {
    color: #f87171;
    opacity: 1;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const ButtonContainer = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  background: ${({ theme }) => theme.backgroundAlt};
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.625rem 1.25rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ $primary, theme }) =>
    $primary
      ? `
        background: linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentGold} 100%);
        color: white;
        border: none;
        box-shadow: 0 0 16px ${theme.glow || 'rgba(167, 139, 250, 0.3)'};

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 0 24px ${theme.glowSecondary || 'rgba(232, 121, 249, 0.5)'};
        }
      `
      : `
        background: transparent;
        color: ${theme.textSecondary};
        border: 1px solid ${theme.border};

        &:hover:not(:disabled) {
          border-color: ${theme.accent};
          color: ${theme.accent};
        }
      `}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: 0.75rem 1rem;
  margin: 1rem 1.5rem 0;
  border-radius: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  animation: ${fadeIn} 0.3s ease-out;

  ${({ $type, theme }) =>
    $type === 'success'
      ? `
        background: ${theme.accent}15;
        color: ${theme.accent};
        border: 1px solid ${theme.accent}30;
        box-shadow: 0 0 12px ${theme.glow || 'rgba(167, 139, 250, 0.15)'};
      `
      : `
        background: rgba(248, 113, 113, 0.1);
        color: #f87171;
        border: 1px solid rgba(248, 113, 113, 0.2);
      `}
`;

const AccountPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading, setUser, refreshUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newImageBase64, setNewImageBase64] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imageError, setImageError] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPreviewUrl(user.pfpUrl || null);
    }
  }, [user]);

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

  const initials = (displayName || user.username || `User ${user.fid}`)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNewImageBase64(base64);
      setPreviewUrl(base64);
      setRemoveImage(false);
      setImageError(false);
      setMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setNewImageBase64(null);
    setPreviewUrl(null);
    setRemoveImage(true);
    setImageError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    setDisplayName(user.displayName || '');
    setPreviewUrl(user.pfpUrl || null);
    setNewImageBase64(null);
    setRemoveImage(false);
    setMessage(null);
    setImageError(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const updatePayload: {
        displayName?: string | null;
        profilePicture?: string | null;
      } = {};

      if (displayName !== (user.displayName || '')) {
        updatePayload.displayName = displayName || null;
      }

      if (newImageBase64) {
        updatePayload.profilePicture = newImageBase64;
      } else if (removeImage) {
        updatePayload.profilePicture = null;
      }

      if (Object.keys(updatePayload).length === 0) {
        setMessage({ type: 'success', text: 'No changes to save' });
        setIsSaving(false);
        return;
      }

      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      if (data.user) {
        setUser(data.user);
        setPreviewUrl(data.user.pfpUrl || null);
        setNewImageBase64(null);
        setRemoveImage(false);
      }

      setMessage({ type: 'success', text: 'Saved' });
      await refreshUser();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    displayName !== (user.displayName || '') ||
    newImageBase64 !== null ||
    removeImage;

  const hasImage = previewUrl || user.pfpUrl;

  return (
    <Container>
      <Head>
        <title>Account | {APP_NAME}</title>
        <meta name="description" content="Manage your account" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Header>
        <BackButton onClick={() => router.back()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </BackButton>
        <Title>Account</Title>
        <Spacer />
      </Header>

      <Main>
        <FormCard>
          {message && (
            <Message $type={message.type}>{message.text}</Message>
          )}

          <ProfileSection>
            <AvatarSection>
              <AvatarWrapper>
                <Avatar>
                  {previewUrl && !imageError ? (
                    <AvatarImage
                      src={previewUrl}
                      alt="Profile"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <DefaultAvatar>{initials}</DefaultAvatar>
                  )}
                </Avatar>
                <EditOverlay onClick={() => fileInputRef.current?.click()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </EditOverlay>
              </AvatarWrapper>
              {hasImage && !removeImage && (
                <RemoveButton onClick={handleRemoveImage}>
                  Remove photo
                </RemoveButton>
              )}
            </AvatarSection>
            <HiddenInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
            />
            <ProfileInfo>
              <Label htmlFor="displayName">Display name</Label>
              <NameInput
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                maxLength={50}
              />
            </ProfileInfo>
          </ProfileSection>

          <ButtonContainer>
            <Button onClick={handleCancel} disabled={isSaving || !hasChanges}>
              Cancel
            </Button>
            <Button $primary onClick={handleSave} disabled={isSaving || !hasChanges}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </ButtonContainer>
        </FormCard>
      </Main>
    </Container>
  );
};

export default AccountPage;
