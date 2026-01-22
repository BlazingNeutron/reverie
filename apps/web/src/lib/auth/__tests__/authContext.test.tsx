import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import AuthProvider, { useAuth } from '../authContext';
import React, { act } from 'react';
import ReactDOMClient from 'react-dom/client';

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
  let container : any;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('provides user and finishes loading', async () => {
    mockGetSession = vi.fn().mockResolvedValue({ data: { session: { user: { id: 'u-123', email: 'a@b.com' } } } });
    await act(async () => {
      ReactDOMClient.createRoot(container).render(
        <MemoryRouter>
          <AuthProvider>
            <TestConsumer />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => expect(screen.getByText(/user:/i)).toBeInTheDocument());
    expect(screen.getByText('user:a@b.com')).toBeInTheDocument();
  });

  it('not signed in has null session', async () => {
    mockGetSession = vi.fn().mockResolvedValue({ data: { session: null } }),
    await act(async () => {
      ReactDOMClient.createRoot(container).render(
        <MemoryRouter>
          <AuthProvider>
            <TestConsumer />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => expect(screen.getByText(/user:/i)).toBeInTheDocument());
    expect(screen.getByText('user:none')).toBeInTheDocument();
  });

  it('signIn calls supabase auth', async () => {
    mockGetSession = vi.fn().mockResolvedValue({ data: { session: null } });
    mockSignInWithPassword = vi.fn().mockResolvedValue({ error: null, location: '/' });
    const Capture = () => {
      const auth = useAuth();
      React.useEffect(() => {
        // console.log("Signing in again")
        void auth.signIn('<EMAIL>', 'password');
      }, [auth]);
      return null;
    };

    await act(async () => {
      ReactDOMClient.createRoot(container).render(
        <MemoryRouter>
          <AuthProvider>
            <TestConsumer />
            <Capture />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => expect(mockSignInWithPassword).toHaveBeenCalled());
    expect(mockSignInWithPassword.mock.calls[0][0]).toEqual({ email: '<EMAIL>', password: 'password' });
  });

  it('signOut calls supabase auth signOut', async () => {
    mockGetSession = vi.fn().mockResolvedValue({ data: { session: { user: { id: 'u-123', email: 'a@b.com' } } } });
    const Capture = () => {
      const auth = useAuth();
      React.useEffect(() => {
        void auth.signOut();
      }, [auth]);
      return null;
    };

    await act(async () => {
      ReactDOMClient.createRoot(container).render(
        <MemoryRouter>
          <AuthProvider>
            <TestConsumer />
            <Capture />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
  });
});
