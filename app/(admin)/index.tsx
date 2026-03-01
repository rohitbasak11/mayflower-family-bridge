import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentUserAtom, adminStatsAtom } from '../../store/atoms';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function AdminHome() {
    const currentUser = useAtomValue(currentUserAtom);
    const setAdminStats = useSetAtom(adminStatsAtom);
    const stats = useAtomValue(adminStatsAtom);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [users, residents, bookings, feedback] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'resident'),
                supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'new'),
            ]);

            setAdminStats({
                totalUsers: users.count || 0,
                activeResidents: residents.count || 0,
                pendingBookings: bookings.count || 0,
                newFeedback: feedback.count || 0,
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header Area */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Admin Dashboard</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Text style={styles.iconText}>🔔</Text>
                        <View style={styles.badge} />
                    </TouchableOpacity>
                    <View style={styles.dateBox}>
                        <Text style={styles.dateText}>📅 Today : {today}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome back {currentUser?.full_name?.split(' ')[0] || 'Admin'}!</Text>
                <TouchableOpacity style={styles.addQuickBtn}>
                    <Text style={styles.addQuickText}>+ Quick Action</Text>
                </TouchableOpacity>
            </View>

            {/* Summary KPI Row */}
            <Text style={styles.sectionLabel}>Summary</Text>
            <View style={styles.summaryRow}>
                <StatCard icon="👥" label="Systems Users" value={stats.totalUsers} subLabel="Total" />
                <StatCard icon="👤" label="Active Residents" value={stats.activeResidents} subLabel="Active" />
                <StatCard icon="📝" label="Pending Bookings" value={stats.pendingBookings} subLabel="New" />
                <StatCard icon="💬" label="Feedback items" value={stats.newFeedback} subLabel="New" />
            </View>

            {/* Quick Actions Grid */}
            <Text style={styles.sectionLabel}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                <ActionCard
                    title="Review Bookings"
                    desc="Approve or reject service booking requests"
                    icon="📝"
                    onPress={() => router.push('/(admin)/BookingRequests')}
                    badge={`${stats.pendingBookings} Pending`}
                />
                <ActionCard
                    title="Manage Users"
                    desc="Add, edit or deactivate system users"
                    icon="👥"
                    onPress={() => router.push('/(admin)/ManageUsers')}
                />
                <ActionCard
                    title="Manage Services"
                    desc="Create and edit available services"
                    icon="⚙️"
                    onPress={() => router.push('/(admin)/ManageServices')}
                />
                <ActionCard
                    title="View Residents"
                    desc="Browse complete resident directory"
                    icon="👥"
                    onPress={() => router.push('/(admin)/ResidentFiles')}
                />
                <ActionCard
                    title="Feedback Management"
                    desc="Review and respond to user feedback"
                    icon="💬"
                    onPress={() => router.push('/(admin)/FeedbackManagement')}
                    badge={`${stats.newFeedback} New`}
                />
                <ActionCard
                    title="Consent Records"
                    desc="Manage legal and service consent docs"
                    icon="📄"
                    onPress={() => router.push('/(admin)/ConsentRecords')}
                />
            </View>

            {/* Split Activity Footer */}
            <View style={styles.footerActivity}>
                <View style={styles.activityColumn}>
                    <View style={styles.activityHeader}>
                        <Text style={styles.activityTitle}>Recent Booking Requests</Text>
                        <TouchableOpacity onPress={() => router.push('/(admin)/BookingRequests')}>
                            <Text style={styles.viewAll}>View All Requests ➔</Text>
                        </TouchableOpacity>
                    </View>
                    <ActivityCard
                        title="Physical Therapy Session"
                        sub="Margaret Johnson - Room 204"
                        time="Requested 2 hours ago"
                        icon="🏥"
                    />
                    <ActivityCard
                        title="Dental Checkup"
                        sub="Robert Smith - Room 315"
                        time="Requested 5 hours ago"
                        icon="🦷"
                    />
                    <ActivityCard
                        title="Occupational Therapy"
                        sub="Patricia Davis - Room 112"
                        time="Requested 1 day ago"
                        icon="🧘"
                    />
                </View>

                <View style={styles.activityColumn}>
                    <View style={styles.activityHeader}>
                        <Text style={styles.activityTitle}>Recent Feedback</Text>
                        <TouchableOpacity onPress={() => router.push('/(admin)/FeedbackManagement')}>
                            <Text style={styles.viewAll}>View All Requests ➔</Text>
                        </TouchableOpacity>
                    </View>
                    <ActivityCard
                        title="Dining Service Quality"
                        sub="Sarah Williams (Family)"
                        time="Submitted 1 hour ago"
                        icon="🍽️"
                    />
                    <ActivityCard
                        title="Room Temperature Issue"
                        sub="John Martinez (Family)"
                        time="Submitted 3 hours ago"
                        icon="🌡️"
                    />
                    <ActivityCard
                        title="Activity Program Suggestion"
                        sub="Yasuri Wijewardana (Family)"
                        time="Submitted 1 hour ago"
                        icon="🎨"
                    />
                </View>
            </View>
        </ScrollView>
    );
}

