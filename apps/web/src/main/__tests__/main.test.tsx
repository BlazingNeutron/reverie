import { describe, expect, it, vi } from 'vitest';

// Capture the routes passed to createBrowserRouter
var capturedRoutes: any = null;

// Mock react-dom/client.createRoot to prevent actual rendering
vi.mock('react-dom/client', () => ({
  default: { createRoot: vi.fn(() => ({ render: vi.fn() })) },
}));

// Mock react-router pieces used in main.tsx
vi.mock('react-router', () => {
  return {
    createBrowserRouter: (routes: any) => {
      capturedRoutes = routes;
      return {};
    },
    Navigate: (props: any) => null,
    Outlet: (props: any) => null,
    RouterProvider: (props: any) => null,
  };
});

describe('main.tsx routing', () => {
  it('registers routes including /login or at least initializes app', async () => {
    // Importing main.tsx should call createBrowserRouter once (module side-effect)
    await import('../../main.tsx');
    // Ensure createRoot was called during module initialization
    const rd = await import('react-dom/client');
    expect((rd as any).default.createRoot).toHaveBeenCalled();
    // If capturedRoutes was set by the mocked createBrowserRouter, assert it contains login
    if (capturedRoutes) {
      const flat = JSON.stringify(capturedRoutes);
      expect(flat).toContain('login');
    }
  });

  it('the base url redirects to /login when no session', async () => {
    const rr = await import('react-router');
    const ac = await import('../../lib/auth/auth-context.tsx');

    // Mock useAuth to return no session and not loading
    vi.spyOn(ac, 'useAuth').mockReturnValue({ session: null, loading: false, user: null, signIn: vi.fn(), signOut: vi.fn() });

    // protected route will be called when rendering the base route
    const { ProtectedRoute } = await import('../../main.tsx');
    
    // Render the ProtectedRoute
    const result = ProtectedRoute();

    // It should return a Navigate component to /login
    expect(result).not.toBeNull();
    // Assert the element type and props rather than deep equality of created elements
    expect((result as any).type).toBe(rr.Navigate);
    expect((result as any).props).toMatchObject({ to: '/login', replace: true });
  });

  it('the ProtectedRoute shows nothing when loading', async () => {
    const ac = await import('../../lib/auth/auth-context.tsx');

    // Mock useAuth to return loading true
    vi.spyOn(ac, 'useAuth').mockReturnValue({ session: null, loading: true, user: null, signIn: vi.fn(), signOut: vi.fn() });

    const { ProtectedRoute } = await import('../../main.tsx');

    // Render the ProtectedRoute
    const result = ProtectedRoute();

    // It should return null when loading
    expect(result).toBeNull();
  });

  it('the base url returns outlet when session exists', async () => {
    const rr = await import('react-router');
    const ac = await import('../../lib/auth/auth-context.tsx');

    // Mock useAuth to return a session and not loading
    vi.spyOn(ac, 'useAuth').mockReturnValue({ session: { user: {
      id: '123'
    } }, loading: false, user: null, signIn: vi.fn(), signOut: vi.fn() });

    // protected route will be called when rendering the base route
    const { ProtectedRoute } = await import('../../main.tsx');
    
    // Render the ProtectedRoute
    const result = ProtectedRoute();

    // It should return a Navigate component to /login
    expect(result).not.toBeNull();
    // Assert the element type and props rather than deep equality of created elements
    expect((result as any).type).toBe(rr.Outlet);
  });
});
