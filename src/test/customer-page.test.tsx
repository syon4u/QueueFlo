
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import * as reactTesting from '@testing-library/react';
import CustomerPage from '../pages/CustomerPage';
import { useAuth } from '../context/AuthContext';
import { QueueProvider } from '../context/QueueContext';

// Extract the needed utilities from the testing library
const { screen, fireEvent, waitFor } = reactTesting as any;

// Mock the auth context
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'mock-user-id' },
    role: 'customer',
  }),
}));

// Mock the useAppointments hook
vi.mock('../hooks/use-appointments', () => ({
  useAppointments: vi.fn().mockReturnValue({
    appointments: [],
    loading: false,
    error: null,
    userPosition: 0,
    estimatedWaitTime: 10,
    refreshAppointments: vi.fn(),
  }),
}));

describe('CustomerPage', () => {
  it('renders the CustomerPage component', () => {
    render(
      <QueueProvider>
        <CustomerPage />
      </QueueProvider>
    );

    expect(screen.getByText(/queue status/i)).toBeInTheDocument();
  });

  it('displays the user role', () => {
    render(
      <QueueProvider>
        <CustomerPage />
      </QueueProvider>
    );

    expect(screen.getByText(/role: customer/i)).toBeInTheDocument();
  });
});
