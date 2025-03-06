import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../pages/Auth';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
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

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Não tem uma conta? Cadastre-se')).toBeInTheDocument();
  });

  it('switches to signup form when clicking on signup link', async () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Não tem uma conta? Cadastre-se'));

    await waitFor(() => {
      expect(screen.getByText('Criar conta')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('@username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument();
    });
  });

  it('handles login submission', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ 
      data: { 
        user: {
          id: 'test-user-id',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          email: 'test@example.com',
          phone: '',
          confirmed_at: '2023-01-01T00:00:00Z',
          last_sign_in_at: '2023-01-01T00:00:00Z',
          role: 'authenticated',
          identities: []
        }, 
        session: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          expires_at: 999999999,
          token_type: 'bearer',
          user: {
            id: 'test-user-id',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            email: 'test@example.com',
            phone: '',
            confirmed_at: '2023-01-01T00:00:00Z',
            last_sign_in_at: '2023-01-01T00:00:00Z',
            role: 'authenticated',
            identities: []
          }
        }
      }, 
      error: null 
    });

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('Entrar'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  it('handles password reset request', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ data: {}, error: null });

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Esqueceu a senha?'));

    await waitFor(() => {
      expect(screen.getByText('Recuperar senha')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByText('Enviar email de recuperação'));

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(Object)
      );
    });
  });
});
