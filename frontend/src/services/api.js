import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance (empty baseURL defaults to same-origin relative requests)
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || '',
    withCredentials: true, // CRITICAL: Send cookies with every request
});

// Request interceptor to add token to headers
api.interceptors.request.use(
    (config) => {
        // Get user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));

        // If user exists and has token, add to Authorization header
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration & subscription paywall
api.interceptors.response.use(
    (response) => {
        // If response is successful, just return it
        return response;
    },
    (error) => {
        // Check if error is due to authentication (401 Unauthorized)
        if (error.response && error.response.status === 401) {
            // If in an active spoof/impersonation session, suppress abrupt session teardown
            if (sessionStorage.getItem('impersonation_active') === 'true') {
                console.warn('[Impersonation] 401 response suppressed to preserve active spoof session');
                return Promise.reject(error);
            }

            // Clear all user data from localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('returnDraft');

            if (window.location.pathname !== '/login') {
                // Show professional notification
                toast.error('Your session has expired. Please log in again to continue.', {
                    position: 'top-center',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Redirect to login page after a brief delay
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            }
        }

        // Check if error is due to Subscription Expired or Account Suspended (403 Forbidden)
        if (
            error.response &&
            error.response.status === 403 &&
            (error.response.data?.subscriptionExpired || error.response.data?.accountSuspended)
        ) {
            if (window.location.pathname !== '/subscription-expired') {
                toast.warn(
                    error.response.data?.message || 'Your subscription has expired. Please renew your plan.',
                    {
                        position: 'top-center',
                        autoClose: 6000,
                    }
                );

                setTimeout(() => {
                    window.location.href = '/subscription-expired';
                }, 800);
            }
        }

        // Return the error for other cases
        return Promise.reject(error);
    }
);

export default api;
