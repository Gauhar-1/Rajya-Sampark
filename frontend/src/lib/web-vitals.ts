import { Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
    // In production, send to your analytics endpoint
    if (process.env.NODE_ENV === 'production') {
        const body = JSON.stringify({
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
        });

        // Example: Send to your API
        // navigator.sendBeacon('/api/analytics', body);

        // Or use a service like Google Analytics, Vercel Analytics, etc.
        console.log('Web Vital:', metric.name, metric.value);
    } else {
        // In development, just log to console
        console.log('Web Vital:', metric.name, metric.value, metric.rating);
    }
}

export function reportWebVitals(metric: Metric) {
    sendToAnalytics(metric);
}
