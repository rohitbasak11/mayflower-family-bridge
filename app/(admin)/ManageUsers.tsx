import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';

export default function ManageUsers() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true });

        if (!error) setUsers(data || []);
        setLoading(false);
    };

    // Inside toggleUserStatus (around line 30)
    const changeUserRole = async (id: string, newRole: string) => {
        const { error } = await (supabase
            .from('profiles') as any)
            .update({ role: newRole } as any)
            .eq('id', id);

        if (error) {
            Alert.alert("Error", "Could not update user role");
        } else {
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        }
    };

    const toggleUserStatus = async (id: string, currentStatus: string) => {
        const newStatus = (currentStatus === 'active' || !currentStatus) ? 'inactive' : 'active';

        const { error } = await (supabase
            .from('profiles') as any)
            .update({ status: newStatus } as any)
            .eq('id', id);

        if (error) {
            Alert.alert("Error", "Could not update user status");
        } else {
            setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const renderHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, { flex: 2 }]}>User Details</Text>
            <Text style={[styles.columnHeader, { flex: 1 }]}>Role</Text>
            <Text style={[styles.columnHeader, { flex: 1 }]}>Status</Text>
            <Text style={[styles.columnHeader, { flex: 1, textAlign: 'right' }]}>Actions</Text>
        </View>
    );

    const renderUserItem = ({ item }: { item: any }) => (
        <View style={styles.userRow}>
            {/* User Info */}
            <View style={{ flex: 2 }}>
                <Text style={styles.userNameText}>{item.full_name || 'No Name Set'}</Text>
                <Text style={styles.userEmailText}>{item.email}</Text>
            </View>

            {/* Role Badge */}
            <View style={{ flex: 1 }}>
                <TouchableOpacity
                    onPress={() => {
                        const roles = ['resident', 'family', 'staff'];
                        const nextRole = roles[(roles.indexOf(item.role) + 1) % roles.length];
                        changeUserRole(item.id, nextRole);
                    }}
                    style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}
                >
                    <Text style={styles.roleBadgeText}>{item.role?.toUpperCase()}</Text>
                </TouchableOpacity>
            </View>

            {/* Status Badge */}
            <View style={{ flex: 1 }}>
                <View style={[styles.statusIndicator, { backgroundColor: item.status === 'active' ? '#10B981' : '#9CA3AF' }]} />
                <Text style={styles.statusText}>{item.status === 'active' ? 'Active' : 'Inactive'}</Text>
            </View>

            {/* Actions */}
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <TouchableOpacity
                    onPress={() => toggleUserStatus(item.id, item.status)}
                    style={[styles.actionBtn, { borderColor: item.status === 'active' ? '#EF4444' : '#10B981' }]}
                >
                    <Text style={[styles.actionBtnText, { color: item.status === 'active' ? '#EF4444' : '#10B981' }]}>
                        {item.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'staff': return '#6366F1';
            case 'resident': return '#F59E0B';
            case 'family': return '#10B981';
            default: return '#9CA3AF';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <View>
                    <Text style={styles.title}>User Management</Text>
                    <Text style={styles.subtitle}>Manage permissions and account status</Text>
                </View>
                <TouchableOpacity style={styles.addUserBtn} onPress={() => router.push('/ResidentFiles')}>
                    <Text style={styles.addUserBtnText}>+ Add New User</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or email..."
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <View style={styles.tableWrapper}>
                {renderHeader()}
                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={filteredUsers}
                        keyExtractor={(item) => item.id}
                        renderItem={renderUserItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 60 },
    topSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: '#111827' },
    subtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
    addUserBtn: { backgroundColor: '#111827', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    addUserBtnText: { color: '#FFF', fontWeight: '700' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 24, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 48, fontSize: 15 },
    tableWrapper: { flex: 1, backgroundColor: '#FFF', marginHorizontal: 24, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    columnHeader: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
    userRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    userNameText: { fontSize: 14, fontWeight: '700', color: '#111827' },
    userEmailText: { fontSize: 12, color: '#6B7280' },
    roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    roleBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
    statusIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 6, display: 'none' }, // Using text instead for mobile clarity
    statusText: { fontSize: 13, color: '#374151', fontWeight: '500' },
    actionBtn: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    actionBtnText: { fontSize: 11, fontWeight: '700' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#9CA3AF' }
});