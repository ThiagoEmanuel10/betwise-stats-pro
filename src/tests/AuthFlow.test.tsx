
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from '../pages/Auth';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

// Mock router navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Authentication Flow', () => {
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

  it('completes registration flow successfully', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: {
        user: {
          id: 'new-user-id',
          email: 'newuser@example.com',
          app_metadata: {},
          user_metadata: { full_name: 'New User', username: 'newuser' },
          aud: 'authenticated',
          created_at: '',
          updated_at: '',
          phone: '',
          confirmed_at: '',
          last_sign_in_at: '',
          role: '',
          identities: []
        },
        session: null
      },
      error: null
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Auth />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Switch to register form
    fireEvent.click(screen.getByText(/não tem uma conta/i));
    
    await waitFor(() => {
      expect(screen.getByText(/criar conta/i)).toBeInTheDocument();
    });

    // Fill registration form
    fireEvent.change(screen.getByPlaceholderText(/@username/i), {
      target: { value: 'newuser' },
    });
    
    fireEvent.change(screen.getByPlaceholderText(/seu nome/i), {
      target: { value: 'New User' },
    });
    
    fireEvent.change(screen.getByPlaceholderText(/seu@email.com/i), {
      target: { value: 'newuser@example.com' },
    });
    
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], {
      target: { value: 'Password123' },
    });

    // Submit registration form
    fireEvent.click(screen.getByText(/criar conta/i));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'Password123',
        options: {
          data: {
            full_name: 'New User',
            username: 'newuser',
          },
        },
      });
    });
  });

  it('completes login flow successfully', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        user: {
          id: 'user-id',
          email: 'user@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '',
          updated_at: '',
          phone: '',
          confirmed_at: '',
          last_sign_in_at: '',
          role: '',
          identities: []
        },
        session: {
          access_token: 'token',
          refresh_token: 'refresh',
          expires_at: 999999999,
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            id: 'user-id',
            email: 'user@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '',
            updated_at: '',
            phone: '',
            confirmed_at: '',
            last_sign_in_at: '',
            role: '',
            identities: []
          }
        }
      },
      error: null
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Auth />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Fill login form
    fireEvent.change(screen.getByPlaceholderText(/seu@email.com/i), {
      target: { value: 'user@example.com' },
    });
    
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'Password123' },
    });

    // Submit login form
    fireEvent.click(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });
});
