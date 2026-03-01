import { Stack } from 'expo-router';

export default function FamilyLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="book-service" />
            <Stack.Screen name="schedule" />
            <Stack.Screen name="chat" />
            <Stack.Screen name="vitals" />
        </Stack>
    );
}
