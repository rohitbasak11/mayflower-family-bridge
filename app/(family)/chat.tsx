import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import * as ImagePicker from 'expo-image-picker';
import { currentUserAtom, messagesAtom } from '../../store/atoms';
import { supabase } from '../../lib/supabase';

export default function Chat() {
    const currentUser = useAtomValue(currentUserAtom);
    const globalMessages = useAtomValue(messagesAtom);
    const router = useRouter();

    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        loadContacts();
    }, []);

    useEffect(() => {
        if (selectedContactId) {
            loadMessages(selectedContactId);
        }
    }, [selectedContactId]);

    // Real-time update logic
    useEffect(() => {
        if (selectedContactId && currentUser) {
            const filtered = globalMessages.filter(m =>
                (m.sender_id === (currentUser as any).id && m.recipient_id === selectedContactId) ||
                (m.sender_id === selectedContactId && m.recipient_id === (currentUser as any).id)
            );
            setMessages(filtered);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [globalMessages, selectedContactId]);

    const loadContacts = async () => {
        const { data } = await (supabase.from('profiles' as any) as any)
            .select('id, full_name, role, avatar_url')
            .neq('id', (currentUser as any)?.id);

        if (data) {
            setContacts(data);
            if (data.length > 0 && !selectedContactId) setSelectedContactId(data[0].id);
        }
        setLoading(false);
    };

    const loadMessages = async (contactId: string) => {
        if (!currentUser) return;
        const { data } = await (supabase.from('messages' as any) as any)
            .select('*')
            .or(`and(sender_id.eq.${(currentUser as any).id},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${(currentUser as any).id})`)
            .order('created_at', { ascending: true });

        if (data) setMessages(data);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 200);
    };

    const handleSendMessage = async (imageUrl?: string) => {
        if (!currentUser || !selectedContactId) return;

        // Ensure there is either text or an image to send
        const messageContent = newMessage.trim();
        if (!messageContent && !imageUrl) return;

        setNewMessage(''); // Clear input immediately for UX

        const { error } = await (supabase.from('messages' as any) as any).insert({
            sender_id: (currentUser as any).id,
            recipient_id: selectedContactId,
            content: imageUrl && !messageContent ? 'Sent a photo' : messageContent,
            image_url: imageUrl || null
        } as any);

        if (error) {
            Alert.alert("Error sending message", error.message);
        }
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.6, // Compressed for faster upload
        });

        if (!result.canceled && result.assets[0].uri) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        try {
            setUploading(true);

            // Format file for Supabase
            const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `chat/${fileName}`;

            // Convert URI to Blob (Essential for Expo 51)
            const response = await fetch(uri);
            const blob = await response.blob();

            const { error: uploadError } = await supabase.storage
                .from('chat-photos')
                .upload(filePath, blob, {
                    contentType: `image/${fileExt}`,
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get URL
            const { data: { publicUrl } } = supabase.storage
                .from('chat-photos')
                .getPublicUrl(filePath);

            await handleSendMessage(publicUrl);
        } catch (error: any) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', error.message || 'Could not upload photo.');
        } finally {
            setUploading(false);
        }
    };

    const selectedContact = contacts.find(c => c.id === selectedContactId);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Messages</Text>
                    {selectedContact && <Text style={styles.headerSub}>{selectedContact.full_name}</Text>}
                </View>
                <TouchableOpacity style={styles.galleryBtn} onPress={() => router.push('/gallery')}>
                    <Text style={styles.galleryIcon}>🖼️</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.contactsWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contactsContent}>
                    {contacts.map(contact => (
                        <TouchableOpacity
                            key={contact.id}
                            onPress={() => setSelectedContactId(contact.id)}
                            style={[styles.contactCircle, selectedContactId === contact.id && styles.activeCircle]}
                        >
                            <Image
                                source={{ uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.full_name}` }}
                                style={styles.contactImg}
                            />
                            {selectedContactId === contact.id && <View style={styles.onlineBadge} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.chatArea}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator color="#111827" style={{ marginTop: 20 }} />
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender_id === (currentUser as any)?.id;
                        return (
                            <View key={msg.id || idx} style={[styles.bubbleWrapper, isMe ? styles.myWrapper : styles.theirWrapper]}>
                                <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                                    {msg.image_url && (
                                        <Image source={{ uri: msg.image_url }} style={styles.messageImage} />
                                    )}
                                    {msg.content !== 'Sent a photo' || !msg.image_url ? (
                                        <Text style={[styles.msgText, isMe ? styles.myText : styles.theirText]}>
                                            {msg.content}
                                        </Text>
                                    ) : null}
                                </View>
                                <Text style={styles.timeText}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            <View style={styles.inputBar}>
                <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage} disabled={uploading}>
                    <Text style={styles.attachIcon}>{uploading ? '⌛' : '+'}</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendBtn, (!newMessage.trim() && !uploading) && styles.sendBtnDim]}
                    onPress={() => handleSendMessage()}
                    disabled={!newMessage.trim() || uploading}
                >
                    <Text style={styles.sendIcon}>➔</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
    backBtn: { width: 40 },
    backIcon: { fontSize: 24 },
    headerInfo: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '800' },
    headerSub: { fontSize: 12, color: '#6366F1', fontWeight: '600' },
    galleryBtn: { width: 40, alignItems: 'flex-end' },
    galleryIcon: { fontSize: 20 },
    contactsWrapper: { paddingVertical: 15, backgroundColor: '#FFFFFF' },
    contactsContent: { paddingHorizontal: 24, gap: 15 },
    contactCircle: { width: 56, height: 56, borderRadius: 28, padding: 3, borderWidth: 2, borderColor: 'transparent' },
    activeCircle: { borderColor: '#6366F1' },
    contactImg: { width: '100%', height: '100%', borderRadius: 25, backgroundColor: '#F3F4F6' },
    onlineBadge: { position: 'absolute', right: 2, bottom: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFF' },
    chatArea: { flex: 1, backgroundColor: '#F9FAFB' },
    chatContent: { padding: 20 },
    bubbleWrapper: { marginBottom: 15, maxWidth: '85%' },
    myWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    theirWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    bubble: { padding: 14, borderRadius: 20 },
    myBubble: { backgroundColor: '#111827', borderBottomRightRadius: 4 },
    theirBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F3F4F6' },
    messageImage: { width: 220, height: 160, borderRadius: 12, marginBottom: 8, resizeMode: 'cover' },
    msgText: { fontSize: 14, lineHeight: 20 },
    myText: { color: '#FFFFFF' },
    theirText: { color: '#111827' },
    timeText: { fontSize: 10, color: '#9CA3AF', marginTop: 4, fontWeight: '600' },
    inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingBottom: Platform.OS === 'ios' ? 35 : 15 },
    attachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    attachIcon: { fontSize: 20, color: '#6B7280' },
    input: { flex: 1, marginHorizontal: 12, backgroundColor: '#F9FAFB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
    sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
    sendBtnDim: { opacity: 0.3 },
    sendIcon: { color: '#FFF', fontSize: 18 }
});