// Sub-components
function StatCard({ icon, label, value, subLabel }: any) {
    return (
        <View style={styles.statCard}>
            <View style={styles.statHeader}>
                <View style={styles.statIconBox}><Text style={styles.statIcon}>{icon}</Text></View>
                <Text style={styles.statSubLabel}>{subLabel}</Text>
            </View>
            <View style={styles.statMain}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </View>
    );
}

function ActionCard({ title, desc, icon, onPress, badge }: any) {
    return (
        <TouchableOpacity style={styles.actionCard} onPress={onPress}>
            <View style={styles.actionHeader}>
                <Text style={styles.actionIcon}>{icon}</Text>
                {badge && <View style={styles.pendingBadge}><Text style={styles.pendingBadgeText}>{badge}</Text></View>}
            </View>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionDesc}>{desc}</Text>
        </TouchableOpacity>
    );
}

function ActivityCard({ title, sub, time, icon }: any) {
    return (
        <View style={styles.activityItem}>
            <View style={styles.activityIconBox}><Text style={{ fontSize: 20 }}>{icon}</Text></View>
            <View style={{ flex: 1 }}>
                <Text style={styles.actItemTitle}>{title}</Text>
                <Text style={styles.actItemSub}>{sub}</Text>
                <Text style={styles.actItemTime}>{time}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    scrollContent: { paddingBottom: 40 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingTop: 32,
        paddingBottom: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#FFF'
    },
    title: { fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 10 },
    iconText: { fontSize: 18 },
    badge: { position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
    dateBox: { backgroundColor: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    dateText: { fontSize: 12, color: '#374151', fontWeight: '600' },

    welcomeSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, marginTop: 32, marginBottom: 24 },
    welcomeText: { fontSize: 20, fontWeight: '800', color: '#111827' },
    addQuickBtn: { backgroundColor: '#111827', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    addQuickText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

    sectionLabel: { fontSize: 14, fontWeight: '800', color: '#111827', paddingHorizontal: 32, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },

    summaryRow: { flexDirection: 'row', paddingHorizontal: 32, gap: 16, marginBottom: 40 },
    statCard: { flex: 1, backgroundColor: '#FFF', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6', elevation: 2, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10 },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    statIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
    statIcon: { fontSize: 18 },
    statSubLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
    statMain: {},
    statValue: { fontSize: 32, fontWeight: '900', color: '#111827', marginBottom: 4 },
    statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },

    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 32, gap: 16, marginBottom: 48 },
    actionCard: { width: (Platform.OS === 'web' ? (width - 280 - 64 - 32) / 3 : (width - 80) / 2), backgroundColor: '#FFF', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6' },
    actionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
    actionIcon: { fontSize: 28 },
    actionTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 8 },
    actionDesc: { fontSize: 12, color: '#9CA3AF', lineHeight: 16 },
    pendingBadge: { backgroundColor: '#F9FAFB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    pendingBadgeText: { color: '#111827', fontSize: 10, fontWeight: '800' },

    footerActivity: { flexDirection: 'row', paddingHorizontal: 32, gap: 24, marginBottom: 40 },
    activityColumn: { flex: 1, backgroundColor: '#FFF', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#F3F4F6' },
    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' },
    activityTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
    viewAll: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
    activityItem: { flexDirection: 'row', gap: 16, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
    activityIconBox: { width: 48, height: 48, backgroundColor: '#F9FAFB', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    actItemTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 4 },
    actItemSub: { fontSize: 13, color: '#6B7280' },
    actItemTime: { fontSize: 12, color: '#9CA3AF', marginTop: 6, fontWeight: '500' }
});