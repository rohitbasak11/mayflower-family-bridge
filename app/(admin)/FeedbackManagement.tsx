import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';

export default function FeedbackManagement() {
    const router = useRouter();
    const [feedback, setFeedback] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, new: 0, resolved: 0 });

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        setLoading(true);
        // Inside fetchFeedback (around line 25)
        const { data, error } = await supabase
            .from('feedback')
            .select(`*, profiles:user_id (full_name, role)`)
            .order('created_at', { ascending: false });

        if (!error && data) {
            const feedbackData = data as any[]; // Cast to any array
            setFeedback(feedbackData);
            setStats({
                total: feedbackData.length,
                new: feedbackData.filter(f => f.status === 'new').length,
                resolved: feedbackData.filter(f => f.status === 'resolved').length
            });
        }
        setLoading(false);
    };

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'Dining': return '🍴';
            case 'Temperature': return '🌡️';
            case 'Activity': return '🎨';
            default: return '💬';
        }
    };

    const renderFeedbackItem = ({ item }: { item: any }) => (
        <View style={styles.feedbackCard}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.iconBox}><Text>{getCategoryIcon(item.category)}</Text></View>
                    <View>
                        <Text style={styles.categoryTitle}>{item.category} Feedback</Text>
                        <Text style={styles.userName}>{item.profiles?.full_name} ({item.profiles?.role})</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, item.status === 'new' ? styles.bgNew : styles.bgResolved]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.contentBox}>
                <Text style={styles.feedbackText}>"{item.content}"</Text>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.timeText}>Submitted {new Date(item.created_at).toLocaleDateString()}</Text>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => {/* Logic for responding */ }}
                >
                    <Text style={styles.actionBtnText}>{item.status === 'new' ? 'Respond' : 'View Details'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
                <Text style={styles.title}>Feedback Management</Text>
            </View>

            {/* Top Stat Cards */}
            <View style={styles.statsRow}>
                <View style={styles.miniStat}><Text style={styles.statLabel}>Total</Text><Text style={styles.statValue}>{stats.total}</Text></View>
                <View style={styles.miniStat}><Text style={styles.statLabel}>New</Text><Text style={[styles.statValue, { color: '#3B82F6' }]}>{stats.new}</Text></View>
                <View style={styles.miniStat}><Text style={styles.statLabel}>Resolved</Text><Text style={[styles.statValue, { color: '#10B981' }]}>{stats.resolved}</Text></View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={feedback}
                    keyExtractor={(item) => item.id}
                    renderItem={renderFeedbackItem}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
    backArrow: { fontSize: 24, marginRight: 16 },
    title: { fontSize: 22, fontWeight: '800' },
    statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginBottom: 24 },
    miniStat: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
    statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
    statValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
    listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
    feedbackCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    userInfo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    iconBox: { width: 40, height: 40, backgroundColor: '#F3F4F6', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    categoryTitle: { fontSize: 15, fontWeight: '700' },
    userName: { fontSize: 12, color: '#6B7280' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    bgNew: { backgroundColor: '#DBEAFE' },
    bgResolved: { backgroundColor: '#D1FAE5' },
    statusText: { fontSize: 10, fontWeight: '800', color: '#1E40AF' },
    contentBox: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 10, marginBottom: 16 },
    feedbackText: { fontSize: 14, fontStyle: 'italic', color: '#374151', lineHeight: 20 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    timeText: { fontSize: 11, color: '#9CA3AF' },
    actionBtn: { backgroundColor: '#111827', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    actionBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' }
});