import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../constants/theme';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async () => {
        if (!email || !password || !fullName) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const cleanEmail = email.toLowerCase().trim();

            // 1. Check if the email was pre-registered by an Admin
            // Using maybeSingle() prevents an error being thrown if the user isn't found
            const { data: existingProfile, error: checkError } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', cleanEmail)
                .maybeSingle();

            if (checkError) throw checkError;

            // 2. Proceed with Supabase Auth Sign Up
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: cleanEmail,
                password,
            });

            if (signUpError) throw signUpError;

            if (authData.user) {
                // Cast to any to avoid "Property role does not exist on type never"
                const profile = existingProfile as any;

                if (profile) {
                    // 3a. Update the PRE-EXISTING profile with the new Auth ID
                    const { error: updateError } = await (supabase
                        .from('profiles') as any)
                        .update({
                            id: authData.user.id,
                            full_name: fullName,
                            status: 'active'
                        } as any)
                        .eq('email', cleanEmail);

                    if (updateError) throw updateError;

                    // Route based on their pre-assigned role
                    const route = profile.role === 'resident' ? '/(resident)' : '/(family)';
                    router.replace(route as any);
                } else {
                    // 3b. No pre-existing profile: Create a standard FAMILY profile
                    const { error: profileError } = await (supabase
                        .from('profiles') as any)
                        .insert({
                            id: authData.user.id,
                            full_name: fullName,
                            email: cleanEmail,
                            role: 'family',
                            credits: 0,
                            status: 'active'
                        } as any);

                    if (profileError) throw profileError;
                    router.replace('/(family)');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Family Bridge to stay connected</Text>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <Input label="Full Name" value={fullName} onChangeText={setFullName} placeholder="John Doe" />
                    <Input label="Email" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
                    <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

                    <Button title="Sign Up" onPress={handleRegister} loading={loading} style={styles.button} />

                    <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Already have an account? Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.xl },
    formContainer: { width: '100%', maxWidth: 400, alignSelf: 'center' },
    title: { ...theme.typography.h1, color: theme.colors.text.primary, marginBottom: theme.spacing.xs },
    subtitle: { ...theme.typography.body, color: theme.colors.text.secondary, marginBottom: theme.spacing.xl },
    button: { marginTop: theme.spacing.lg },
    errorText: { color: theme.colors.error, marginBottom: theme.spacing.md, ...theme.typography.bodySmall, textAlign: 'center' },
    backButton: { marginTop: theme.spacing.xl, alignItems: 'center' },
    backButtonText: { ...theme.typography.bodySmall, color: theme.colors.primary, fontWeight: '600' },
});