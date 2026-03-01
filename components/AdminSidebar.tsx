import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { adminStatsAtom } from '../store/atoms';
import { useAtomValue } from 'jotai';

interface SidebarItemProps {
    label: string;
    icon: string;
    target: string;
    badgeCount?: number;
    isActive: boolean;
    onPress: () => void;
}

const SidebarItem = ({ label, icon, badgeCount, isActive, onPress }: SidebarItemProps) => {
    return (
        <TouchableOpacity
            style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
            onPress={onPress}
        >
            <View style={styles.itemContent}>
                <Text style={styles.itemIcon}>{icon}</Text>
                <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>{label}</Text>
            </View>
            {badgeCount !== undefined && badgeCount > 0 && (
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{badgeCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const stats = useAtomValue(adminStatsAtom);

    const menuItems = [
        { label: 'Dashboard', icon: '⊞', target: '/(admin)' },
        { label: 'User Management', icon: '👥', target: '/(admin)/ManageUsers' },
        { label: 'Manage Services', icon: '🛠️', target: '/(admin)/ManageServices' },
        { label: 'Booking Requests', icon: '📝', target: '/(admin)/BookingRequests', badge: stats.pendingBookings },
        { label: 'All Residents', icon: '👤', target: '/(admin)/ResidentFiles' },
        { label: 'Consent Records', icon: '📄', target: '/(admin)/ConsentRecords' },
        { label: 'Feedback', icon: '💬', target: '/(admin)/FeedbackManagement', badge: stats.newFeedback },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.logoSection}>
                <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoIcon}>🌸</Text>
                </View>
                <View>
                    <Text style={styles.logoText}>Mayflower</Text>
                    <Text style={styles.logoSubtext}>Admin Portal</Text>
                </View>
            </View>

            <View style={styles.menuSection}>
                {menuItems.map((item, index) => (
                    <SidebarItem
                        key={index}
                        label={item.label}
                        icon={item.icon}
                        target={item.target}
                        badgeCount={item.badge}
                        isActive={pathname === item.target}
                        onPress={() => router.push(item.target as any)}
                    />
                ))}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/(auth)/login')}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 280,
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRightWidth: 1,
        borderRightColor: '#F3F4F6',
        paddingVertical: 24,
        display: Platform.OS === 'web' ? 'flex' : 'none', // Hide on mobile for now, or use as Drawer
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 40,
        gap: 12,
    },
    logoPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoIcon: {
        fontSize: 20,
    },
    logoText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#111827',
        letterSpacing: -0.5,
    },
    logoSubtext: {
        fontSize: 10,
        fontWeight: '600',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        marginTop: -2,
    },
    menuSection: {
        flex: 1,
        paddingHorizontal: 12,
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 4,
    },
    sidebarItemActive: {
        backgroundColor: '#F3F4F6',
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemIcon: {
        fontSize: 18,
        color: '#6B7280',
    },
    itemLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    itemLabelActive: {
        color: '#111827',
    },
    badgeContainer: {
        backgroundColor: '#111827',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    logoutBtn: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#EF4444',
    },
});
