import { describe, vi, it, expect } from "vitest";
import { useAuthActions } from "../useAuthActions";
import { supabaseClientMock } from "../../../__mocks__/supabaseClientMock";

let mockUseLocation = vi.fn().mockReturnValue({
    state: {
        from: {
            pathname: "/"
        }
    },
    pathname: "/"
});
vi.mock('react-router', () => {
    return {
        useNavigate: vi.fn().mockReturnValue(vi.fn()),
        useLocation: () => mockUseLocation
    }
});

describe('useAuthActions', () => {
    it('call sign in', async () => {
        const { signIn } = useAuthActions()
        const response = await signIn("test@example.com", "testpassword1234");
        expect(supabaseClientMock.auth.signInWithPassword).toHaveBeenCalled();
        expect(supabaseClientMock.auth.signInWithPassword.mock.calls).toEqual([
            [
                {
                    "email": "test@example.com",
                    "password": "testpassword1234",
                },
            ],
        ]);
        expect(response).toEqual({ error: null })
    })

    it('sign in auth error', async () => {
        const { signIn } = useAuthActions()
        supabaseClientMock.auth.signInWithPassword = vi.fn().mockReturnValue({ error: new Error("Test Error") })
        const response = await signIn("test@example.com", "testpassword1234");
        expect(response.error?.message).toBe("Test Error");
    })

    it('sign in from with redirect', async () => {
        mockUseLocation = vi.fn().mockReturnValue({
            state: {
                from: {
                    pathname: "/"
                }
            },
            pathname: "/login"
        });
        const { signIn } = useAuthActions()
        supabaseClientMock.auth.signInWithPassword = vi.fn().mockReturnValue({ error: new Error("Test Error") })
        const response = await signIn("test@example.com", "testpassword1234");
        expect(response.error?.message).toBe("Test Error");
    })

    it('call sign in', async () => {
        const { signOut } = useAuthActions()
        await signOut();
        expect(supabaseClientMock.auth.signOut).toHaveBeenCalled();
    })
})