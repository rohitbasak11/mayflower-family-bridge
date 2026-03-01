import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';

export default function ManageServices() {
    const router = useRouter();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State for Adding/Editing
    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cost_credits: '',
        category: 'Care'
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('name', { ascending: true });

        if (!error) setServices(data || []);
        setLoading(false);
    };

    const handleSaveService = async () => {
        if (!formData.name || !formData.cost_credits) {
            Alert.alert("Error", "Please fill in Name and Cost.");
            return;
        }

        const payload = {
            name: formData.name,
            description: formData.description,
            cost_credits: parseInt(formData.cost_credits),
            category: formData.category,
            available: true
        };

        // Inside handleSaveService (around line 50)
        let error;
        const servicesTable = supabase.from('services') as any; // Cast once here

        if (editingService) {
            const { error: err } = await servicesTable
                .update(payload as any)
                .eq('id', editingService.id);
            error = err;
        } else {
            const { error: err } = await servicesTable
                .insert(payload as any);
            error = err;
        }

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            setModalVisible(false);
            resetForm();
            fetchServices();
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', cost_credits: '', category: 'Care' });
        setEditingService(null);
    };

    const openEdit = (service: any) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            cost_credits: service.cost_credits.toString(),
            category: service.category || 'Care'
        });
        setModalVisible(true);
    };

    const renderServiceItem = ({ item }: { item: any }) => (
        <View style={styles.serviceRow}>
            <View style={{ flex: 2 }}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceCategory}>{item.category}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.costText}>{item.cost_credits} Credits</Text>
            </View>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <View>
                    <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>← Back</Text></TouchableOpacity>
                    <Text style={styles.title}>Manage Services</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => { resetForm(); setModalVisible(true); }}
                >
                    <Text style={styles.addBtnText}>+ New Service</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tableWrapper}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.columnHeader, { flex: 2 }]}>Service Name</Text>
                    <Text style={[styles.columnHeader, { flex: 1 }]}>Cost</Text>
                    <Text style={[styles.columnHeader, { flex: 0.5, textAlign: 'right' }]}>Action</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={services}
                        keyExtractor={(item) => item.id}
                        renderItem={renderServiceItem}
                        ListEmptyComponent={<Text style={styles.emptyText}>No services defined yet.</Text>}
                    />
                )}
            </View>

            {/* ADD/EDIT MODAL */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'Add New Service'}</Text>

                        <Text style={styles.label}>Service Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(t) => setFormData({ ...formData, name: t })}
                            placeholder="e.g. Physiotherapy"
                        />

                        <Text style={styles.label}>Cost (Credits)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.cost_credits}
                            onChangeText={(t) => setFormData({ ...formData, cost_credits: t })}
                            keyboardType="numeric"
                            placeholder="e.g. 50"
                        />

                        <Text style={styles.label}>Category</Text>
                        <View style={styles.catRow}>
                            {['Care', 'Dining', 'Activity', 'Maintenance'].map(c => (
                                <TouchableOpacity
                                    key={c}
                                    style={[styles.catBtn, formData.category === c && styles.catBtnActive]}
                                    onPress={() => setFormData({ ...formData, category: c })}
                                >
                                    <Text style={[styles.catBtnText, formData.category === c && { color: '#FFF' }]}>{c}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveService}>
                                <Text style={styles.saveBtnText}>Save Service</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 60 },
    topSection: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 24 },
    backBtn: { color: theme.colors.primary, marginBottom: 4, fontWeight: '600' },
    title: { fontSize: 24, fontWeight: '800' },
    addBtn: { backgroundColor: '#111827', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    addBtnText: { color: '#FFF', fontWeight: '700' },
    tableWrapper: { flex: 1, backgroundColor: '#FFF', marginHorizontal: 24, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 30, overflow: 'hidden' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    columnHeader: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
    serviceRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    serviceName: { fontSize: 15, fontWeight: '700', color: '#111827' },
    serviceCategory: { fontSize: 12, color: '#6B7280' },
    costText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary },
    editBtn: { padding: 8 },
    editBtnText: { color: '#3B82F6', fontWeight: '600', fontSize: 13 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#9CA3AF' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },
    label: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' },
    input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16 },
    catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
    catBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F3F4F6' },
    catBtnActive: { backgroundColor: theme.colors.primary },
    catBtnText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    cancelBtn: { padding: 12 },
    saveBtn: { backgroundColor: '#111827', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
    saveBtnText: { color: '#FFF', fontWeight: '700' }
});