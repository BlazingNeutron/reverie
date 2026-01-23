import { screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ReactDOMClient from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import Login from '../login';
import { act } from 'react';

let signInMock = vi.fn().mockResolvedValue({ error: null });
vi.mock('../../lib/auth/authContext', () => ({
  useAuth: () => ({
    signIn: () => signInMock(),
  }),
}));

describe('Login component', () => {
  let container : any;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    signInMock = vi.fn().mockResolvedValue({ error: null });
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('calls signIn on submit with form values', async () => {
    await attemptSignIn();

    expect(signInMock).toHaveBeenCalled();
  });

  it('Error message is relayed to user', async () => {
    signInMock = vi.fn().mockResolvedValue({ error: new Error("Test error") });
    await attemptSignIn();
    
    expect(container.querySelector('.text-red-500').textContent).toBe("Test error");
  });

  it('Unknown error occures', async () => {
    signInMock = vi.fn().mockResolvedValue({ error: "Something bad" });
    await attemptSignIn();
    
    expect(container.querySelector('.text-red-500').textContent).toBe("An error occurred");
  });

  async function attemptSignIn() {
    await act(async () => {
      ReactDOMClient.createRoot(container).render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );
    });
    const email = screen.getByPlaceholderText('m@example.com');
    const password = screen.getByLabelText('Password');

    await act(async () => {
      fireEvent.change(email, { target: { value: 'me@example.com' } });
      fireEvent.change(password, { target: { value: 'secret' } });
    });

    const submit = screen.getByRole('button', { name: /login/i });
    await act(async () => {
      fireEvent.click(submit);
    });
  }
});

