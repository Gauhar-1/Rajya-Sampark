import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_NEXT_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
});

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

// Generate request key for deduplication
function getRequestKey(config: AxiosRequestConfig): string {
    return `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
}

api.interceptors.request.use(
    (config) => {
        // Attach auth token
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        // Request deduplication for GET requests
        if (config.method === 'get') {
            const requestKey = getRequestKey(config);
            const pendingRequest = pendingRequests.get(requestKey);

            if (pendingRequest) {
                // Return the pending request instead of making a new one
                return Promise.reject({ __CANCEL__: true, pendingRequest });
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        // Clear from pending requests
        if (response.config.method === 'get') {
            const requestKey = getRequestKey(response.config);
            pendingRequests.delete(requestKey);
        }
        return response;
    },
    async (error: AxiosError) => {
        // Handle deduplication
        if (error && (error as any).__CANCEL__) {
            return (error as any).pendingRequest;
        }

        const config = error.config as AxiosRequestConfig & { _retry?: number };

        // Retry logic with exponential backoff
        if (config && error.response?.status && [408, 429, 500, 502, 503, 504].includes(error.response.status)) {
            config._retry = config._retry || 0;

            if (config._retry < 3) {
                config._retry += 1;
                const delay = Math.min(1000 * Math.pow(2, config._retry), 10000); // Max 10s

                await new Promise(resolve => setTimeout(resolve, delay));
                return api(config);
            }
        }

        // Handle global errors
        if (error.response && error.response.status === 401) {
            // Optional: Redirect to login or clear token
            if (typeof window !== 'undefined') {
                // localStorage.removeItem('token');
                // window.location.href = '/login';
            }
        }

        // Clear from pending requests on error
        if (config && config.method === 'get') {
            const requestKey = getRequestKey(config);
            pendingRequests.delete(requestKey);
        }

        return Promise.reject(error);
    }
);

export default api;
