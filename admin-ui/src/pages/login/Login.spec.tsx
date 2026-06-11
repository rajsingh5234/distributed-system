import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';

describe('Login Page', () => {
    it('should render with required fields', () => {
        render(<Login />);

        expect(screen.getByText('Sign in')).toBeInTheDocument();
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Remember me' })).toBeInTheDocument();
        expect(screen.getByText('Forgot password')).toBeInTheDocument();
    });

    it('should display validation error if username is empty on submit', async () => {
        const user = userEvent.setup();
        render(<Login />);

        await user.click(screen.getByRole('button', { name: 'Log in' }));

        expect(await screen.findByText('Please input your Username')).toBeInTheDocument();
    });

    it('should display validation error if password is empty on submit', async () => {
        const user = userEvent.setup();
        render(<Login />);

        await user.click(screen.getByRole('button', { name: 'Log in' }));

        expect(await screen.findByText('Please input your password')).toBeInTheDocument();
    });

    it('should display validation error if email is not valid', async () => {
        const user = userEvent.setup();
        render(<Login />);

        await user.type(screen.getByLabelText('Username'), 'invalidemail');
        await user.click(screen.getByRole('button', { name: 'Log in' }));

        expect(await screen.findByText('Email is not valid')).toBeInTheDocument();
    });

    it('should not display validation errors for valid inputs', async () => {
        const user = userEvent.setup();
        render(<Login />);

        await user.type(screen.getByLabelText('Username'), 'test@example.com');
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.click(screen.getByRole('button', { name: 'Log in' }));

        expect(screen.queryByText('Please input your Username')).not.toBeInTheDocument();
        expect(screen.queryByText('Please input your password')).not.toBeInTheDocument();
        expect(screen.queryByText('Email is not valid')).not.toBeInTheDocument();
    });
});
