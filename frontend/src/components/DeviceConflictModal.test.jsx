import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import { LanguageProvider } from '../contexts/LanguageContext';
import DeviceConflictModal from './DeviceConflictModal';

const createMockStore = (preloadedState) =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });

describe('DeviceConflictModal Component', () => {
  it('renders modal with warning message and action buttons', () => {
    const store = createMockStore({
      auth: {
        deviceConflict: true,
        conflictProvider: 'local',
        pendingGoogleCredential: null,
      },
    });

    render(
      <Provider store={store}>
        <LanguageProvider>
          <DeviceConflictModal
            email="test@example.com"
            password="Password123!"
            onClose={() => {}}
          />
        </LanguageProvider>
      </Provider>
    );

    expect(screen.getByText(/Device Already Logged In/i)).toBeInTheDocument();
    expect(screen.getByText(/Log out previous device/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const store = createMockStore({
      auth: {
        deviceConflict: true,
        conflictProvider: 'google',
        pendingGoogleCredential: 'sample_google_jwt_token',
      },
    });

    const onCloseMock = vi.fn();

    render(
      <Provider store={store}>
        <LanguageProvider>
          <DeviceConflictModal
            email=""
            password=""
            onClose={onCloseMock}
          />
        </LanguageProvider>
      </Provider>
    );

    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
