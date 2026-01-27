import { ensureSession } from "../auth";
import { supabaseClientMock } from '../../../__mocks__/supabaseClientMock';
import { vi, describe, it, expect, afterEach } from "vitest";

describe('supabase auth', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    })

    it('Session is returned', async () => {
        const session = await ensureSession();
        expect(session).toBeTruthy();
    })

    it('No session found', async () => {
        vi.spyOn(supabaseClientMock.auth, 'getSession').mockResolvedValue({ data: { session: null } });
        const session = await ensureSession();
        expect(session).toBeNull();
    })
})
