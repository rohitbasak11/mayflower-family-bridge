import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';
import { useRouter } from 'expo-router';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export default function BookingRequests() {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<BookingStatus>('pending');

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    const fetchBookings = async () => {
        setLoading(true);
        // Joining profiles to get Resident Name and Room Number
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                profiles:resident_id (full_name, room_number),
                services:service_id (name)
            `)
            .eq('status', activeTab)
            .order('created_at', { ascending: false });

        if (!error) setBookings(data || []);
        setLoading(false);
    };

    // Inside handleUpdateStatus function (around line 39)
    const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
        const { error } = await (supabase
            .from('bookings') as any) // Add 'as any' here
            .update({ status: newStatus } as any)
            .eq('id', id);

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            fetchBookings();
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.requestCard}>
            <View style={styles.cardInfo}>
                <Text style={styles.residentName}>{item.profiles?.full_name || 'Unknown Resident'}</Text>
                <Text style={styles.serviceName}>{item.services?.name}</Text>
                <Text style={styles.roomText}>Room {item.profiles?.room_number || 'N/A'}</Text>
            </View>

            <View style={styles.metaInfo}>
                <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                {activeTab === 'pending' && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.approveBtn]}
                            onPress={() => handleUpdateStatus(item.id, 'confirmed')}
                        >
                            <Text style={styles.actionBtnText}>✅</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.rejectBtn]}
                            onPress={() => handleUpdateStatus(item.id, 'cancelled')}
                        >
                            <Text style={styles.actionBtnText}>❌</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {activeTab !== 'pending' && (
                    <View style={[styles.statusBadge, activeTab === 'confirmed' ? styles.bgSuccess : styles.bgError]}>
                        <Text style={styles.statusBadgeText}>{activeTab.toUpperCase()}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Booking Requests</Text>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabBar}>
                {(['pending', 'confirmed', 'cancelled'] as BookingStatus[]).map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[styles.tab, activeTab === status && styles.activeTab]}
                        onPress={() => setActiveTab(status)}
                    >
                        <Text style={[styles.tabText, activeTab === status && styles.activeTabText]}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No {activeTab} requests found.</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    backBtn: { marginRight: 15 },
    backText: { fontSize: 24, color: '#111827' },
    title: { fontSize: 22, fontWeight: '800' },
    tabBar: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#E5E7EB', borderRadius: 12, padding: 4, marginBottom: 20 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: '#FFF' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
    activeTabText: { color: '#111827' },
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    requestCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
    cardInfo: { flex: 1 },
    residentName: { fontSize: 16, fontWeight: '700', color: '#111827' },
    serviceName: { fontSize: 14, color: theme.colors.primary, fontWeight: '600', marginVertical: 2 },
    roomText: { fontSize: 12, color: '#6B7280' },
    metaInfo: { alignItems: 'flex-end' },
    dateText: { fontSize: 11, color: '#9CA3AF', marginBottom: 8 },
    actionButtons: { flexDirection: 'row', gap: 8 },
    actionBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    approveBtn: { backgroundColor: '#ECFDF5' },
    rejectBtn: { backgroundColor: '#FEF2F2' },
    actionBtnText: { fontSize: 16 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
    bgSuccess: { backgroundColor: '#10B981' },
    bgError: { backgroundColor: '#EF4444' },
    emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 }
});