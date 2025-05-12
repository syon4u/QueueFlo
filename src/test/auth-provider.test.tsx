
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import * as reactTesting from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Extract the needed utilities from the testing library
const { screen, waitFor } = reactTesting as any;

// Mock component to test the hook
const AuthConsumer = () => {
  const { user, isLoading, role, signInWithEmail } = useAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="role">{role || 'null'}</div>
      <button data-testid="login-button" onClick={() => signInWithEmail('test@example.com', 'password')}>Login</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state and no user', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      </BrowserRouter>
    );

    // Initial state should be loading
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // After fetching session, it should not be loading
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // No user should be present
    expect(screen.getByTestId('user').textContent).toBe('null');
    
    // Default role should be null
    expect(screen.getByTestId('role').textContent).toBe('null');
  });

  it('should fetch user role when session is available', async () => {
    // Mock session response
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };
    const mockSession = { user: mockUser };
    
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: mockSession as any },
      error: null,
    } as any);
    
    // Mock role response
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: 'customer',
      error: null,
    } as any);

    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      </BrowserRouter>
    );

    // Should eventually have user
    await waitFor(() => {
      const userContent = screen.getByTestId('user').textContent;
      expect(userContent).toContain('test@example.com');
    });
    
    // Should fetch role
    await waitFor(() => {
      expect(screen.getByTestId('role').textContent).toBe('customer');
    });
  });

  it('should call signInWithPassword when signInWithEmail is called', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: {},
      error: null,
    } as any);

    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      </BrowserRouter>
    );

    // Click login button
    screen.getByTestId('login-button').click();

    // Verify signInWithPassword was called with correct params
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });
  });
});
