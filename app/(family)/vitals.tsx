import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function Vitals() {
    const router = useRouter();

    const days = [
        { day: 'Mon', active: true },
        { day: 'Tue', active: true },
        { day: 'Wed', active: true },
        { day: 'Thu', active: true },
        { day: 'Fri', active: false },
        { day: 'Sat', active: false },
        { day: 'Sun', active: false },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Medicine & Vitals</Text>
            </View>

            {/* Weekly Tracker Section */}
            <View style={styles.trackerContainer}>
                <Text style={styles.sectionLabel}>Weekly Adherence</Text>
                <View style={styles.daysRow}>
                    {days.map((d, i) => (
                        <View key={i} style={styles.dayCol}>
                            <View style={[styles.dayDot, d.active && styles.dayDotActive]} />
                            <Text style={styles.dayText}>{d.day}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.content}>
                {/* Vitals Grid */}
                <Text style={styles.sectionLabel}>Key Indicators</Text>
                <View style={styles.vitalsGrid}>
                    <View style={styles.vitalCard}>
                        <View style={styles.vitalHeader}>
                            <Text style={styles.vitalEmoji}>❤️</Text>
                            <View style={styles.statusBadgeGreen} />
                        </View>
                        <Text style={styles.vitalValue}>72</Text>
                        <Text style={styles.vitalUnit}>bpm / Heart Rate</Text>
                    </View>

                    <View style={styles.vitalCard}>
                        <View style={styles.vitalHeader}>
                            <Text style={styles.vitalEmoji}>🩸</Text>
                            <View style={styles.statusBadgeOrange} />
                        </View>
                        <Text style={styles.vitalValue}>120/80</Text>
                        <Text style={styles.vitalUnit}>mmHg / Blood Pressure</Text>
                    </View>
                </View>

                {/* Medication List */}
                <Text style={[styles.sectionLabel, { marginTop: 25 }]}>Daily Medications</Text>

                <View style={styles.medCard}>
                    <View style={styles.medIconBox}>
                        <Text style={styles.medEmoji}>💊</Text>
                    </View>
                    <View style={styles.medInfo}>
                        <Text style={styles.medName}>Donepezil</Text>
                        <Text style={styles.medDetails}>5mg • Once Daily</Text>
                    </View>
                    <View style={styles.statusTag}>
                        <Text style={styles.statusTagText}>Taken 08:00 AM</Text>
                    </View>
                </View>

                <View style={styles.medCard}>
                    <View style={styles.medIconBox}>
                        <Text style={styles.medEmoji}>💧</Text>
                    </View>
                    <View style={styles.medInfo}>
                        <Text style={styles.medName}>Eye Drops</Text>
                        <Text style={styles.medDetails}>2 Drops • Twice Daily</Text>
                    </View>
                    <View style={[styles.statusTag, { backgroundColor: '#FFF7ED' }]}>
                        <Text style={[styles.statusTagText, { color: '#C2410C' }]}>Next: 08:00 PM</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.historyBtn}>
                    <Text style={styles.historyBtnText}>View Full Medical Report</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
    backButton: { marginRight: 15 },
    backIcon: { fontSize: 24 },
    title: { fontSize: 20, fontWeight: '800' },

    trackerContainer: { marginHorizontal: 24, padding: 20, backgroundColor: '#F9FAFB', borderRadius: 24, marginBottom: 25 },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
    daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
    dayCol: { alignItems: 'center', gap: 8 },
    dayDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E5E7EB' },
    dayDotActive: { backgroundColor: '#10B981', borderWidth: 3, borderColor: '#D1FAE5' },
    dayText: { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },

    content: { paddingHorizontal: 24 },
    vitalsGrid: { flexDirection: 'row', gap: 15 },
    vitalCard: { flex: 1, padding: 16, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    vitalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    vitalEmoji: { fontSize: 20 },
    statusBadgeGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
    statusBadgeOrange: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' },
    vitalValue: { fontSize: 22, fontWeight: '800', color: '#111827' },
    vitalUnit: { fontSize: 10, color: '#6B7280', fontWeight: '600', marginTop: 2 },

    medCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 12 },
    medIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    medEmoji: { fontSize: 20 },
    medInfo: { flex: 1 },
    medName: { fontSize: 15, fontWeight: '800', color: '#111827' },
    medDetails: { fontSize: 12, color: '#6B7280' },
    statusTag: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    statusTagText: { fontSize: 10, fontWeight: '700', color: '#15803D' },

    historyBtn: { marginTop: 20, padding: 16, borderRadius: 15, backgroundColor: '#111827', alignItems: 'center', marginBottom: 40 },
    historyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 }
});