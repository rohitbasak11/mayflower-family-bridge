import { Stack } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminLayout() {
    return (
        <View style={styles.container}>
            {Platform.OS === 'web' && <AdminSidebar />}
            <View style={styles.content}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="ManageUsers" />
                    <Stack.Screen name="ManageServices" />
                    <Stack.Screen name="BookingRequests" />
                    <Stack.Screen name="ResidentFiles" />
                    <Stack.Screen name="FeedbackManagement" />
                    <Stack.Screen name="ConsentRecords" />
                </Stack>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
    },
    content: {
        flex: 1,
    },
});

