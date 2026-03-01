import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { Calendar } from 'react-native-calendars';
import { currentUserAtom } from '../../store/atoms';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';

export default function Schedule() {
    const currentUser = useAtomValue(currentUserAtom);
    const router = useRouter();

    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTime, setNewTime] = useState('10:00');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        if (!currentUser) return;
        setLoading(true);
        // Using bypass cast for the join query
        const { data, error } = await (supabase.from('bookings' as any) as any)
            .select(`*, service:services(*)`)
            .order('scheduled_for', { ascending: true });

        if (data) setBookings(data);
        setLoading(false);
    };

    const handleAddEntry = async () => {
        if (!newTitle || !currentUser) return;
        setIsSaving(true);
        const scheduledDateTime = `${selectedDate}T${newTime}:00Z`;

        const { error } = await (supabase.from('bookings' as any) as any)
            .insert([{
                family_id: currentUser.id,
                resident_id: currentUser.id,
                title: newTitle,
                scheduled_for: scheduledDateTime,
                status: 'pending',
                created_by_role: 'family'
            }] as any);

        if (!error) {
            setNewTitle('');
            setIsModalVisible(false);
            loadBookings();
        } else {
            Alert.alert("Error", error.message);
        }
        setIsSaving(false);
    };

    const markedDates = useMemo(() => {
        const marked: any = {};
        bookings.forEach(booking => {
            if (booking.scheduled_for) {
                const date = booking.scheduled_for.split('T')[0];
                marked[date] = { marked: true, dotColor: '#6366F1' };
            }
        });
        marked[selectedDate] = { ...marked[selectedDate], selected: true, selectedColor: '#111827' };
        return marked;
    }, [bookings, selectedDate]);

    const selectedDayBookings = bookings.filter(
        b => b.scheduled_for && b.scheduled_for.split('T')[0] === selectedDate
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Schedule</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.calendarWrapper}>
                <Calendar
                    current={selectedDate}
                    onDayPress={(day: any) => setSelectedDate(day.dateString)}
                    markedDates={markedDates}
                    theme={{
                        calendarBackground: '#ffffff',
                        selectedDayBackgroundColor: '#111827',
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: '#6366F1',
                        dayTextColor: '#111827',
                        textDisabledColor: '#D1D5DB',
                        dotColor: '#6366F1',
                        monthTextColor: '#111827',
                        textMonthFontWeight: '800',
                        arrowColor: '#111827',
                    }}
                />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.dateLabel}>
                    {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>

                {loading ? (
                    <ActivityIndicator color="#111827" style={{ marginTop: 20 }} />
                ) : selectedDayBookings.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>No events or appointments</Text>
                    </View>
                ) : (
                    selectedDayBookings.map((booking) => (
                        <View key={booking.id} style={styles.eventCard}>
                            <View style={styles.timeColumn}>
                                <Text style={styles.timeText}>
                                    {new Date(booking.scheduled_for).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <View style={[styles.indicator, { backgroundColor: booking.created_by_role === 'staff' ? '#6366F1' : '#10B981' }]} />
                            </View>

                            <View style={styles.eventDetails}>
                                <Text style={styles.eventTitle}>{booking.service?.name || booking.title}</Text>
                                <Text style={styles.eventSub}>{booking.created_by_role === 'staff' ? 'Medical/Care Team' : 'Family Visit'}</Text>
                                {booking.status === 'pending' && (
                                    <View style={styles.pendingBadge}>
                                        <Text style={styles.pendingText}>Awaiting Confirmation</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Modal remains visually similar but styled to match */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Family Visit</Text>
                        <TextInput style={styles.input} placeholder="Visit Title (e.g. Sunday Brunch)" value={newTitle} onChangeText={setNewTitle} />
                        <TextInput style={styles.input} placeholder="Time (e.g. 14:00)" value={newTime} onChangeText={setNewTime} />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalVisible(false)}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleAddEntry} disabled={isSaving}>
                                <Text style={styles.saveBtnText}>{isSaving ? '...' : 'Schedule'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 15 },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    backIcon: { fontSize: 24 },
    title: { fontSize: 20, fontWeight: '800' },
    addButton: { width: 40, height: 40, backgroundColor: '#F3F4F6', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    addButtonText: { fontSize: 24, fontWeight: '300' },
    calendarWrapper: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 10 },
    content: { padding: 24 },
    dateLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 20, textTransform: 'uppercase' },
    eventCard: { flexDirection: 'row', marginBottom: 20, gap: 15 },
    timeColumn: { alignItems: 'center', width: 50 },
    timeText: { fontSize: 12, fontWeight: '700', color: '#111827', marginBottom: 8 },
    indicator: { width: 3, flex: 1, borderRadius: 2, minHeight: 40 },
    eventDetails: { flex: 1, backgroundColor: '#F9FAFB', padding: 16, borderRadius: 16 },
    eventTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
    eventSub: { fontSize: 12, color: '#6B7280' },
    pendingBadge: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#FFF7ED', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    pendingText: { fontSize: 10, color: '#C2410C', fontWeight: '700' },
    emptyBox: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#9CA3AF', fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30 },
    modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
    input: { backgroundColor: '#F9FAFB', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#F3F4F6' },
    modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 10 },
    cancelBtn: { padding: 15 },
    saveBtn: { backgroundColor: '#111827', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 12 },
    saveBtnText: { color: 'white', fontWeight: '700' }
});