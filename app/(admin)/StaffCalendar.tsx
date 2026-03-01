import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';
import { Card } from '../../components/ui/Card';

export default function StaffCalendar() {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadAllBookings();
    }, []);

    const loadAllBookings = async () => {
        setLoading(true);
        // Force-casting the table to 'any' to bypass the TypeScript 'never' error
        const { data, error } = await (supabase
            .from('bookings' as any) as any)
            .select(`
                *,
                service:services(*),
                resident:profiles!resident_id(full_name),
                family:profiles!family_id(full_name)
            `)
            .order('scheduled_for', { ascending: true });

        if (data) setBookings(data);
        setLoading(false);
    };

    const handleUpdateStatus = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
        // Double-casting the table and the update result to finally kill the 'never' type error
        const { error } = await (supabase
            .from('bookings' as any) as any)
            .update({ status: newStatus } as any)
            .eq('id', id);

        if (!error) {
            loadAllBookings();
        } else {
            Alert.alert("Error", error.message);
        }
    };

    const markedDates = useMemo(() => {
        const marked: any = {};
        bookings.forEach(b => {
            if (b.scheduled_for) {
                const date = b.scheduled_for.split('T')[0];
                const isPending = b.status === 'pending';

                marked[date] = {
                    marked: true,
                    dotColor: isPending ? theme.colors.error : theme.colors.primary,
                };
            }
        });
        marked[selectedDate] = { ...marked[selectedDate], selected: true, selectedColor: theme.colors.primary };
        return marked;
    }, [bookings, selectedDate]);

    const dayEvents = bookings.filter(b =>
        b.scheduled_for && b.scheduled_for.split('T')[0] === selectedDate
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Facility Schedule</Text>
            </View>

            <Calendar
                current={selectedDate}
                onDayPress={(day: any) => setSelectedDate(day.dateString)}
                markedDates={markedDates}
                theme={{
                    todayTextColor: theme.colors.primary,
                    arrowColor: theme.colors.primary,
                    selectedDayBackgroundColor: theme.colors.primary,
                }}
            />

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>
                    Events for {selectedDate}
                </Text>

                {loading ? (
                    <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
                ) : dayEvents.length === 0 ? (
                    <Text style={styles.emptyText}>No events scheduled for this day.</Text>
                ) : (
                    dayEvents.map((item) => (
                        <Card key={item.id} style={styles.eventCard}>
                            <View style={styles.eventHeader}>
                                <Text style={styles.timeText}>
                                    {new Date(item.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={[
                                        styles.badge,
                                        { backgroundColor: item.status === 'confirmed' ? '#D1FAE5' : item.status === 'cancelled' ? '#FEE2E2' : '#FFEDD5' }
                                    ]}>
                                        <Text style={[
                                            styles.badgeText,
                                            { color: item.status === 'confirmed' ? '#065F46' : item.status === 'cancelled' ? '#991B1B' : '#9A3412' }
                                        ]}>
                                            {item.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </div>
                            </View>

                            <Text style={styles.residentName}>Resident: {item.resident?.full_name || 'Resident'}</Text>
                            <Text style={styles.eventTitle}>{item.service?.name || item.title || 'General Event'}</Text>

                            {item.family && (
                                <Text style={styles.familyNote}>Requested by Family: {item.family.full_name}</Text>
                            )}

                            {item.status === 'pending' && (
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.confirmBtn]}
                                        onPress={() => handleUpdateStatus(item.id, 'confirmed')}
                                    >
                                        <Text style={styles.btnText}>Approve</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.cancelBtn]}
                                        onPress={() => handleUpdateStatus(item.id, 'cancelled')}
                                    >
                                        <Text style={[styles.btnText, { color: theme.colors.error }]}>Decline</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </Card>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
    backButton: { marginRight: 15 },
    backIcon: { fontSize: 24 },
    title: { ...theme.typography.h3, fontWeight: '700' },
    content: { padding: 20 },
    sectionTitle: { ...theme.typography.bodySemiBold, marginBottom: 15 },
    eventCard: {
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
        borderRadius: 12,
        backgroundColor: '#FFF',
        elevation: 2,
    },
    eventHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    timeText: { fontWeight: '700', color: theme.colors.primary },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    badgeText: { fontSize: 10, fontWeight: '800' },
    residentName: { fontSize: 12, color: '#666' },
    eventTitle: { fontSize: 16, fontWeight: '600', marginVertical: 2 },
    familyNote: { fontSize: 12, color: theme.colors.primary, fontStyle: 'italic', marginTop: 4 },
    actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
    confirmBtn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    cancelBtn: { borderColor: theme.colors.error },
    btnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 20 }
});