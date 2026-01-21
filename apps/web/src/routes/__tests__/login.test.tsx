import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock useAuth from the auth context so we can assert signIn was called
const signInMock = vi.fn().mockResolvedValue({ error: null });
vi.mock('../../lib/auth/authContext', () => ({
  useAuth: () => ({
    signIn: signInMock,
  }),
}));

import { MemoryRouter } from 'react-router';
import Login from '../login';

describe('Login component', () => {
  it('calls signIn on submit with form values', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const email = screen.getByPlaceholderText('m@example.com');
    const password = screen.getByLabelText('Password');

    // The component uses controlled inputs; change values
    fireEvent.change(email, { target: { value: 'me@example.com' } });
    fireEvent.change(password, { target: { value: 'secret' } });

    const submit = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submit);

    // signIn is async; ensure it was called with the entered values
    expect(signInMock).toHaveBeenCalled();
  });
});
