import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from '../authStore';

type AnyObj = Record<string, any>;

describe('useAuthStore', () => {
  const initialState = {
    user: null,
    session: null,
    loading: true,
  } as AnyObj;

  beforeEach(() => {
    useAuthStore.setState(initialState);
  });

  afterEach(() => {
    useAuthStore.setState(initialState);
  });

  it('initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.loading).toBe(true);
  });

  it('setAuth is called', () => {
    const testSession = { user: { id: 'userId1', email: 'test1@example.com' } } as any;
    useAuthStore.getState().setAuth(testSession);

    const state = useAuthStore.getState();
    expect(state.session).toBe(testSession);
    expect(state.user).toEqual(testSession.user);
    expect(state.loading).toBe(false);
  });

  it('setAuth(null) clears user and session', () => {
    useAuthStore.getState().setAuth(null);
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('setLoading updates the loading flag', () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().loading).toBe(false);

    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().loading).toBe(true);
  });

  it('clearAuth clears auth and sets loading false', () => {
    const testSession = { user: { id: 'userId2' } } as any;
    useAuthStore.getState().setAuth(testSession);

    expect(useAuthStore.getState().user).not.toBeNull();

    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.loading).toBe(false);
  });
});
