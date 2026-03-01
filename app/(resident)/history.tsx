import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAtomValue } from 'jotai';
import { currentUserAtom } from '../../store/atoms';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

export default function CreditHistory() {
    const currentUser = useAtomValue(currentUserAtom);
    const router = useRouter();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        if (!currentUser) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('credit_transactions')
            .select(`
                *,
                from_profile:from_user_id (full_name),
                to_profile:to_user_id (full_name)
            `)
            .or(`from_user_id.eq.${currentUser.id},to_user_id.eq.${currentUser.id}`)
            .order('created_at', { ascending: false });

        if (!error) setTransactions(data || []);
        setLoading(false);
    };

    const renderItem = ({ item }: { item: any }) => {
        const isOutgoing = item.from_user_id === currentUser?.id;
        const otherUser = isOutgoing ? item.to_profile?.full_name : item.from_profile?.full_name;

        return (
            <View style={styles.transactionCard}>
                <View style={styles.iconBox}>
                    <Text style={styles.iconText}>{isOutgoing ? '📤' : '📥'}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.description}>{item.description || 'Credit Transfer'}</Text>
                    <Text style={styles.peerText}>{isOutgoing ? 'To:' : 'From:'} {otherUser || 'System'}</Text>
                    <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={styles.amountContainer}>
                    <Text style={[styles.amount, isOutgoing ? styles.negative : styles.positive]}>
                        {isOutgoing ? '-' : '+'}{item.amount}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Credit History</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
    backIcon: { fontSize: 24, marginRight: 15 },
    title: { fontSize: 22, fontWeight: '800' },
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    transactionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    iconText: { fontSize: 20 },
    info: { flex: 1 },
    description: { fontSize: 15, fontWeight: '700', color: '#111827' },
    peerText: { fontSize: 13, color: '#6B7280', marginVertical: 2 },
    date: { fontSize: 11, color: '#9CA3AF' },
    amountContainer: { alignItems: 'flex-end' },
    amount: { fontSize: 16, fontWeight: '800' },
    positive: { color: '#10B981' },
    negative: { color: '#EF4444' },
    emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 100 }
});
