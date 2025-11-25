// Centralized configuration with type safety and validation

interface Config {
    apiUrl: string;
    cloudinary: {
        cloudName: string;
        apiKey: string;
    };
    firebase?: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
    };
    isDevelopment: boolean;
    isProduction: boolean;
}

function getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (!value && !defaultValue) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || defaultValue || '';
}

export const config: Config = {
    apiUrl: getEnvVar('NEXT_PUBLIC_NEXT_API_URL'),
    cloudinary: {
        cloudName: getEnvVar('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', ''),
        apiKey: getEnvVar('NEXT_PUBLIC_CLOUDINARY_API_KEY', ''),
    },
    firebase: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? {
        apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
        authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
        projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
        storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
        appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
    } : undefined,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
};

// Validate critical config on startup
if (typeof window === 'undefined') {
    console.log('✓ Configuration loaded successfully');
}
