import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 2;

export default function Gallery() {
    const router = useRouter();
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Activities', 'Dining', 'Garden', 'Medical'];

    useEffect(() => {
        loadGallery();
    }, []);

    const loadGallery = async () => {
        setLoading(true);
        // Using bypass cast for the gallery table
        const { data, error } = await (supabase.from('gallery' as any) as any)
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setImages(data);
        } else {
            // Mock data for UI development if table is empty
            setImages([
                { id: 1, url: 'https://images.unsplash.com/photo-1581579438747-1dc8c17bbce4', title: 'Morning Yoga', category: 'Activities' },
                { id: 2, url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74', title: 'Afternoon Tea', category: 'Dining' },
                { id: 3, url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289', title: 'Garden Walk', category: 'Garden' },
                { id: 4, url: 'https://images.unsplash.com/photo-1581056310663-81783060f951', title: 'Art Class', category: 'Activities' },
            ]);
        }
        setLoading(false);
    };

    const filteredImages = selectedCategory === 'All'
        ? images
        : images.filter(img => img.category === selectedCategory);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Resident Gallery</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Category Filter */}
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            style={[styles.catTab, selectedCategory === cat && styles.catTabActive]}
                        >
                            <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.galleryGrid} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator color="#111827" style={{ marginTop: 50 }} />
                ) : (
                    <View style={styles.masonryContainer}>
                        {filteredImages.map((item, index) => (
                            <TouchableOpacity key={item.id} style={styles.imageCard}>
                                <Image source={{ uri: item.url }} style={styles.photo} />
                                <View style={styles.photoOverlay}>
                                    <Text style={styles.photoTitle}>{item.title}</Text>
                                    <Text style={styles.photoDate}>2 hours ago</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
    backBtn: { width: 40 },
    backIcon: { fontSize: 24 },
    title: { fontSize: 20, fontWeight: '800', color: '#111827' },

    catScroll: { paddingHorizontal: 24, gap: 10, marginBottom: 20 },
    catTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6' },
    catTabActive: { backgroundColor: '#111827', borderColor: '#111827' },
    catText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    catTextActive: { color: '#FFFFFF' },

    galleryGrid: { paddingHorizontal: 20 },
    masonryContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    imageCard: { width: COLUMN_WIDTH, height: 220, borderRadius: 24, marginBottom: 20, overflow: 'hidden', backgroundColor: '#F3F4F6' },
    photo: { width: '100%', height: '100%', resizeMode: 'cover' },
    photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: 'rgba(0,0,0,0.3)' },
    photoTitle: { color: 'white', fontSize: 12, fontWeight: '700' },
    photoDate: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 }
});