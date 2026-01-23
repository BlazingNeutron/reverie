import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import Index from '../index';
import ThemeProvider from '../../components/ThemeProvider';

vi.mock('../../lib/auth/auth-context', () => ({
  useAuth: () => ({
    session: { user: { id: 'u-123', email: '<EMAIL>' } }
  }),
}));

describe('Index component', () => {
  it('Loads quill editor within index component', async () => {
    const { container } = render(
      <MemoryRouter>
        <ThemeProvider>
          <Index />
        </ThemeProvider>
      </MemoryRouter>
    );

    const editorElement = container.querySelector('.ql-editor');
    expect(editorElement).toBeInTheDocument();
  });
});
