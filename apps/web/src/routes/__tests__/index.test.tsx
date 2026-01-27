import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import Index from '../index';
import ThemeProvider from '../../components/ThemeProvider';
import { act } from 'react';
import ReactDOMClient from 'react-dom/client';

vi.mock('../../lib/auth/authContext', () => ({
  useAuth: () => ({
    session: { user: { id: 'u-123', email: '<EMAIL>' } }
  }),
}));

describe('Index component', () => {
  let container: any;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('Loads quill editor within index component', async () => {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(
        <MemoryRouter>
          <ThemeProvider>
            <Index />
          </ThemeProvider>
        </MemoryRouter>
      );
    })

    const editorElement = container.querySelector('.ql-editor');
    expect(editorElement).toBeInTheDocument();
  });
});
