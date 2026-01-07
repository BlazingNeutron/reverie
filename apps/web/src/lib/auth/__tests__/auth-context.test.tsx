import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import AuthProvider, { useAuth } from '../auth-context';
import { useEffect } from 'react';

// Mock the supabase client used by AuthProvider
vi.mock('../../../lib/supabase/client', () => {
  return {
    supabase: {
      auth: {
        getSession: () => mockGetSession(),
        onAuthStateChange: vi.fn().mockImplementation((cb: any) => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signInWithPassword: (email: string, password: string) => mockSignInWithPassword(email, password),
        signOut: () => mockSignOut(),
      },
    },
  };
});

let mockGetSession = vi.fn();
let mockSignInWithPassword = vi.fn().mockResolvedValue({ error: null });
let mockSignOut = vi.fn();

const TestConsumer = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>loading</div>;
  return <div>user:{user ? user.email : 'none'}</div>;
};

describe('AuthProvider', () => {
  it('provides user and finishes loading', async () => {
    mockGetSession = vi.fn().mockResolvedValue({ data: { session: { user: { id: 'u-123', email: 'a@b.com' } } } });
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    // Initially loading renders
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText(/user:/i)).toBeInTheDocument());
    expect(screen.getByText('user:a@b.com')).toBeInTheDocument();
  });

  it('not signed in has null session', async () => {
    mockGetSession = vi.fn().mockResolvedValue({ data: { session: null } }),
      render(
        <MemoryRouter>
          <AuthProvider>
            <TestConsumer />
          </AuthProvider>
        </MemoryRouter>
      );

    // Initially loading renders
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText(/user:/i)).toBeInTheDocument());
    expect(screen.getByText('user:none')).toBeInTheDocument();
  });

  it('signIn calls supabase auth', async () => {
    mockGetSession = vi.fn().mockResolvedValue({ data: { session: null } });
    mockSignInWithPassword = vi.fn().mockResolvedValue({ error: null, location: '/' });

    const Capture = ({ onReady }: { onReady: () => void }) => {
      const auth = useAuth();
      auth.signIn('<EMAIL>', 'password');
      return null;
    };

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
          <Capture onReady={() => {
            expect(mockSignInWithPassword).toHaveBeenCalledWith('<EMAIL>', 'password');
          }} />
        </AuthProvider>
      </MemoryRouter>
    );
  });

  it('signOut calls supabase auth signOut', async () => {
    mockGetSession = vi.fn().mockResolvedValue({ data: { session: { user: { id: 'u-123', email: 'a@b.com' } } } });
    const Capture = ({ onReady }: { onReady: () => void }) => {
      const auth = useAuth();
      auth.signOut();
      return null;
    };

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
          <Capture onReady={() => {
            expect(mockSignOut).toHaveBeenCalled();
          }} />
        </AuthProvider>
      </MemoryRouter>
    );
  });
});
