import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock useAuth from the auth context so we can assert signIn was called
vi.mock('../../lib/auth/auth-context', () => ({
  useAuth: () => ({
    session: { user: { id: 'u-123', email: '<EMAIL>' } }
  }),
}));

import { MemoryRouter } from 'react-router';
import Index from '../index';

describe('Index component', () => {
  it('Loads quill editor within index component', async () => {
    const { container } = render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );

    const editorElement = container.querySelector('.ql-editor');
    expect(editorElement).toBeInTheDocument();
  });
});
