import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { WorkflowIntent } from '@/db/schema';
import { getIntentDescription } from '@/lib/promptBuilder';
import { 
  AgentLog, 
  AgentLogSummary, 
  Operation as RenAIOperation,
  Question as RenAIQuestion,
  OperationStep,
  StreamEvent,
} from '@/lib/renaiClient';

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

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
`;

const ActionButton = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: ${({ $active, theme }) => $active ? `${theme.accent}15` : theme.backgroundAlt};
  border: 2px solid ${({ $active, theme }) => $active ? theme.accent : theme.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.accent};
    background: ${({ theme }) => theme.accent}10;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const ActionLabel = styled.span`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const ExpandedSection = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 1.25rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const SectionTitle = styled.h4`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.25rem 0;
`;

const SectionDescription = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0 0 1rem 0;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.glow};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    opacity: 0.6;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  min-height: 80px;
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.glow};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
    opacity: 0.6;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const TriggerButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.accent} 0%, ${({ theme }) => theme.accentGold} 150%);
  border: none;
  border-radius: 8px;
  color: white;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${({ theme }) => theme.accent}44;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.text};
    color: ${({ theme }) => theme.text};
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const StatusMessage = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${({ $type }) => 
    $type === 'success' ? '#22c55e15' : 
    $type === 'error' ? '#ef444420' : 
    '#3b82f615'};
  border-radius: 8px;
  color: ${({ $type }) => 
    $type === 'success' ? '#22c55e' : 
    $type === 'error' ? '#ef4444' : 
    '#3b82f6'};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
`;

const OperationStatus = styled.div`
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const StatusLabel = styled.span<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ $status }) => 
    $status === 'completed' ? '#22c55e' : 
    $status === 'failed' ? '#ef4444' : 
    '#f59e0b'};
`;

const StatusDot = styled.div<{ $status: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $status }) => 
    $status === 'completed' ? '#22c55e' : 
    $status === 'failed' ? '#ef4444' : 
    '#f59e0b'};
  animation: ${({ $status }) => $status === 'processing' || $status === 'pending' ? pulse : 'none'} 1.5s ease-in-out infinite;
`;

const FilesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  padding: 0.25rem 0.5rem;
  background: ${({ theme }) => theme.background};
  border-radius: 4px;
`;

const QuestionsSection = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid #3b82f6;
  border-radius: 10px;
  padding: 1rem;
  margin-top: 1rem;
`;

const QuestionTitle = styled.h5`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
  color: #3b82f6;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuestionItem = styled.div`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const QuestionText = styled.p`
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  margin: 0 0 0.75rem 0;
`;

const QuestionActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AnswerButton = styled.button`
  padding: 0.5rem 1rem;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  color: white;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SkipButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  color: ${({ theme }) => theme.textSecondary};
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.text};
    color: ${({ theme }) => theme.text};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AnswerInput = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  min-height: 60px;
  resize: vertical;
  margin-bottom: 0.5rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

// ============================================
// Progress Timeline Styled Components
// ============================================

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const ProgressTimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-radius: 10px;
  margin-bottom: 1rem;
`;

const TimelineStep = styled.div<{ $active?: boolean; $completed?: boolean; $error?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
  width: 100%;
  
  ${({ $active, $completed, $error, theme }) => {
    if ($error) {
      return css`
        background: #ef444420;
        color: #ef4444;
      `;
    }
    if ($completed) {
      return css`
        background: #22c55e20;
        color: #22c55e;
      `;
    }
    if ($active) {
      return css`
        background: ${theme.accent}20;
        color: ${theme.accent};
        animation: ${pulse} 2s ease-in-out infinite;
      `;
    }
    return css`
      background: transparent;
      color: ${theme.textSecondary};
      opacity: 0.5;
    `;
  }}
`;

const TimelineStepIcon = styled.span`
  font-size: 0.9rem;
`;

const TimelineConnector = styled.div<{ $completed?: boolean }>`
  width: 2px;
  height: 16px;
  margin-left: 1rem;
  background: ${({ $completed }) => $completed ? '#22c55e' : '#e5e7eb'};
  flex-shrink: 0;
`;

const IterationBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: ${({ theme }) => theme.accent}15;
  border: 1px solid ${({ theme }) => theme.accent}30;
  border-radius: 100px;
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.65rem;
  color: ${({ theme }) => theme.accent};
  margin-left: auto;
`;

// ============================================
// Cost Tracker Styled Components
// ============================================

const CostTrackerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #10b98115 0%, #22c55e10 100%);
  border: 1px solid #10b98130;
  border-radius: 10px;
  margin-bottom: 1rem;
`;

const CostDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const CostLabel = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.65rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CostValue = styled.span`
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: #10b981;
`;

const TokenBar = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const TokenBarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.65rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const TokenBarTrack = styled.div`
  height: 6px;
  background: ${({ theme }) => theme.background};
  border-radius: 3px;
  overflow: hidden;
  display: flex;
`;

const TokenBarSegment = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ $color }) => $color};
  transition: width 0.3s ease;
`;

const CostBreakdownTooltip = styled.div`
  position: relative;
  cursor: help;
  
  &:hover > div {
    opacity: 1;
    visibility: visible;
  }
`;

const TooltipContent = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 0.75rem;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: ${({ theme }) => theme.border};
  }
