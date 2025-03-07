
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Predictions from '../pages/Predictions';
import * as useMatchesHook from '../hooks/useMatches';

// Mock the hooks and components
vi.mock('@/hooks/useMatches', () => ({
  useMatches: vi.fn(),
  LEAGUES: {
    '39': 'Premier League',
    '71': 'Brasileirão Série A',
  }
}));

vi.mock('@/components/PredictionsHeader', () => ({
  PredictionsHeader: ({ filters, onFiltersChange, leagues }: any) => (
    <div data-testid="predictions-header">
      <span>Mocked Header</span>
      <button onClick={() => onFiltersChange({ ...filters, search: 'test' })}>
        Change Filter
      </button>
    </div>
  ),
}));

vi.mock('@/components/MatchesList', () => ({
  MatchesList: ({ matches, isLoading, favoriteMatches, onToggleFavorite }: any) => (
    <div data-testid="matches-list">
      <span>Matches Count: {matches?.length || 0}</span>
      <span>Loading: {isLoading ? 'true' : 'false'}</span>
      <span>Favorites: {favoriteMatches?.length || 0}</span>
      {matches?.map((match: any) => (
        <div key={match.fixture.id} data-testid={`match-${match.fixture.id}`}>
          <button onClick={() => onToggleFavorite(match)}>Toggle</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/lib/analytics', () => ({
  trackPageView: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('Predictions Component', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    vi.mocked(useMatchesHook.useMatches).mockReturnValue({
      matches: [],
      isLoading: true,
      favoriteMatches: [],
      toggleFavorite: vi.fn(),
      leagues: { '39': 'Premier League' }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Predictions />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByTestId('predictions-header')).toBeInTheDocument();
    expect(screen.getByTestId('matches-list')).toBeInTheDocument();
    expect(screen.getByText('Loading: true')).toBeInTheDocument();
  });

  it('renders matches when data is loaded', async () => {
    const mockMatches = [
      {
        fixture: { id: 1 },
        teams: { home: { name: 'Team A' }, away: { name: 'Team B' } },
        league: { id: 39 }
      },
      {
        fixture: { id: 2 },
        teams: { home: { name: 'Team C' }, away: { name: 'Team D' } },
        league: { id: 39 }
      }
    ];

    vi.mocked(useMatchesHook.useMatches).mockReturnValue({
      matches: mockMatches,
      isLoading: false,
      favoriteMatches: ['1'],
      toggleFavorite: vi.fn(),
      leagues: { '39': 'Premier League' }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Predictions />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Matches Count: 2')).toBeInTheDocument();
      expect(screen.getByText('Loading: false')).toBeInTheDocument();
      expect(screen.getByText('Favorites: 1')).toBeInTheDocument();
    });
  });
});
