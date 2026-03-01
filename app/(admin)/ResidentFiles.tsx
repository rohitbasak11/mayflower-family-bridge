import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Alert, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';
import { useRouter } from 'expo-router';

export default function ResidentFiles() {
    const router = useRouter();
    const [residents, setResidents] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Registration Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newResident, setNewResident] = useState({
        name: '',
        room: '',
        residentEmail: '',
        familyEmails: [''],
    });

    useEffect(() => {
        fetchResidents();
    }, []);

    const fetchResidents = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'resident')
                .order('full_name', { ascending: true });

            if (error) throw error;
            setResidents(data || []);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const addFamilyField = () => {
        setNewResident({ ...newResident, familyEmails: [...newResident.familyEmails, ''] });
    };

    const updateFamilyEmail = (text: string, index: number) => {
        const updated = [...newResident.familyEmails];
        updated[index] = text;
        setNewResident({ ...newResident, familyEmails: updated });
    };

    const handleRegister = async () => {
        if (!newResident.name || !newResident.residentEmail) {
            Alert.alert("Error", "Name and Resident Email are required.");
            return;
        }

        setSaving(true);
        try {
            // 1. Create the Resident Profile - Now works without Auth ID thanks to schema update
            const { error: resError } = await (supabase.from('profiles') as any).insert({
                full_name: newResident.name,
                email: newResident.residentEmail.toLowerCase(),
                role: 'resident',
                room_number: newResident.room,
                status: 'active' // Set as active immediately, claimant will link ID later
            });

            if (resError) throw resError;

            // 2. Create Pre-registered Family Profiles
            const familyEntries = newResident.familyEmails
                .filter(email => email.trim() !== '')
                .map(email => ({
                    email: email.toLowerCase(),
                    role: 'family',
                    status: 'active'
                }));

            if (familyEntries.length > 0) {
                const { error: famError } = await (supabase.from('profiles') as any).insert(familyEntries);
                if (famError) throw famError;
            }

            Alert.alert("Success", "Resident and Family members pre-registered!");
            setShowAddModal(false);
            setNewResident({ name: '', room: '', residentEmail: '', familyEmails: [''] });
            fetchResidents();
        } catch (err: any) {
            Alert.alert("Registration Error", err.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredResidents = residents.filter(r =>
        r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.room_number?.includes(search)
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Resident Directory</Text>
                    <Text style={styles.subtitle}>Current living residents and their care status</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                    <Text style={styles.addBtnText}>+ Register Resident</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchBarContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search by name or room number..."
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#111827" />
                    <Text style={styles.loadingText}>Loading directory...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredResidents}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.residentCard}>
                            <View style={styles.avatarBox}>
                                <Text style={styles.avatarText}>{item.full_name?.charAt(0)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.nameText}>{item.full_name}</Text>
                                <View style={styles.roomRow}>
                                    <View style={styles.roomBadge}>
                                        <Text style={styles.roomText}>Room {item.room_number || 'N/A'}</Text>
                                    </View>
                                    <Text style={styles.emailText}>{item.email}</Text>
                                </View>
                            </View>
                            <View style={styles.statusBox}>
                                <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? '#10B981' : '#F59E0B' }]} />
                                <Text style={styles.statusLabel}>{item.status || 'Active'}</Text>
                            </View>
                        </View>
                    )}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>No residents found matching your search.</Text>
                        </View>
                    }
                />
            )}

            {/* Registration Modal */}
            <Modal visible={showAddModal} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Register New Resident</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Text style={styles.closeIcon}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 32 }}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter full name"
                                value={newResident.name}
                                onChangeText={t => setNewResident({ ...newResident, name: t })}
                            />

                            <Text style={styles.label}>Room Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 204"
                                value={newResident.room}
                                onChangeText={t => setNewResident({ ...newResident, room: t })}
                            />

                            <Text style={styles.label}>Resident Email</Text>
                            <Text style={styles.helperText}>This will be their login username.</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="email-address"
                                placeholder="resident@email.com"
                                value={newResident.residentEmail}
                                onChangeText={t => setNewResident({ ...newResident, residentEmail: t })}
                            />

                            <View style={styles.divider} />
                            <Text style={styles.sectionLabel}>Authorized Family Members</Text>
                            <Text style={styles.helperText}>Pre-register family emails to grant them access.</Text>

                            {newResident.familyEmails.map((email, idx) => (
                                <TextInput
                                    key={idx}
                                    style={styles.input}
                                    placeholder={`Family Member ${idx + 1} Email`}
                                    value={email}
                                    onChangeText={t => updateFamilyEmail(t, idx)}
                                />
                            ))}

                            <TouchableOpacity style={styles.addLink} onPress={addFamilyField}>
                                <Text style={styles.addLinkText}>+ Add Another Family Member</Text>
                            </TouchableOpacity>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                                    <Text style={styles.cancelBtnText}>Discard</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleRegister} disabled={saving}>
                                    {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Register Now</Text>}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingTop: 32, marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, fontWeight: '500' },
    addBtn: { backgroundColor: '#111827', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

    searchBarContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 32, backgroundColor: '#FFF', paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 24 },
    searchIcon: { fontSize: 16, marginRight: 12 },
    searchBar: { flex: 1, height: 48, fontSize: 14, fontWeight: '500' },

    list: { paddingHorizontal: 32, paddingBottom: 40 },
    residentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
    avatarBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    avatarText: { fontSize: 16, fontWeight: '800', color: '#111827' },
    nameText: { fontWeight: '800', fontSize: 15, color: '#111827', marginBottom: 4 },
    roomRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    roomBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    roomText: { fontSize: 10, fontWeight: '800', color: '#374151' },
    emailText: { color: '#9CA3AF', fontSize: 12, fontWeight: '500' },
    statusBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F9FAFB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusLabel: { fontSize: 10, fontWeight: '700', color: '#374151', textTransform: 'capitalize' },

    loadingContainer: { marginTop: 100, alignItems: 'center' },
    loadingText: { marginTop: 16, color: '#6B7280', fontWeight: '600' },
    emptyBox: { marginTop: 60, alignItems: 'center' },
    emptyText: { color: '#9CA3AF', fontWeight: '500' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFF', borderRadius: 32, width: Platform.OS === 'web' ? 500 : '100%', maxHeight: '90%', overflow: 'hidden', elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 30 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, paddingTop: 32, paddingBottom: 0 },
    modalTitle: { fontSize: 22, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
    closeIcon: { fontSize: 20, color: '#9CA3AF' },
    label: { fontSize: 12, fontWeight: '800', color: '#111827', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    helperText: { fontSize: 11, color: '#9CA3AF', marginBottom: 12, marginTop: -4 },
    sectionLabel: { fontSize: 14, fontWeight: '900', marginBottom: 8, color: '#111827' },
    input: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 14, marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6', fontSize: 14, fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 24 },
    addLink: { marginBottom: 32 },
    addLinkText: { color: '#6366F1', fontWeight: '700', fontSize: 13 },
    modalActions: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, padding: 16, alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB' },
    cancelBtnText: { fontWeight: '700', color: '#374151' },
    saveBtn: { flex: 2, padding: 16, alignItems: 'center', backgroundColor: '#111827', borderRadius: 14 },
    saveBtnText: { color: '#FFF', fontWeight: '700' }
});