
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PredictionsHeader } from '@/components/PredictionsHeader';

// Mock the i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() }
  })
}));

// Mock the child components
vi.mock('@/components/AdvancedFilters', () => ({
  default: ({ onFilterChange }: any) => (
    <div data-testid="advanced-filters">
      <button onClick={() => onFilterChange({ sortBy: 'probability' })}>
        Sort by Probability
      </button>
    </div>
  ),
}));

describe('PredictionsHeader Component', () => {
  const defaultProps = {
    filters: {
      search: '',
      onlyLive: false,
      sortBy: 'date' as const // Type assertion to make TypeScript happy
    },
    onFiltersChange: vi.fn(),
    leagues: { 
      '39': 'Premier League',
      '71': 'Brasileirão Série A'
    }
  };

  it('renders correctly with default props', () => {
    render(
      <BrowserRouter>
        <PredictionsHeader {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/predictions.search/i)).toBeInTheDocument();
    expect(screen.getByText(/predictions.onlyLive/i)).toBeInTheDocument();
    expect(screen.getByTestId('advanced-filters')).toBeInTheDocument();
  });

  it('calls onFiltersChange when search input changes', () => {
    render(
      <BrowserRouter>
        <PredictionsHeader {...defaultProps} />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/predictions.search/i);
    fireEvent.change(searchInput, { target: { value: 'Barcelona' } });

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...defaultProps.filters,
      search: 'Barcelona'
    });
  });

  it('calls onFiltersChange when live toggle is clicked', () => {
    render(
      <BrowserRouter>
        <PredictionsHeader {...defaultProps} />
      </BrowserRouter>
    );

    const liveToggle = screen.getByRole('checkbox', { name: /predictions.onlyLive/i });
    fireEvent.click(liveToggle);

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...defaultProps.filters,
      onlyLive: true
    });
  });

  it('calls onFiltersChange when advanced filter changes', () => {
    render(
      <BrowserRouter>
        <PredictionsHeader {...defaultProps} />
      </BrowserRouter>
    );

    const sortButton = screen.getByText(/sort by probability/i);
    fireEvent.click(sortButton);

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...defaultProps.filters,
      sortBy: 'probability'
    });
  });
});
