import { Redirect } from 'expo-router';
import { useAtomValue } from 'jotai';
import { currentUserAtom } from '../store/atoms';

export default function Index() {
    const currentUser = useAtomValue(currentUserAtom);

    // Redirect based on authentication status and role
    if (!currentUser) {
        return <Redirect href="/(auth)/login" />;
    }

    if (currentUser.role === 'resident') {
        return <Redirect href="/(resident)" />;
    } else if (currentUser.role === 'family') {
        return <Redirect href="/(family)" />;
    } else if (currentUser.role === 'staff') {
        return <Redirect href="/(admin)" />;
    }

    return <Redirect href="/(auth)/login" />;
}
