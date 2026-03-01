import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '../types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];

// Create custom storage for Jotai
const asyncStorage = {
    getItem: async (key: string) => {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    },
    setItem: async (key: string, value: any) => {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: async (key: string) => {
        await AsyncStorage.removeItem(key);
    },
};

// Auth state
export const currentUserAtom = atomWithStorage<Profile | null>(
    'currentUser',
    null,
    asyncStorage as any
);

export const isAuthenticatedAtom = atom((get) => get(currentUserAtom) !== null);

// Messages state
export const messagesAtom = atom<Message[]>([]);
export const unreadCountAtom = atom((get) => {
    const messages = get(messagesAtom);
    const currentUser = get(currentUserAtom) as Profile | null;
    if (!currentUser) return 0;
    return messages.filter(m => m.recipient_id === currentUser.id && !m.read).length;
});

// Services state
export const servicesAtom = atom<Service[]>([]);
export const availableServicesAtom = atom((get) =>
    get(servicesAtom).filter(s => s.available)
);

// Bookings state
export const bookingsAtom = atom<Booking[]>([]);
export const pendingBookingsAtom = atom((get) =>
    get(bookingsAtom).filter(b => b.status === 'pending')
);

// Credit transactions state
export const transactionsAtom = atom<CreditTransaction[]>([]);

// Feedback state
export const feedbackAtom = atom<Feedback[]>([]);
export const pendingFeedbackAtom = atom((get) =>
    get(feedbackAtom).filter(f => f.status === 'new')
);

// Admin Dashboard Summary State
export const adminStatsAtom = atom({
    totalUsers: 0,
    activeResidents: 0,
    pendingBookings: 0,
    newFeedback: 0,
});

// UI state
export const isLoadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);
export const selectedResidentIdAtom = atomWithStorage<string | null>(
    'selectedResidentId',
    null,
    asyncStorage as any
);
