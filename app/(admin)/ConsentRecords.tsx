import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';

export default function ConsentRecords() {
    const router = useRouter();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchConsents();
    }, []);

    const fetchConsents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('consents')
            .select(`
                *,
                profiles:resident_id (full_name, room_number)
            `)
            .order('created_at', { ascending: false });

        if (!error) setRecords(data || []);
        setLoading(false);
    };

    const filteredRecords = records.filter(r =>
        r.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.document_name?.toLowerCase().includes(search.toLowerCase())
    );

    const renderRecord = ({ item }: { item: any }) => (
        <View style={styles.recordRow}>
            <View style={{ flex: 2 }}>
                <Text style={styles.residentName}>{item.profiles?.full_name}</Text>
                <Text style={styles.roomText}>Room {item.profiles?.room_number}</Text>
            </View>
            <View style={{ flex: 2 }}>
                <Text style={styles.docName}>{item.document_name}</Text>
                <Text style={styles.dateText}>
                    {item.status === 'signed'
                        ? `Signed: ${new Date(item.signed_at).toLocaleDateString()}`
                        : 'Awaiting Signature'}
                </Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <View style={[styles.statusBadge, item.status === 'signed' ? styles.signedBg : styles.pendingBg]}>
                    <Text style={[styles.statusText, { color: item.status === 'signed' ? '#065F46' : '#92400E' }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>← Back</Text></TouchableOpacity>
                <Text style={styles.title}>Consent Records</Text>
            </View>

            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by resident or document..."
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <View style={styles.tableCard}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.colLabel, { flex: 2 }]}>Resident</Text>
                    <Text style={[styles.colLabel, { flex: 2 }]}>Document</Text>
                    <Text style={[styles.colLabel, { flex: 1, textAlign: 'right' }]}>Status</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={filteredRecords}
                        keyExtractor={(item) => item.id}
                        renderItem={renderRecord}
                        ListEmptyComponent={<Text style={styles.emptyText}>No consent records found.</Text>}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 60 },
    header: { paddingHorizontal: 24, marginBottom: 20 },
    backBtn: { color: theme.colors.primary, fontWeight: '700', marginBottom: 8 },
    title: { fontSize: 24, fontWeight: '800', color: '#111827' },
    searchBar: { backgroundColor: '#FFF', marginHorizontal: 24, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20 },
    searchInput: { height: 45, fontSize: 14 },
    tableCard: { flex: 1, backgroundColor: '#FFF', marginHorizontal: 24, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 30, overflow: 'hidden' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    colLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
    recordRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    residentName: { fontSize: 14, fontWeight: '700', color: '#111827' },
    roomText: { fontSize: 12, color: '#6B7280' },
    docName: { fontSize: 14, fontWeight: '600', color: '#374151' },
    dateText: { fontSize: 11, color: '#9CA3AF' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    signedBg: { backgroundColor: '#D1FAE5' },
    pendingBg: { backgroundColor: '#FEF3C7' },
    statusText: { fontSize: 10, fontWeight: '800' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#9CA3AF' }
});