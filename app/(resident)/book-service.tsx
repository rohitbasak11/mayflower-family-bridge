import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { currentUserAtom } from '../../store/atoms';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';

const CATEGORIES = ['All', 'Health', 'Therapy', 'Daily Living', 'Transport'];

export default function BookService() {
    const currentUser = useAtomValue(currentUserAtom);
    const router = useRouter();
    const [services, setServices] = useState<any[]>([]);
    const [filteredServices, setFilteredServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        const { data } = await (supabase.from('services' as any) as any).select('*').eq('available', true);
        if (data) {
            setServices(data);
            setFilteredServices(data);
        }
        setLoading(false);
    };

    const handleBookService = async (service: any) => {
        if (!currentUser) return;

        if ((currentUser.credits || 0) < service.cost_credits) {
            Alert.alert('Insufficient Credits', 'Please ask your family to send more credits.');
            return;
        }

        setBooking(true);
        try {
            const { error } = await (supabase.from('bookings' as any) as any)
                .insert({
                    resident_id: currentUser.id,
                    service_id: service.id,
                    status: 'pending',
                    scheduled_for: new Date(Date.now() + 86400000).toISOString(),
                } as any);

            if (error) throw error;
            Alert.alert('Success', `Request for ${service.name} sent!`);
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setBooking(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Activities & Services</Text>
            </View>

            <ScrollView style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#111827" style={{ marginTop: 50 }} />
                ) : (
                    filteredServices.map(service => (
                        <View key={service.id} style={styles.card}>
                            <View style={styles.cardTop}>
                                <View style={styles.info}>
                                    <Text style={styles.name}>{service.name}</Text>
                                    <Text style={styles.desc}>{service.description}</Text>
                                </View>
                                <View style={styles.priceTag}>
                                    <Text style={styles.priceText}>{service.cost_credits} Cr</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.btn}
                                onPress={() => handleBookService(service)}
                                disabled={booking}
                            >
                                <Text style={styles.btnText}>{booking ? '...' : 'Book Activity'}</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
    backIcon: { fontSize: 24, marginRight: 15 },
    title: { fontSize: 22, fontWeight: '800' },
    content: { paddingHorizontal: 20 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#F3F4F6' },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '800' },
    desc: { fontSize: 12, color: '#6B7280', marginTop: 4 },
    priceTag: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    priceText: { color: '#16A34A', fontWeight: '800', fontSize: 12 },
    btn: { backgroundColor: '#111827', padding: 12, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#FFFFFF', fontWeight: '800' }
});
