import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { currentUserAtom, selectedResidentIdAtom } from '../../store/atoms';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Health', 'Therapy', 'Daily Living', 'Transport'];

export default function BookService() {
    const currentUser = useAtomValue(currentUserAtom);
    const selectedResidentId = useAtomValue(selectedResidentIdAtom);
    const router = useRouter();
    const [services, setServices] = useState<any[]>([]);
    const [filteredServices, setFilteredServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        // Using bypass cast to avoid 'never' type issues
        const { data, error } = await (supabase.from('services' as any) as any)
            .select('*')
            .eq('available', true);

        if (data) {
            setServices(data);
            setFilteredServices(data);
        }
        setLoading(false);
    };

    const filterServices = (category: string, query: string) => {
        let filtered = services;
        if (category !== 'All') {
            filtered = filtered.filter(s => s.category === category);
        }
        if (query) {
            filtered = filtered.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
        }
        setFilteredServices(filtered);
    };

    const handleBookService = async (service: any) => {
        if (!currentUser) return;
        setBooking(true);
        try {
            const targetResidentId = currentUser.role === 'family' ? selectedResidentId : currentUser.id;

            if (!targetResidentId) {
                Alert.alert('Error', 'Please select a resident first on the home screen.');
                return;
            }

            const { error } = await (supabase.from('bookings' as any) as any)
                .insert({
                    resident_id: targetResidentId,
                    service_id: service.id,
                    status: 'pending',
                    scheduled_for: new Date(Date.now() + 86400000).toISOString(),
                } as any);

            if (error) throw error;
            Alert.alert('Success', `Booking request for ${service.name} has been sent!`);
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to book service');
        } finally {
            setBooking(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Book a Service</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for services..."
                    value={searchQuery}
                    onChangeText={(txt) => {
                        setSearchQuery(txt);
                        filterServices(selectedCategory, txt);
                    }}
                />
            </View>

            {/* Categories Scroll */}
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catList} contentContainerStyle={styles.catListContent}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.catTab, selectedCategory === cat && styles.catTabActive]}
                            onPress={() => {
                                setSelectedCategory(cat);
                                filterServices(cat, searchQuery);
                            }}
                        >
                            <Text style={[styles.catTabText, selectedCategory === cat && styles.catTabTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.serviceList} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#111827" style={{ marginTop: 50 }} />
                ) : (
                    filteredServices.map((service) => (
                        <View key={service.id} style={styles.serviceCard}>
                            <View style={styles.serviceTop}>
                                <View style={styles.iconPlaceholder}>
                                    <Text style={styles.serviceIcon}>
                                        {service.category === 'Health' ? '🩺' : service.category === 'Therapy' ? '🧘' : '🛠️'}
                                    </Text>
                                </View>
                                <View style={styles.serviceInfo}>
                                    <Text style={styles.serviceName}>{service.name}</Text>
                                    <Text style={styles.serviceMeta}>{service.description || 'Professional Care Service'}</Text>
                                    <Text style={styles.serviceTime}>📅 Mon | Wed | Fri  •  30 mins</Text>
                                </View>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceText}>{service.cost_credits} Credits</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.bookBtn}
                                onPress={() => handleBookService(service)}
                                disabled={booking}
                            >
                                <Text style={styles.bookBtnText}>{booking ? 'Requesting...' : 'Book Now'}</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 10 },
    backButton: { marginRight: 15 },
    backIcon: { fontSize: 24 },
    title: { fontSize: 20, fontWeight: '800' },
    searchSection: { padding: 20 },
    searchInput: { backgroundColor: '#F9FAFB', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', fontSize: 14 },
    catList: { marginBottom: 10 },
    catListContent: { paddingHorizontal: 20, gap: 10 },
    catTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6' },
    catTabActive: { backgroundColor: '#111827', borderColor: '#111827' },
    catTabText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
    catTabTextActive: { color: '#FFFFFF' },
    serviceList: { paddingHorizontal: 20 },
    serviceCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#F3F4F6', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
    serviceTop: { flexDirection: 'row', gap: 12, marginBottom: 15 },
    iconPlaceholder: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
    serviceIcon: { fontSize: 20 },
    serviceInfo: { flex: 1 },
    serviceName: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
    serviceMeta: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
    serviceTime: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
    priceContainer: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, height: 24 },
    priceText: { color: '#16A34A', fontSize: 10, fontWeight: '800' },
    bookBtn: { backgroundColor: '#111827', padding: 12, borderRadius: 12, alignItems: 'center' },
    bookBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 }
});