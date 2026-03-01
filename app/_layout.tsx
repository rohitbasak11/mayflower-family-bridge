import { Stack } from 'expo-router';
import { Provider, useAtom, useSetAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { currentUserAtom, messagesAtom } from '../store/atoms';

function RootContent() {
    const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
    const setMessages = useSetAtom(messagesAtom);

    useEffect(() => {
        supabase.auth.getSession();

        if (!currentUser) return;

        // REAL-TIME: Comprehensive sync
        const channel = supabase
            .channel('system-sync')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const newMessage = payload.new as any;
                    if (newMessage.recipient_id === currentUser.id || newMessage.role_target === currentUser.role) {
                        setMessages((prev) => [...prev, newMessage]);
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${currentUser.id}` },
                (payload) => {
                    // Update current user atom when DB profile changes (e.g. credits)
                    setCurrentUser(payload.new as any);
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bookings' },
                (payload) => {
                    // Refresh bookings when any change occurs
                    // This is a simple way; more optimized would be updating the atom directly
                    // For now, let's just trigger a reload or update if it's relevant
                    console.log('Booking changed:', payload.eventType);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser?.id]); // Only re-subscribe if user ID changes

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(resident)" />
            <Stack.Screen name="(family)" />
            <Stack.Screen name="(admin)" />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <Provider>
            <RootContent />
        </Provider>
    );
}
