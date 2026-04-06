import { useEffect } from 'react';
import api from './api';

export function useActivityLogger() {
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return; // Only log activity for authenticated users

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Determine if the clicked element is interactive
            const isButton = target.tagName === 'BUTTON' || target.closest('button');
            const isLink = target.tagName === 'A' || target.closest('a');
            const isSelect = target.tagName === 'SELECT';

            if (isButton || isLink || isSelect) {
                const element = (target.closest('button') || target.closest('a') || target) as HTMLElement;
                
                let text = element.innerText?.trim();
                if (!text || text === '') {
                    text = element.getAttribute('title') || element.tagName;
                }

                // Shorten string to fit DB limits safely
                text = text.slice(0, 100);

                api.post('/analytics/activity', {
                    action_type: 'CLICK',
                    target: text
                }).catch(() => {
                    // Fail silently so we don't spam the console or block the user
                });
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);
}
