import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    transition: background-color 0.3s ease, color 0.3s ease;
    line-height: 1.5;
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  a {
    color: ${props => props.theme.accent};
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: ${props => props.theme.accentGold};
    }
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  input, textarea {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  ::selection {
    background: ${props => props.theme.accent};
    color: white;
  }

  /* Custom scrollbar for dark theme */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.backgroundAlt};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.textSecondary};
  }
`;
