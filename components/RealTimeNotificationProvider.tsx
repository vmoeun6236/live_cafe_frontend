'use client';

import { useEffect } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { toast } from 'react-hot-toast';

declare global {
    interface Window {
        Pusher: any;
        Echo: any;
    }
}

export default function RealTimeNotificationProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const appKey = process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'tqxoes6f2bshju8qff5i';
        const wsHost = process.env.NEXT_PUBLIC_REVERB_HOST || '10.41.1.81';
        const wsPort = process.env.NEXT_PUBLIC_REVERB_PORT || 8080;

        console.log('Initializing Echo with key:', appKey, 'host:', wsHost, 'port:', wsPort);

        window.Pusher = Pusher;

        window.Echo = new Echo({
            broadcaster: 'reverb',
            key: appKey,
            wsHost: wsHost,
            wsPort: wsPort,
            wssPort: wsPort,
            forceTLS: false,
            enabledTransports: ['ws', 'wss'],
        });

        window.Echo.channel('orders')
            .listen('OrderUpdated', (e: any) => {
                toast.success(`New order received! Order #${e.order.id}`, {
                    duration: 5000,
                    position: 'top-right',
                });
            });

        return () => {
            if (window.Echo) {
                window.Echo.disconnect();
            }
        };
    }, []);

    return <>{children}</>;
}