`;

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.textSecondary};
  
  & + & {
    margin-top: 0.25rem;
  }
`;

// ============================================
// Activity Feed Styled Components
// ============================================

const ActivityFeedContainer = styled.div`
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  margin-bottom: 1rem;
  max-height: 300px;
  overflow-y: auto;
`;

const ActivityFeedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.backgroundAlt};
  z-index: 1;
`;

const ActivityFeedTitle = styled.h5`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActivityCount = styled.span`
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.65rem;
  padding: 0.125rem 0.375rem;
  background: ${({ theme }) => theme.accent}20;
  color: ${({ theme }) => theme.accent};
  border-radius: 100px;
`;

const ActivityList = styled.div`
  padding: 0.5rem;
`;

const ActivityItem = styled.div<{ $isError?: boolean; $isNew?: boolean }>`
  display: flex;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.375rem;
  background: ${({ $isError, theme }) => $isError ? '#ef444410' : theme.background};
  border: 1px solid ${({ $isError, theme }) => $isError ? '#ef444430' : 'transparent'};
  animation: ${({ $isNew }) => $isNew ? slideIn : 'none'} 0.3s ease-out;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ToolIconWrapper = styled.div<{ $color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const ToolName = styled.span`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const ActivityTimestamp = styled.span`
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.6rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const ActivityDetails = styled.div<{ $expanded?: boolean }>`
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.4;
  overflow: hidden;
  max-height: ${({ $expanded }) => $expanded ? '200px' : '2.8em'};
  transition: max-height 0.2s ease;
  
  ${({ $expanded }) => !$expanded && css`
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  `}
`;

const ExpandToggle = styled.button`
  background: none;
  border: none;
  padding: 0.25rem 0;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.accent};
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
`;

const MetaBadge = styled.span<{ $color?: string }>`
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.6rem;
  padding: 0.125rem 0.375rem;
  background: ${({ $color }) => $color ? `${$color}15` : '#6b728015'};
  color: ${({ $color }) => $color || '#6b7280'};
  border-radius: 4px;
`;

// ============================================
// File Changes Styled Components
// ============================================

const FileChangesContainer = styled.div`
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const FileChangesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const FileChangesTitle = styled.h5`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;

const FileCount = styled.span`
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.65rem;
  padding: 0.125rem 0.5rem;
  background: #22c55e20;
  color: #22c55e;
  border-radius: 100px;
`;

const FileChangesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const FileChangeItem = styled.div<{ $type: 'read' | 'write' | 'edit' | 'delete' | 'create' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.625rem;
  background: ${({ theme }) => theme.background};
  border-radius: 6px;
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const FileStatusIcon = styled.span<{ $type: 'read' | 'write' | 'edit' | 'delete' | 'create' }>`
  font-size: 0.8rem;
  ${({ $type }) => {
    switch ($type) {
      case 'read': return css`color: #6b7280;`;
      case 'write': 
      case 'create': return css`color: #22c55e;`;
      case 'edit': return css`color: #f59e0b;`;
      case 'delete': return css`color: #ef4444;`;
      default: return css`color: #6b7280;`;
    }
  }}
`;

const FileName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileActionLabel = styled.span<{ $type: 'read' | 'write' | 'edit' | 'delete' | 'create' }>`
  font-size: 0.6rem;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  text-transform: uppercase;
  
  ${({ $type }) => {
    switch ($type) {
      case 'read': return css`background: #6b728015; color: #6b7280;`;
      case 'write': 
      case 'create': return css`background: #22c55e15; color: #22c55e;`;
      case 'edit': return css`background: #f59e0b15; color: #f59e0b;`;
      case 'delete': return css`background: #ef444415; color: #ef4444;`;
      default: return css`background: #6b728015; color: #6b7280;`;
    }
  }}
`;

// ============================================
// Enhanced Operation Panel
// ============================================

const EnhancedOperationPanel = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const OperationPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const OperationPanelBody = styled.div`
  padding: 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: ${({ theme }) => theme.background};
  border-radius: 8px;
  margin-bottom: 1rem;
`;

// Stats Row - shows key metrics even without cost data
const StatsRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const StatBadge = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: ${({ $color, theme }) => $color ? `${$color}15` : theme.backgroundAlt};
  border: 1px solid ${({ $color, theme }) => $color ? `${$color}30` : theme.border};
  border-radius: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 0.75rem;
`;

