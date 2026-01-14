import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAppBlock, RegistryCategory, BrowseRegistryOptions } from '@/contexts/AppBlockContext';
import { RegistryCard } from './RegistryCard';

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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.25rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.surface};
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.glow};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    opacity: 0.6;
  }
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $active, theme }) => $active ? `
    background: ${theme.accent};
    border: 1px solid ${theme.accent};
    color: white;
  ` : `
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    color: ${theme.textSecondary};
    
    &:hover {
      border-color: ${theme.accent};
      color: ${theme.accent};
    }
  `}
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ResultsCount = styled.span`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.5rem 0;
`;

const EmptyText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Crimson Pro', Georgia, serif;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $active, theme }) => $active ? `
    background: ${theme.accent};
    border: 1px solid ${theme.accent};
    color: white;
  ` : `
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    color: ${theme.textSecondary};
    
    &:hover:not(:disabled) {
      border-color: ${theme.accent};
      color: ${theme.accent};
    }
    
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `}
`;

const categories: { id: RegistryCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '🌐' },
  { id: 'events', label: 'Events', icon: '📅' },
  { id: 'tools', label: 'Tools', icon: '🛠️' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'games', label: 'Games', icon: '🎮' },
  { id: 'community', label: 'Community', icon: '👥' },
];

interface RegistryBrowserProps {
  initialCategory?: RegistryCategory;
  initialQuery?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  pageSize?: number;
  onSelectEntry?: (slug: string) => void;
}

export const RegistryBrowser: React.FC<RegistryBrowserProps> = ({
  initialCategory,
  initialQuery = '',
  showSearch = true,
  showFilters = true,
  pageSize = 12,
  onSelectEntry,
}) => {
  const { registryEntries, registryLoading, registryTotal, browseRegistry } = useAppBlock();
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<RegistryCategory | 'all'>(initialCategory || 'all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const options: BrowseRegistryOptions = {
      page: currentPage,
      limit: pageSize,
    };

    if (selectedCategory !== 'all') {
      options.category = selectedCategory;
    }

    if (searchQuery.trim()) {
      options.query = searchQuery.trim();
    }

    browseRegistry(options);
  }, [searchQuery, selectedCategory, currentPage, pageSize, browseRegistry]);

  const totalPages = Math.ceil(registryTotal / pageSize);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: RegistryCategory | 'all') => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <Container>
      {(showSearch || showFilters) && (
        <SearchSection>
          {showSearch && (
            <SearchInput
              type="text"
              placeholder="Search App Blocks..."
              value={searchQuery}
              onChange={handleSearch}
            />
          )}
          
          {showFilters && (
            <FiltersRow>
              {categories.map(cat => (
                <FilterButton
                  key={cat.id}
                  $active={selectedCategory === cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  type="button"
                >
                  {cat.icon} {cat.label}
                </FilterButton>
              ))}
            </FiltersRow>
          )}
        </SearchSection>
      )}

      <ResultsHeader>
        <ResultsCount>
          {registryTotal} {registryTotal === 1 ? 'block' : 'blocks'} found
        </ResultsCount>
      </ResultsHeader>

      {registryLoading ? (
        <LoadingState>Loading blocks...</LoadingState>
      ) : registryEntries.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyTitle>No Blocks Found</EmptyTitle>
          <EmptyText>
            {searchQuery 
              ? `No blocks match "${searchQuery}"`
              : 'No blocks are available in this category yet'
            }
          </EmptyText>
        </EmptyState>
      ) : (
        <>
          <Grid>
            {registryEntries.map((entry, index) => (
              <RegistryCard key={entry.id} entry={entry} index={index} />
            ))}
          </Grid>

          {totalPages > 1 && (
            <Pagination>
              <PageButton
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Prev
              </PageButton>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PageButton
                    key={page}
                    $active={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                    type="button"
                  >
                    {page}
                  </PageButton>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span style={{ color: 'var(--text-secondary)' }}>...</span>
              )}
              
              {totalPages > 5 && (
                <PageButton
                  $active={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  type="button"
                >
                  {totalPages}
                </PageButton>
              )}
              
              <PageButton
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default RegistryBrowser;
