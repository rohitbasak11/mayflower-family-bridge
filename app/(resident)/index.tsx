import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentUserAtom, messagesAtom, unreadCountAtom, servicesAtom } from '../../store/atoms';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function ResidentHome() {
    const currentUser = useAtomValue(currentUserAtom);
    const unreadCount = useAtomValue(unreadCountAtom);
    const setMessages = useSetAtom(messagesAtom);
    const setServices = useSetAtom(servicesAtom);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: messages } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (messages) setMessages(messages);

            const { data: services } = await supabase
                .from('services')
                .select('*')
                .eq('available', true);

            if (services) setServices(services);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace('/(auth)/login');
    };

    if (!currentUser) return null;

    const today = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { }} style={styles.menuButton}>
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
                <Text style={styles.logoText}>mayflower</Text>
                <TouchableOpacity onPress={() => { }} style={styles.notificationButton}>
                    <Text style={styles.notificationIcon}>🔔</Text>
                </TouchableOpacity>
            </View>

            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
                <View>
                    <Text style={styles.welcomeTitle}>Hello {currentUser.full_name?.split(' ')[0] || 'Resident'}!</Text>
                    <Text style={styles.dateText}>{today}</Text>
                </View>
                <Image
                    source={{ uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}` }}
                    style={styles.avatar}
                />
            </View>

            {/* Credit Balance Card - Large and prominent for resident */}
            <Card style={styles.creditCard}>
                <View style={styles.creditHeader}>
                    <Text style={styles.creditLabel}>Available Credits</Text>
                    <Text style={styles.creditIcon}>💎</Text>
                </View>
                <Text style={styles.creditAmount}>{currentUser.credits || 0}</Text>
                <View style={styles.creditFooter}>
                    <Text style={styles.creditSubtext}>Spend these on your favorite activities</Text>
                </View>
            </Card>

            {/* Actions Grid */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Main Activities</Text>
            </View>

            <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(resident)/chat')}>
                    <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                        <Text style={styles.actionIcon}>💬</Text>
                    </View>
                    <Text style={styles.actionLabel}>Messages</Text>
                    {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(resident)/book-service')}>
                    <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                        <Text style={styles.actionIcon}>🎨</Text>
                    </View>
                    <Text style={styles.actionLabel}>Activities</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => { }}>
                    <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
                        <Text style={styles.actionIcon}>🍎</Text>
                    </View>
                    <Text style={styles.actionLabel}>Meals</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/(resident)/history')}>
                    <View style={[styles.iconBox, { backgroundColor: '#F0FDFA' }]}>
                        <Text style={styles.actionIcon}>👤</Text>
                    </View>
                    <Text style={styles.actionLabel}>Credit History</Text>
                </TouchableOpacity>
            </View>

            {/* Recent Services Card */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Activities</Text>
            </View>

            <Card style={styles.activityCard}>
                <Text style={styles.emptyText}>Keep an eye here for your scheduled services!</Text>
            </Card>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 30,
    },
    menuButton: {
        padding: theme.spacing.sm,
    },
    menuIcon: {
        fontSize: 24,
    },
    logoText: {
        ...theme.typography.h3,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },
    notificationButton: {
        padding: theme.spacing.sm,
    },
    notificationIcon: {
        fontSize: 24,
    },
    welcomeSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
        marginTop: theme.spacing.md,
    },
    welcomeTitle: {
        ...theme.typography.h2,
        fontWeight: '700',
    },
    dateText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#F3F4F6',
    },
    creditCard: {
        margin: theme.spacing.lg,
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.colors.primary,
        ...theme.shadows.lg,
    },
    creditHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    creditLabel: {
        ...theme.typography.bodySemiBold,
        color: '#FFFFFFEE',
    },
    creditIcon: {
        fontSize: 24,
    },
    creditAmount: {
        ...theme.typography.h1,
        fontSize: 56,
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: -1,
    },
    creditFooter: {
        marginTop: theme.spacing.md,
    },
    creditSubtext: {
        ...theme.typography.bodySmall,
        color: '#FFFFFFBB',
    },
    sectionHeader: {
        paddingHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.bodySemiBold,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    actionItem: {
        width: (width - (theme.spacing.lg * 2) - theme.spacing.md) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        ...theme.shadows.sm,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    actionIcon: {
        fontSize: 24,
    },
    actionLabel: {
        ...theme.typography.bodySmallSemiBold,
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: theme.colors.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    activityCard: {
        marginHorizontal: theme.spacing.lg,
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        borderStyle: 'dashed',
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        backgroundColor: 'transparent',
        ...theme.shadows.sm,
    },
    emptyText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.tertiary,
        textAlign: 'center',
    },
    logoutButton: {
        marginVertical: theme.spacing.xxxl,
        alignItems: 'center',
    },
    logoutText: {
        color: theme.colors.error,
        fontWeight: '600',
    }
});
