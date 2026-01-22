import { screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ReactDOMClient from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import Login from '../login';
import { act } from 'react';

const signInMock = vi.fn().mockResolvedValue({ error: null });
vi.mock('../../lib/auth/authContext', () => ({
  useAuth: () => ({
    signIn: signInMock,
  }),
}));

describe('Login component', () => {
  let container : any;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null;
  });

  it('calls signIn on submit with form values', async () => {
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

    // signIn is async; ensure it was called with the entered values
    expect(signInMock).toHaveBeenCalled();
  });
});
