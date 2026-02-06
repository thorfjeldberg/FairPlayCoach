export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notification');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const sendNotification = async (title: string, body: string) => {
    try {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
            return;
        }

        const options = {
            body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            vibrate: [200, 100, 200],
            tag: 'substitution-alert',
            renotify: true
        } as any;

        // Try using Service Worker registration (safest for mobile PWAs)
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && 'showNotification' in registration) {
                await registration.showNotification(title, options);
                return;
            }
        }

        // Fallback to basic Notification constructor
        new Notification(title, options);

        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    } catch (error) {
        console.error('Failed to send notification:', error);
    }
};

export const checkNotificationPermission = (): NotificationPermission => {
    return 'Notification' in window ? Notification.permission : 'denied';
};
