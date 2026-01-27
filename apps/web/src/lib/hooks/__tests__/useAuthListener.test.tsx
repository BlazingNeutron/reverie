import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, waitFor, cleanup, render } from '@testing-library/react';
import { supabaseClientMock } from "../../../__mocks__/supabaseClientMock"
import ReactDOMClient from 'react-dom/client';

const mockSetAuth = vi.fn();
const mockClearAuth = vi.fn();
vi.mock('../../stores/authStore', () => ({
    useAuthStore: (selector: any) => selector({ setAuth: mockSetAuth, clearAuth: mockClearAuth }),
}));

const { useAuthListener } = await import('../useAuthListener');

function TestComponent() {
    useAuthListener();
    return null;
}

describe('useAuthListener', () => {
    let container: any;
    let capturedOnAuthCb: any = null;
    const unsubscribeSpy = vi.fn();

    beforeEach(() => {
        supabaseClientMock.auth.getSession = vi.fn().mockReturnValue({ then: () => { data: { session: { user: { id: 'test-user' } } } } });
        supabaseClientMock.auth.onAuthStateChange = (cb: any) => {
            capturedOnAuthCb = cb;
            return { data: { subscription: { unsubscribe: unsubscribeSpy } } };
        };

        container = document.createElement('div');
        document.body.appendChild(container);
        vi.clearAllMocks();
        vi.resetModules();
    });

    afterEach(() => {
        document.body.removeChild(container);
        container = null;
        cleanup();
    });

    it('calls getSession and sets auth', async () => {
        renderAndSignIn({ user: { id: 'new' } });
        await waitFor(() => {
            expect(supabaseClientMock.auth.getSession).toHaveBeenCalled();
            expect(mockSetAuth).toHaveBeenCalled();
        });
    });

    it('calls clearAuth and sets auth from initial session', async () => {
        renderAndSignIn(null);
        await waitFor(() => {
            expect(supabaseClientMock.auth.getSession).toHaveBeenCalled();
            expect(mockClearAuth).toHaveBeenCalled();
        });
    });

    it('unsubscribes on unmount', async () => {
        const { unmount } = render(<TestComponent />);
        expect(capturedOnAuthCb).toBeTruthy();

        unmount();
        expect(unsubscribeSpy).toHaveBeenCalled()
    });

    it('unmount and gets rerendered', async () => {
        let resolvePromise: (value: any) => void;
        const pendingPromise = new Promise((res) => (resolvePromise = res));

        supabaseClientMock.auth.getSession = vi.fn().mockReturnValue(pendingPromise as any);

        const { unmount } = render(<TestComponent />);

        unmount();

        act(() => {
            resolvePromise!({ data: { session: { user: { id: 'xyz' } } } });
        });

        await Promise.resolve();

        expect(mockSetAuth).not.toHaveBeenCalled();
    });

    async function renderAndSignIn(session: any) {
        await act(async () => {
            ReactDOMClient.createRoot(container).render(<TestComponent />);
        })
        capturedOnAuthCb('TEST_SIGNIN', session);
    }
});
