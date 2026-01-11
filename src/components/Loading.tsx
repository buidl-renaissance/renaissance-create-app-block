import styled, { keyframes } from "styled-components";

export const Loading = ({ text }: { text?: string }) => {
  return (
    <LoadingOverlay>
      <Spinner />
      <LoadingText>{text || "Loading..."}</LoadingText>
    </LoadingOverlay>
  );
};

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.background};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Spinner = styled.div`
  width: 56px;
  height: 56px;
  border: 3px solid ${({ theme }) => theme.border};
  border-top-color: ${({ theme }) => theme.accentGold};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 5px;
    border: 2px solid transparent;
    border-top-color: ${({ theme }) => theme.accent};
    border-radius: 50%;
    animation: ${spin} 0.7s linear infinite reverse;
  }
`;

const LoadingText = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 500;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.text};
  margin-top: 0.5rem;
  font-style: italic;
`;

export { LoadingOverlay, Spinner, LoadingText };
