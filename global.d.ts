// global.d.ts
// This declaration informs TypeScript about the 'posthog' object
// that is attached to the window by the PostHog snippet.

interface Window {
  posthog?: {
    capture: (eventName: string, properties?: Record<string, any>) => void;
    // Add other PostHog methods you use here, for example:
    // identify: (userId: string, properties?: Record<string, any>) => void;
    // reset: () => void;
    // get_distinct_id: () => string;
    // Opt out/in methods etc.
    [key: string]: any; // Allow other properties as PostHog object can be extensive
  };
}
