import { supabaseClientMock } from '../../../__mocks__/supabaseClientMock';
import { vi, describe, it, expect, beforeEach } from "vitest";

window = Object.create(window);
Object.defineProperty(window, 'location', {
    value: {
        href: "http://test.com",
        protocol: "http:",
        host: "test.com"
    },
    writable: true // possibility to override
});

let mockCreateClient = vi.fn().mockReturnValue(supabaseClientMock);
vi.mock("@supabase/supabase-js", () => ({
    createClient: (...args:any[]) => {
        return mockCreateClient(args)
    }
}));

const originalViteEnv = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

describe('supabase client', () => {
    beforeEach(() => {
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY = originalViteEnv;
    })

    it('supabase is returned', async () => {
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY = "averyspecialtestkey";
        vi.unmock('../client');
        const { supabase } = await import('../client');

        expect(supabase).toEqual(supabaseClientMock);
    })

    it('supabase called with baseUrl and key', async () => {
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY = "averyspecialtestkey";
        vi.unmock('../client');
        const { supabase } = await import('../client');

        expect(mockCreateClient).toHaveBeenCalledWith([ 'http://test.com', 'averyspecialtestkey' ]);
    })
})