const StatIcon = styled.span`
  font-size: 0.9rem;
`;

const StatValue = styled.span`
  font-family: 'SF Mono', 'Monaco', monospace;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.textSecondary};
`;

const Tab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: ${({ $active, theme }) => $active ? theme.surface : 'transparent'};
  border: none;
  border-radius: 6px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 0.8rem;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  color: ${({ $active, theme }) => $active ? theme.text : theme.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.text};
  }
`;

// Use types from renaiClient, but keep local aliases for compatibility
type Question = RenAIQuestion;
type Operation = RenAIOperation;

// File operation tracking
interface FileOperation {
  path: string;
  type: 'read' | 'write' | 'edit' | 'delete' | 'create';
  timestamp: number;
}

// Timeline step configuration - simplified for cleaner display
interface TimelineStepConfig {
  id: OperationStep | 'initial' | 'queued';
  label: string;
  icon: string;
}

// Simplified timeline with just 4 key steps
const TIMELINE_STEPS: TimelineStepConfig[] = [
  { id: 'queued', label: 'Queued', icon: '⏳' },
  { id: 'agent_running', label: 'Working', icon: '⚡' },
  { id: 'committed', label: 'Committed', icon: '💾' },
  { id: 'completed', label: 'Done', icon: '✅' },
];

// Map various steps to simplified timeline positions
const mapStepToTimeline = (step: OperationStep | 'initial' | 'queued'): number => {
  switch (step) {
    case 'initial':
    case 'queued':
      return 0; // Queued
    case 'repo_cloned':
    case 'repo_initialized':
    case 'branch_checkout':
    case 'agent_started':
    case 'agent_running':
      return 1; // Working
    case 'committed':
    case 'completed_commit_failed':
      return 2; // Committed
    case 'completed':
      return 3; // Done
    case 'agent_failed':
      return 1; // Show as Working (with error)
    default:
      return 0;
  }
};

// Tool icon/color mapping
const TOOL_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  read_file: { icon: '📖', color: '#6b7280', label: 'Read' },
  write_file: { icon: '✏️', color: '#22c55e', label: 'Write' },
  edit_file: { icon: '🔧', color: '#f59e0b', label: 'Edit' },
  delete_file: { icon: '🗑️', color: '#ef4444', label: 'Delete' },
  list_directory: { icon: '📂', color: '#3b82f6', label: 'List' },
  search_files: { icon: '🔍', color: '#8b5cf6', label: 'Search' },
  run_command: { icon: '💻', color: '#ec4899', label: 'Run' },
  task_complete: { icon: '✅', color: '#22c55e', label: 'Complete' },
  default: { icon: '⚙️', color: '#6b7280', label: 'Tool' },
};

interface IntentConfig {
  intent: WorkflowIntent;
  label: string;
  icon: string;
  color: string;
}

const INTENT_CONFIGS: IntentConfig[] = [
  { intent: 'full_build', label: 'Build', icon: '🚀', color: '#8b5cf6' },
  { intent: 'features', label: 'Features', icon: '✨', color: '#3b82f6' },
  { intent: 'branding', label: 'Style', icon: '🎨', color: '#ec4899' },
  { intent: 'config', label: 'Config', icon: '⚙️', color: '#f59e0b' },
  { intent: 'custom', label: 'Custom', icon: '🔧', color: '#6b7280' },
];

interface WorkflowActionsProps {
  appBlockId: string;
  disabled?: boolean;
}

export const WorkflowActions: React.FC<WorkflowActionsProps> = ({
  appBlockId,
  disabled = false,
}) => {
  const [selectedIntent, setSelectedIntent] = useState<WorkflowIntent | null>(null);
  const [prompt, setPrompt] = useState('');
  const [customIntent, setCustomIntent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Operation tracking state
  const [operationId, setOperationId] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [answeringId, setAnsweringId] = useState<string | null>(null);

  // Enhanced tracking state
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [logSummary, setLogSummary] = useState<AgentLogSummary | null>(null);
  const [fileOperations, setFileOperations] = useState<FileOperation[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'activity' | 'files'>('activity');
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const lastLogTimestamp = useRef<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const activityFeedRef = useRef<HTMLDivElement>(null);

  // Extract file operations from agent logs
  const extractFileOperations = useCallback((logs: AgentLog[]): FileOperation[] => {
    const fileOps: FileOperation[] = [];
    const seenFiles = new Set<string>();

    for (const log of logs) {
      if (log.type === 'tool_call' && log.tool_name && log.tool_input) {
        const path = log.tool_input.path as string;
        if (!path) continue;

        let opType: FileOperation['type'] | null = null;
        
        switch (log.tool_name) {
          case 'read_file':
            opType = 'read';
            break;
          case 'write_file':
            // Check if file existed before (was read) - if not, it's a create
            opType = seenFiles.has(path) ? 'write' : 'create';
            break;
          case 'edit_file':
            opType = 'edit';
            break;
          case 'delete_file':
            opType = 'delete';
            break;
        }

        if (opType) {
          seenFiles.add(path);
          // Only add if not already in the list with same type
          const existing = fileOps.find(f => f.path === path && f.type === opType);
          if (!existing) {
            fileOps.push({
              path,
              type: opType,
              timestamp: log.created_at,
            });
          }
        }
      }
    }

    return fileOps;
  }, []);

  // Get current step from operation result
  const getCurrentStep = useCallback((): OperationStep | 'initial' | 'queued' => {
    if (!operation) return 'initial';
    if (operation.status === 'pending') return 'queued';
    if (operation.status === 'failed') return 'agent_failed' as OperationStep;
    
    const step = operation.result?.step;
    if (step) return step;
    
    if (operation.status === 'processing') return 'agent_running';
    if (operation.status === 'completed') return 'completed';
    
    return 'initial';
  }, [operation]);

  // Format cost for display
  const formatCost = (cost: number): string => {
    if (cost < 0.01) {
      return `$${(cost * 100).toFixed(3)}¢`;
    }
    return `$${cost.toFixed(4)}`;
  };

  // Format duration for display
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  // Poll for operation status with enhanced data
  const pollOperationStatus = useCallback(async (opId: string) => {
    try {
      const params = new URLSearchParams({
        includeLogs: 'true',
        logLimit: '100',
      });
      
      if (lastLogTimestamp.current > 0) {
        params.set('sinceTimestamp', lastLogTimestamp.current.toString());
      }

      const response = await fetch(`/api/app-blocks/${appBlockId}/operation/${opId}?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get operation status');
      }
      
      // Debug logging to see what data is available
      console.log('📊 Operation data received:', {
        status: data.data.operation?.status,
        result: data.data.operation?.result,
        hasAgentLogs: !!data.data.agentLogs?.length,
        hasLogSummary: !!data.data.logSummary,
        streamUrl: data.data.streamUrl,
      });
      
      setOperation(data.data.operation);
      
      // Update stream URL if available
      if (data.data.streamUrl) {
        setStreamUrl(data.data.streamUrl);
      }
      
      // Update agent logs (append new ones)
      if (data.data.agentLogs && data.data.agentLogs.length > 0) {
        setAgentLogs(prev => {
          const existingIds = new Set(prev.map(l => l.id));
          const newLogs = data.data.agentLogs.filter((l: AgentLog) => !existingIds.has(l.id));
          
          if (newLogs.length > 0) {
            lastLogTimestamp.current = Math.max(
              lastLogTimestamp.current,
              ...newLogs.map((l: AgentLog) => l.created_at)
            );
            
            const allLogs = [...prev, ...newLogs];
            // Update file operations based on all logs
            setFileOperations(extractFileOperations(allLogs));
            return allLogs;
          }
          return prev;
        });
      }
      
      // Update log summary
      if (data.data.logSummary) {
        setLogSummary(data.data.logSummary);
      }
      
      if (data.data.questions && data.data.questions.length > 0) {
        setQuestions(data.data.questions.filter((q: Question) => q.status === 'pending'));
      }
      
      // Continue polling if still processing
      if (data.data.operation.status === 'pending' || data.data.operation.status === 'processing') {
        setTimeout(() => pollOperationStatus(opId), 2000);
      } else if (data.data.operation.status === 'completed') {
        const filesChanged = data.data.operation.result?.filesChanged || data.data.operation.result?.files || [];
        const cost = data.data.operation.result?.cost;
        
        let message = `Changes applied successfully! ${filesChanged.length} file(s) modified.`;
        if (cost) {
          message += ` Total cost: ${formatCost(cost.totalCost)}`;
        }
        
        setResult({ type: 'success', message });
        setIsLoading(false);
      } else if (data.data.operation.status === 'failed') {
        setResult({ 
          type: 'error', 
          message: data.data.operation.error || data.data.operation.result?.error || 'Operation failed' 
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error polling operation status:', error);
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to check operation status',
      });
      setIsLoading(false);
    }
  }, [appBlockId, extractFileOperations]);

  // Start polling when we have an operation ID
  useEffect(() => {
    if (operationId && isLoading) {
      pollOperationStatus(operationId);
    }
  }, [operationId, isLoading, pollOperationStatus]);

  // SSE streaming for real-time updates
  useEffect(() => {
    if (!streamUrl || !isLoading || !operationId) return;

    // Try to connect to SSE stream for real-time updates
    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);
        
        if (data.type === 'tool_call') {
          // Create an AgentLog from the stream event
          const streamLog: AgentLog = {
            id: `stream-${Date.now()}-${Math.random()}`,
            operation_id: operationId,
            type: 'tool_call',
            tool_name: data.tool,
            tool_input: data.input,
            tool_output: data.output,
            iteration: data.iteration,
            input_tokens: data.tokens?.input,
            output_tokens: data.tokens?.output,
            cost_usd: data.costUsd,
            duration_ms: data.durationMs,
            is_error: data.isError || false,
            created_at: data.timestamp || Math.floor(Date.now() / 1000),
          };
          
          setAgentLogs(prev => {
            const newLogs = [...prev, streamLog];
            setFileOperations(extractFileOperations(newLogs));
            return newLogs;
          });
          
          // Auto-scroll activity feed
          if (activityFeedRef.current) {
            activityFeedRef.current.scrollTop = activityFeedRef.current.scrollHeight;
          }
        }
      } catch (e) {
        console.warn('Failed to parse SSE event:', e);
      }
    };

    eventSource.addEventListener('complete', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.summary) {
          setLogSummary(data.summary);
        }
      } catch (e) {
        console.warn('Failed to parse complete event:', e);
      }
      eventSource.close();
    });

    eventSource.onerror = () => {
      // SSE failed, polling will continue to work
      console.warn('SSE connection failed, falling back to polling');
      eventSource.close();
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [streamUrl, isLoading, operationId, extractFileOperations]);

  // Reset all state helper
  const resetState = useCallback(() => {
    setPrompt('');
    setCustomIntent('');
    setResult(null);
    setOperationId(null);
    setOperation(null);
    setQuestions([]);
    setAgentLogs([]);
    setLogSummary(null);
    setFileOperations([]);
    setExpandedLogs(new Set());
    setActiveTab('activity');
    setStreamUrl(null);
    lastLogTimestamp.current = 0;
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const handleSelectIntent = (intent: WorkflowIntent) => {
    if (selectedIntent === intent) {
      setSelectedIntent(null);
      resetState();
    } else {
      setSelectedIntent(intent);
      resetState();
    }
  };

  const handleTrigger = async () => {
    if (!selectedIntent) return;
    
    setIsLoading(true);
    setResult(null);
    setOperationId(null);
    setOperation(null);
    setQuestions([]);

    try {
      const response = await fetch(`/api/app-blocks/${appBlockId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: selectedIntent,
          prompt: prompt || undefined,
          customIntent: selectedIntent === 'custom' ? customIntent : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to trigger workflow');
      }

      setOperationId(data.operationId);
      setResult({
        type: 'info',
        message: 'Code changes initiated. Monitoring progress...',
      });

    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to trigger workflow',
      });
      setIsLoading(false);
    }
  };

  const handleAnswerQuestion = async (questionId: string) => {
    const answer = answerInputs[questionId];
    if (!answer?.trim()) return;
    
    setAnsweringId(questionId);
    
    try {
      const response = await fetch(`/api/questions/${questionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answer.trim() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit answer');
      }
      
      // Remove answered question from list
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      setAnswerInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[questionId];
        return newInputs;
      });
      
      // Resume polling if there are no more questions
      if (questions.length <= 1 && operationId) {
        pollOperationStatus(operationId);
      }
      
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit answer',
      });
    } finally {
      setAnsweringId(null);
    }
  };

  const handleSkipQuestion = async (questionId: string) => {
    setAnsweringId(questionId);
    
    try {
      const response = await fetch(`/api/questions/${questionId}/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to skip question');
      }
      
      // Remove skipped question from list
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      
      // Resume polling if there are no more questions
      if (questions.length <= 1 && operationId) {
        pollOperationStatus(operationId);
      }
      
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to skip question',
      });
    } finally {
      setAnsweringId(null);
    }
  };

  const handleCancel = () => {
    setSelectedIntent(null);
    resetState();
    setIsLoading(false);
  };

  const canTrigger = selectedIntent && (selectedIntent !== 'custom' || customIntent.trim());

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  // Toggle log expansion
  const toggleLogExpanded = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  // Get tool config for display
  const getToolConfig = (toolName: string | undefined) => {
    if (!toolName) return TOOL_CONFIG.default;
    return TOOL_CONFIG[toolName] || TOOL_CONFIG.default;
  };

  // Get file icon based on operation type
  const getFileIcon = (type: FileOperation['type']) => {
    switch (type) {
      case 'read': return '👁️';
      case 'write':
      case 'create': return '✨';
      case 'edit': return '✏️';
      case 'delete': return '🗑️';
      default: return '📄';
    }
  };

  // Get current iteration
  const currentIteration = operation?.result?.currentIteration || logSummary?.iterations || 0;
  
  // Get running cost
  const runningCost = operation?.result?.runningCostUsd || operation?.result?.cost?.totalCost || logSummary?.totalCostUsd || 0;
  
  // Get token counts
  const inputTokens = operation?.result?.tokenUsage?.inputTokens || logSummary?.inputTokens || 0;
  const outputTokens = operation?.result?.tokenUsage?.outputTokens || logSummary?.outputTokens || 0;
  const totalTokens = inputTokens + outputTokens;

  // Get modified files from operation result or file operations
  const modifiedFiles = operation?.result?.filesChanged || 
    operation?.result?.files || 
    fileOperations.filter(f => f.type !== 'read').map(f => f.path);

  // Current step for timeline
  const currentStep = getCurrentStep();

  return (
    <Container>
      <ActionsGrid>
        {INTENT_CONFIGS.map((config) => (
          <ActionButton
            key={config.intent}
            type="button"
            $active={selectedIntent === config.intent}
            onClick={() => handleSelectIntent(config.intent)}
            disabled={disabled || isLoading}
          >
            <ActionIcon $color={config.color}>
              {config.icon}
            </ActionIcon>
            <ActionLabel>{config.label}</ActionLabel>
          </ActionButton>
        ))}
      </ActionsGrid>

      {selectedIntent && (
        <ExpandedSection>
          <SectionTitle>
            {INTENT_CONFIGS.find(c => c.intent === selectedIntent)?.label} Workflow
          </SectionTitle>
          <SectionDescription>
            {getIntentDescription(selectedIntent)}
          </SectionDescription>

          {/* Enhanced Operation Display */}
          {operation && (
            <EnhancedOperationPanel>
              <OperationPanelHeader>
                <StatusLabel $status={operation.status}>
                  <StatusDot $status={operation.status} />
                  {getStatusText(operation.status)}
                </StatusLabel>
                {operation.result?.commit && (
                  <span style={{ fontFamily: 'SF Mono, Monaco, monospace', fontSize: '0.7rem', color: '#6b7280' }}>
                    {operation.result.commit.substring(0, 7)}
                  </span>
                )}
              </OperationPanelHeader>
              
              <OperationPanelBody>
                {/* Progress Timeline */}
                <ProgressTimelineContainer>
                  {TIMELINE_STEPS.map((step, idx) => {
                    const currentTimelineIndex = mapStepToTimeline(currentStep);
                    const isCompleted = idx < currentTimelineIndex;
                    const isActive = idx === currentTimelineIndex;
                    const isError = currentStep === 'agent_failed' && idx === 1; // Working step
                    
                    return (
                      <React.Fragment key={step.id}>
                        {idx > 0 && <TimelineConnector $completed={isCompleted} />}
                        <TimelineStep 
                          $completed={isCompleted} 
                          $active={isActive}
                          $error={isError}
                        >
                          <TimelineStepIcon>
                            {isError ? '❌' : isCompleted ? '✓' : step.icon}
                          </TimelineStepIcon>
                          {step.label}
                        </TimelineStep>
                      </React.Fragment>
                    );
                  })}
                </ProgressTimelineContainer>

                {/* Stats Row - always show key metrics */}
                <StatsRow>
                  {currentIteration > 0 && (
                    <StatBadge $color="#8b5cf6">
                      <StatIcon>🔄</StatIcon>
                      <StatValue>{currentIteration}</StatValue>
                      <StatLabel>iterations</StatLabel>
                    </StatBadge>
                  )}
                  {modifiedFiles.length > 0 && (
                    <StatBadge $color="#22c55e">
                      <StatIcon>📝</StatIcon>
                      <StatValue>{modifiedFiles.length}</StatValue>
                      <StatLabel>files</StatLabel>
                    </StatBadge>
                  )}
                  {agentLogs.length > 0 && (
                    <StatBadge $color="#3b82f6">
                      <StatIcon>⚡</StatIcon>
                      <StatValue>{agentLogs.length}</StatValue>
                      <StatLabel>actions</StatLabel>
                    </StatBadge>
                  )}
                  {runningCost > 0 && (
                    <StatBadge $color="#10b981">
                      <StatIcon>💰</StatIcon>
                      <StatValue>{formatCost(runningCost)}</StatValue>
                    </StatBadge>
                  )}
                  {totalTokens > 0 && (
                    <StatBadge>
                      <StatIcon>🔤</StatIcon>
                      <StatValue>{totalTokens.toLocaleString()}</StatValue>
                      <StatLabel>tokens</StatLabel>
                    </StatBadge>
                  )}
                </StatsRow>

                {/* Cost & Token Tracker - detailed view */}
                {(runningCost > 0 || totalTokens > 0) && (
                  <CostTrackerContainer>
                    <CostBreakdownTooltip>
                      <CostDisplay>
                        <CostLabel>Cost</CostLabel>
                        <CostValue>{formatCost(runningCost)}</CostValue>
                      </CostDisplay>
                      {operation?.result?.cost && (
                        <TooltipContent>
                          <TooltipRow>
                            <span>Input:</span>
                            <span>{formatCost(operation.result.cost.inputCost)}</span>
                          </TooltipRow>
                          <TooltipRow>
                            <span>Output:</span>
                            <span>{formatCost(operation.result.cost.outputCost)}</span>
                          </TooltipRow>
                        </TooltipContent>
                      )}
                    </CostBreakdownTooltip>
                    
                    <TokenBar>
                      <TokenBarLabel>
                        <span>Tokens</span>
                        <span>{totalTokens.toLocaleString()}</span>
                      </TokenBarLabel>
                      <TokenBarTrack>
                        <TokenBarSegment 
                          $width={totalTokens > 0 ? (inputTokens / totalTokens) * 100 : 50}
                          $color="#3b82f6"
                        />
                        <TokenBarSegment 
                          $width={totalTokens > 0 ? (outputTokens / totalTokens) * 100 : 50}
                          $color="#8b5cf6"
                        />
                      </TokenBarTrack>
                      <TokenBarLabel>
                        <span style={{ color: '#3b82f6' }}>↓ {inputTokens.toLocaleString()}</span>
                        <span style={{ color: '#8b5cf6' }}>↑ {outputTokens.toLocaleString()}</span>
                      </TokenBarLabel>
                    </TokenBar>
                  </CostTrackerContainer>
                )}

                {/* Tab Navigation */}
                {(agentLogs.length > 0 || fileOperations.length > 0) && (
                  <>
                    <TabContainer>
                      <Tab 
                        $active={activeTab === 'activity'}
                        onClick={() => setActiveTab('activity')}
                      >
                        Activity ({agentLogs.length})
                      </Tab>
                      <Tab 
                        $active={activeTab === 'files'}
                        onClick={() => setActiveTab('files')}
                      >
                        Files ({modifiedFiles.length})
                      </Tab>
                    </TabContainer>

                    {/* Activity Feed */}
                    {activeTab === 'activity' && agentLogs.length > 0 && (
                      <ActivityFeedContainer ref={activityFeedRef}>
                        <ActivityFeedHeader>
                          <ActivityFeedTitle>
                            <span>⚡</span>
                            Agent Activity
                          </ActivityFeedTitle>
                          <ActivityCount>{agentLogs.length} actions</ActivityCount>
                        </ActivityFeedHeader>
                        <ActivityList>
                          {agentLogs.map((log, idx) => {
                            const toolConfig = getToolConfig(log.tool_name);
                            const isExpanded = expandedLogs.has(log.id);
                            const isNew = idx === agentLogs.length - 1;
                            
                            return (
                              <ActivityItem 
                                key={log.id} 
                                $isError={log.is_error}
                                $isNew={isNew}
                              >
                                <ToolIconWrapper $color={toolConfig.color}>
                                  {toolConfig.icon}
                                </ToolIconWrapper>
                                <ActivityContent>
                                  <ActivityHeader>
                                    <ToolName>{log.tool_name || log.type}</ToolName>
                                    {log.iteration > 0 && (
                                      <MetaBadge>#{log.iteration}</MetaBadge>
                                    )}
                                    {log.duration_ms && (
                                      <ActivityTimestamp>
                                        {formatDuration(log.duration_ms)}
                                      </ActivityTimestamp>
                                    )}
                                  </ActivityHeader>
                                  
                                  {!!(log.tool_input || log.tool_output || log.message) && (
                                    <>
                                      <ActivityDetails $expanded={isExpanded}>
                                        {!!log.tool_input?.path && (
                                          <span>{log.tool_input.path as string}</span>
                                        )}
                                        {!!log.message && <span>{log.message}</span>}
                                        {!!log.tool_output && isExpanded && (
                                          <pre style={{ 
                                            marginTop: '0.5rem', 
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                          }}>
                                            {log.tool_output.substring(0, 500)}
                                            {log.tool_output.length > 500 && '...'}
                                          </pre>
                                        )}
                                      </ActivityDetails>
                                      {!!log.tool_output && log.tool_output.length > 50 && (
                                        <ExpandToggle onClick={() => toggleLogExpanded(log.id)}>
                                          {isExpanded ? 'Show less' : 'Show more'}
                                        </ExpandToggle>
                                      )}
                                    </>
                                  )}
                                  
                                  <ActivityMeta>
                                    {log.cost_usd && (
                                      <MetaBadge $color="#10b981">
                                        {formatCost(log.cost_usd)}
                                      </MetaBadge>
                                    )}
                                    {(log.input_tokens || log.output_tokens) && (
                                      <MetaBadge>
                                        {((log.input_tokens || 0) + (log.output_tokens || 0)).toLocaleString()} tokens
                                      </MetaBadge>
                                    )}
                                  </ActivityMeta>
                                </ActivityContent>
                              </ActivityItem>
                            );
                          })}
                        </ActivityList>
                      </ActivityFeedContainer>
                    )}

                    {/* File Changes */}
                    {activeTab === 'files' && (
                      <FileChangesContainer>
                        <FileChangesHeader>
                          <FileChangesTitle>File Changes</FileChangesTitle>
                          <FileCount>{modifiedFiles.length} files</FileCount>
                        </FileChangesHeader>
                        <FileChangesList>
                          {fileOperations.length > 0 ? (
                            fileOperations
                              .filter(f => f.type !== 'read')
                              .map((file, idx) => (
                                <FileChangeItem key={`${file.path}-${idx}`} $type={file.type}>
                                  <FileStatusIcon $type={file.type}>
                                    {getFileIcon(file.type)}
                                  </FileStatusIcon>
                                  <FileName>{file.path}</FileName>
                                  <FileActionLabel $type={file.type}>
                                    {file.type}
                                  </FileActionLabel>
                                </FileChangeItem>
                              ))
                          ) : (
                            modifiedFiles.map((file, idx) => (
                              <FileChangeItem key={idx} $type="edit">
                                <FileStatusIcon $type="edit">✏️</FileStatusIcon>
                                <FileName>{file}</FileName>
                                <FileActionLabel $type="edit">modified</FileActionLabel>
                              </FileChangeItem>
                            ))
                          )}
                        </FileChangesList>
                      </FileChangesContainer>
                    )}
                  </>
                )}

                {/* Legacy file display fallback */}
                {agentLogs.length === 0 && operation.result?.files && operation.result.files.length > 0 && (
                  <FilesList>
                    {operation.result.files.map((file, idx) => (
                      <FileItem key={idx}>
                        <span style={{ color: '#22c55e' }}>+</span>
                        {file}
                      </FileItem>
                    ))}
                  </FilesList>
                )}
              </OperationPanelBody>
            </EnhancedOperationPanel>
          )}

          {/* Questions Section */}
          {questions.length > 0 && (
            <QuestionsSection>
              <QuestionTitle>
                <span>❓</span>
                Claude needs more information
              </QuestionTitle>
              
              {questions.map((question) => (
                <QuestionItem key={question.id}>
                  <QuestionText>{question.text}</QuestionText>
                  
                  <AnswerInput
                    value={answerInputs[question.id] || ''}
                    onChange={(e) => setAnswerInputs(prev => ({
                      ...prev,
                      [question.id]: e.target.value
                    }))}
                    placeholder="Type your answer..."
                    disabled={answeringId === question.id}
                  />
                  
                  <QuestionActions>
                    <AnswerButton
                      onClick={() => handleAnswerQuestion(question.id)}
                      disabled={!answerInputs[question.id]?.trim() || answeringId === question.id}
                    >
                      {answeringId === question.id ? 'Submitting...' : 'Submit Answer'}
                    </AnswerButton>
                    <SkipButton
                      onClick={() => handleSkipQuestion(question.id)}
                      disabled={answeringId === question.id}
                    >
                      Skip
                    </SkipButton>
                  </QuestionActions>
                </QuestionItem>
              ))}
            </QuestionsSection>
          )}

          {/* Form Fields - only show when not processing */}
          {!operationId && (
            <>
              {selectedIntent === 'custom' && (
                <Field>
                  <Label>Custom Intent Name</Label>
                  <Input
                    type="text"
                    value={customIntent}
                    onChange={e => setCustomIntent(e.target.value)}
                    placeholder="e.g., documentation, testing, refactoring"
                  />
                </Field>
              )}

              <Field>
                <Label>Additional Instructions (optional)</Label>
                <TextArea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Add specific instructions for this workflow run..."
                />
              </Field>

            </>
          )}

          {result && (
            <StatusMessage $type={result.type}>
              {result.message}
            </StatusMessage>
          )}

          <ButtonRow>
            {!operationId ? (
              <TriggerButton
                type="button"
                onClick={handleTrigger}
                disabled={!canTrigger || isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Triggering...
                  </>
                ) : (
                  <>Trigger Workflow</>
                )}
              </TriggerButton>
            ) : (
              isLoading && (
                <TriggerButton type="button" disabled>
                  <Spinner />
                  Processing...
                </TriggerButton>
              )
            )}
            <CancelButton type="button" onClick={handleCancel} disabled={isLoading && !questions.length}>
              {operationId ? 'Close' : 'Cancel'}
            </CancelButton>
          </ButtonRow>
        </ExpandedSection>
      )}
    </Container>
  );
};

export default WorkflowActions;
