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

export const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
        });

        // Vibration for mobile if available
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    }
};

export const checkNotificationPermission = (): NotificationPermission => {
    return 'Notification' in window ? Notification.permission : 'denied';
};
