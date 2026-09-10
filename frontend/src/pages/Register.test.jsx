import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import '../i18n';
import Register from './Register';

const createMockStore = (preloadedState) =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });

describe('Register Component', () => {
  it('renders register form with Google sign up button', () => {
    const store = createMockStore({
      auth: {
        user: null,
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: '',
      },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <LanguageProvider>
            <BrowserRouter>
              <Register />
            </BrowserRouter>
          </LanguageProvider>
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Google/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Free Account|نیا اکاؤنٹ بنائیں/i })).toBeInTheDocument();
  });
});
