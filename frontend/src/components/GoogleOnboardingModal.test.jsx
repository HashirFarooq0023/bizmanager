import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import '../i18n';
import GoogleOnboardingModal from './GoogleOnboardingModal';

const createMockStore = (preloadedState) =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });

describe('GoogleOnboardingModal Component', () => {
  it('does not render when isOpen is false', () => {
    const store = createMockStore({
      auth: {
        user: { name: 'Google User', email: 'test@gmail.com', token: 'fake' },
        isNewGoogleUser: false,
      },
    });

    const { container } = render(
      <Provider store={store}>
        <ThemeProvider>
          <LanguageProvider>
            <BrowserRouter>
              <GoogleOnboardingModal isOpen={false} onComplete={() => {}} />
            </BrowserRouter>
          </LanguageProvider>
        </ThemeProvider>
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders store name input and mode selection when isOpen is true', () => {
    const store = createMockStore({
      auth: {
        user: { _id: '123', name: 'Google User', email: 'test@gmail.com', token: 'fake' },
        isNewGoogleUser: true,
      },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <LanguageProvider>
            <BrowserRouter>
              <GoogleOnboardingModal isOpen={true} onComplete={() => {}} />
            </BrowserRouter>
          </LanguageProvider>
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByPlaceholderText(/Madina Kiryana Store|مدینہ سپر اسٹور/i)).toBeInTheDocument();
    expect(screen.getByText(/Asan Mode|آسان موڈ/i)).toBeInTheDocument();
    expect(screen.getByText(/Pro Mode|پرو موڈ/i)).toBeInTheDocument();
  });

  it('shows validation error if store name is empty on submission', () => {
    const store = createMockStore({
      auth: {
        user: { _id: '123', name: 'Google User', email: 'test@gmail.com', token: 'fake', shopName: '' },
        isNewGoogleUser: true,
      },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <LanguageProvider>
            <BrowserRouter>
              <GoogleOnboardingModal isOpen={true} onComplete={() => {}} />
            </BrowserRouter>
          </LanguageProvider>
        </ThemeProvider>
      </Provider>
    );

    const input = screen.getByPlaceholderText(/Madina Kiryana Store|مدینہ سپر اسٹور/i);
    fireEvent.change(input, { target: { value: '' } });

    const form = input.closest('form');
    fireEvent.submit(form);

    expect(screen.getByText(/Please enter your store or business name|برائے مہربانی اپنی دکان یا کاروبار کا نام درج کریں/i)).toBeInTheDocument();
  });
});
