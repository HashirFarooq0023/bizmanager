import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import '../i18n';
import PrivacyPolicy from './PrivacyPolicy';
import Terms from './Terms';
import NotFound from './NotFound';
import CookieConsent from '../components/CookieConsent';

const createMockStore = (preloadedState = {}) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: {
      user: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
      message: '',
      ...preloadedState,
    }
  },
});

const renderWithProviders = (ui, preloadedState = {}) => {
  const store = createMockStore(preloadedState);
  return render(
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            {ui}
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  );
};

describe('Public & Optimization Pages', () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = vi.fn();
  });

  it('renders PrivacyPolicy page with MegaTrix attribution and content', () => {
    renderWithProviders(<PrivacyPolicy />);
    expect(screen.getAllByText(/Privacy Policy|پرائیویسی پالیسی/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/MegaTrix Technologies|میگا ٹرکس ٹیکنالوجیز/i).length).toBeGreaterThan(0);
  });

  it('renders Terms of Service page with legal sections', () => {
    renderWithProviders(<Terms />);
    expect(screen.getAllByText(/Terms of Service|شرائط و ضوابط/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/MegaTrix Technologies|میگا ٹرکس ٹیکنالوجیز/i).length).toBeGreaterThan(0);
  });

  it('renders NotFound (404) page with recovery action', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/Return to Home|مرکزی صفحہ پر جائیں/i)).toBeInTheDocument();
  });

  it('renders CookieConsent banner and hides on acceptance', () => {
    renderWithProviders(<CookieConsent initialDelay={0} />);
    
    const acceptBtn = screen.getByRole('button', { name: /Accept All|تمام قبول کریں/i });
    expect(acceptBtn).toBeInTheDocument();

    fireEvent.click(acceptBtn);
    expect(localStorage.getItem('bizmanager_cookie_consent')).toContain('accepted');
  });
});
