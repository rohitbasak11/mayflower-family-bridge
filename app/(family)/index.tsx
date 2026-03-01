import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentUserAtom, unreadCountAtom, bookingsAtom, selectedResidentIdAtom } from '../../store/atoms';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface Profile {
    id: string;
    full_name: string | null;
    role: 'resident' | 'family' | 'staff';
    credits: number;
    avatar_url?: string | null;
}

export default function FamilyHome() {
    const currentUser = useAtomValue(currentUserAtom) as Profile | null;
    const unreadCount = useAtomValue(unreadCountAtom);
    const setBookings = useSetAtom(bookingsAtom);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [activeCount, setActiveCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [creditValue, setCreditValue] = useState(200);
    const [sending, setSending] = useState(false);
    const setSelectedResidentId = useSetAtom(selectedResidentIdAtom);
    const selectedRecipientId = useAtomValue(selectedResidentIdAtom);
    const [potentialRecipients, setPotentialRecipients] = useState<any[]>([]);

    useEffect(() => {
        if (currentUser) {
            loadDashboardData();
        }
    }, [currentUser]);

    const loadDashboardData = async () => {
        if (!currentUser) return;
        setLoading(true);

        // Fetch bookings
        const { data: bookingsData } = await (supabase.from('bookings' as any) as any).select('*');
        if (bookingsData) {
            const typedBookings = bookingsData as any[];
            setBookings(typedBookings);
            setActiveCount(typedBookings.filter((b: any) => b.status === 'confirmed').length);
            setPendingCount(typedBookings.filter((b: any) => b.status === 'pending').length);
        }

        // Fetch residents/recipients
        const { data: users } = await (supabase.from('profiles' as any) as any)
            .select('id, full_name, role')
            .eq('role', 'resident');

        if (users) {
            setPotentialRecipients(users);
            if (users.length > 0 && !selectedRecipientId) {
                setSelectedResidentId(users[0].id);
            }
        }
        setLoading(false);
    };

    const handleSendCredit = async () => {
        if (!currentUser || !selectedRecipientId) {
            Alert.alert('Selection Required', 'Please select a resident first.');
            return;
        }
        setSending(true);
        try {
            const { error } = await (supabase.rpc as any)('process_credit_transfer', {
                p_from_user_id: currentUser.id,
                p_to_user_id: selectedRecipientId,
                p_amount: creditValue,
                p_description: `Gift from ${currentUser.full_name}`
            });

            if (error) throw error;

            Alert.alert('Success', `Sent ${creditValue} credits!`);
            loadDashboardData(); // Refresh counts
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send credits');
        } finally {
            setSending(false);
        }
    };

    if (!currentUser) return <ActivityIndicator style={{ flex: 1 }} />;

    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity><Text style={styles.menuIcon}>☰</Text></TouchableOpacity>
                <Text style={styles.logoText}>mayflower</Text>
                <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/(family)/chat')}>
                    <Text style={styles.notifIcon}>🔔</Text>
                    {unreadCount > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadCount}</Text></View>}
                </TouchableOpacity>
            </View>

            {/* Welcome Profile Card */}
            <View style={styles.welcomeCard}>
                <View style={styles.welcomeMain}>
                    <View>
                        <Text style={styles.welcomeTitle}>Welcome back {currentUser.full_name?.split(' ')[0] || 'User'} !!</Text>
                        <Text style={styles.subText}>Grandson of Sylvia</Text>
                    </View>
                    <Image source={{ uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.full_name}` }} style={styles.avatar} />
                </View>
                <View style={styles.divider} />
                <View style={styles.welcomeFooter}>
                    <Text style={styles.dateText}>📅 Today : {today}</Text>
                    <View style={styles.roleBadge}><Text style={styles.roleText}>Family User 👤</Text></View>
                </View>
            </View>

            {/* Status Grid */}
            <View style={styles.statusRow}>
                <View style={styles.statusCard}>
                    <Text style={styles.statusTitle}>Active</Text>
                    <Text style={styles.statusValue}>{activeCount}</Text>
                    <Text style={styles.statusLabel}>Services</Text>
                </View>
                <View style={styles.statusCard}>
                    <Text style={styles.statusTitle}>Pending</Text>
                    <Text style={styles.statusValue}>{pendingCount}</Text>
                    <Text style={styles.statusLabel}>Approval</Text>
                </View>
            </View>

            {/* Send Credit Card */}
            <View style={styles.creditCard}>
                <View style={styles.creditHeader}>
                    <View style={styles.creditIconBox}><Text>💰</Text></View>
                    <Text style={styles.creditTitle}>Send Credit</Text>
                </View>

                {/* Interactive Slider UI */}
                <View style={styles.sliderWrapper}>
                    <View style={styles.sliderControls}>
                        <TouchableOpacity
                            style={styles.adjustBtn}
                            onPress={() => setCreditValue(Math.max(10, creditValue - 10))}
                        >
                            <Text style={styles.adjustBtnText}>-</Text>
                        </TouchableOpacity>

                        <View style={styles.sliderTrackWrapper}>
                            <View style={styles.sliderTrack}>
                                <View style={[styles.sliderFill, { width: `${(creditValue / 500) * 100}%` }]} />
                                <View style={[styles.sliderThumb, { left: `${(creditValue / 500) * 100}%` }]} />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.adjustBtn}
                            onPress={() => setCreditValue(Math.min(500, creditValue + 10))}
                        >
                            <Text style={styles.adjustBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.amountText}>{creditValue} NZD</Text>
                </View>

                <TouchableOpacity style={styles.sendActionBtn} onPress={handleSendCredit} disabled={sending}>
                    <Text style={styles.sendIcon}>{sending ? '...' : '➔'}</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
                {[
                    { label: 'Book Service', route: '/(family)/book-service' },
                    { label: 'My Schedule/ Events', route: '/(family)/schedule' },
                    { label: 'Medicine & Vitals', route: '/(family)/vitals' },
                    { label: 'Resident Chat/ Gallery', route: '/(family)/chat' }
                ].map((item, idx) => (
                    <TouchableOpacity key={idx} style={styles.actionItem} onPress={() => router.push(item.route as any)}>
                        <Text style={styles.actionItemText}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
    logoText: { fontSize: 18, fontWeight: '900', color: '#111827' },
    menuIcon: { fontSize: 24 },
    notifBtn: { position: 'relative' },
    notifIcon: { fontSize: 24 },
    notifBadge: { position: 'absolute', right: -2, top: -2, backgroundColor: 'red', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
    notifBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

    welcomeCard: { marginHorizontal: 20, padding: 20, borderRadius: 24, backgroundColor: 'white', borderWidth: 1, borderColor: '#F3F4F6', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
    welcomeMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    welcomeTitle: { fontSize: 20, fontWeight: '800' },
    subText: { color: '#6B7280', fontSize: 13 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 15 },
    welcomeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dateText: { fontSize: 12, color: '#6B7280' },
    roleBadge: { backgroundColor: '#F9FAFB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    roleText: { fontSize: 12, fontWeight: '700' },

    statusRow: { flexDirection: 'row', gap: 15, paddingHorizontal: 20, marginTop: 20 },
    statusCard: { flex: 1, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center' },
    statusTitle: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
    statusValue: { fontSize: 28, fontWeight: '800', marginVertical: 4 },
    statusLabel: { fontSize: 12, fontWeight: '700' },

    creditCard: { margin: 20, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6' },
    creditHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    creditIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    creditTitle: { fontWeight: '700' },
    sliderWrapper: { alignItems: 'center', marginVertical: 10 },
    sliderTrack: { height: 6, backgroundColor: '#EEF2FF', width: '100%', borderRadius: 3, position: 'relative' },
    sliderFill: { height: 6, backgroundColor: '#6366F1', borderRadius: 3 },
    sliderThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#6366F1', position: 'absolute', top: -6, borderWidth: 3, borderColor: 'white' },
    amountText: { marginTop: 15, fontWeight: '800', color: '#111827', fontSize: 18 },
    sliderControls: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: 15 },
    adjustBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    adjustBtnText: { fontSize: 20, fontWeight: '600', color: '#111827' },
    sliderTrackWrapper: { flex: 1 },
    sendActionBtn: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#111827', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    sendIcon: { color: 'white', fontSize: 18 },

    sectionTitle: { paddingHorizontal: 24, fontSize: 16, fontWeight: '800', marginTop: 10 },
    actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 20 },
    actionItem: { width: (width - 52) / 2, height: 80, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', padding: 10 },
    actionItemText: { textAlign: 'center', fontWeight: '700', fontSize: 13 }
});