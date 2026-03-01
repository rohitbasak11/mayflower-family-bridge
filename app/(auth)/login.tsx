import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import { supabase } from '../../lib/supabase';
import { currentUserAtom, Profile } from '../../store/atoms';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../constants/theme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [role, setRole] = useState<'family' | 'staff' | 'resident'>('family');

    const router = useRouter();
    const setCurrentUser = useSetAtom(currentUserAtom);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (authError) throw authError;

            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (profileError || !data) throw profileError || new Error('Profile not found');

            const profile = data as Profile;
            setCurrentUser(profile);

            if (profile.role === 'resident') {
                router.replace('/(resident)');
            } else if (profile.role === 'family') {
                router.replace('/(family)');
            } else if (profile.role === 'staff') {
                router.replace('/(admin)');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.topDecoration}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>mayflower</Text>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.roleHeader}>
                        <Text style={styles.roleText}>
                            {role === 'family' ? 'Family User' : role === 'staff' ? 'Staff User' : 'Resident User'} 👤
                        </Text>
                    </View>

                    <Text style={styles.loginTitle}>Login</Text>

                    <Input
                        label="Email address"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="email@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        secureTextEntry
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.signInButton}
                    />

                    <TouchableOpacity style={styles.forgotContainer}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.noAccountText}>Don't have an account?</Text>
                        <Button
                            title="Create Account"
                            variant="secondary"
                            onPress={() => router.push('/(auth)/register')} // Updated line
                            style={styles.createAccountButton}
                        />
                    </View>
                </View>

                {/* Test Account Helper */}
                <View style={styles.testHelper}>
                    <Text style={styles.testHelperTitle}>Dev Access:</Text>
                    <View style={styles.testHelperRow}>
                        <TouchableOpacity onPress={() => setEmail('family@test.com')}>
                            <Text style={styles.testHelperLink}>Family</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEmail('resident@test.com')}>
                            <Text style={styles.testHelperLink}>Resident</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEmail('staff@test.com')}>
                            <Text style={styles.testHelperLink}>Staff</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    topDecoration: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        ...theme.typography.h2,
        color: theme.colors.primary,
        fontWeight: '800',
        letterSpacing: -1,
    },
    formContainer: {
        paddingHorizontal: theme.spacing.xl,
        maxWidth: 450,
        width: '100%',
        alignSelf: 'center',
    },
    roleHeader: {
        alignSelf: 'center',
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.lg,
    },
    roleText: {
        ...theme.typography.bodySmallSemiBold,
        color: theme.colors.text.primary,
    },
    loginTitle: {
        ...theme.typography.h2,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        color: theme.colors.text.primary,
    },
    signInButton: {
        marginTop: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.primary,
        height: 54,
    },
    forgotContainer: {
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
    forgotText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
        textDecorationLine: 'underline',
    },
    footer: {
        marginTop: theme.spacing.xxxl,
        alignItems: 'center',
    },
    noAccountText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.tertiary,
        marginBottom: theme.spacing.md,
    },
    createAccountButton: {
        width: '100%',
        backgroundColor: '#E5E7EB',
        borderWidth: 0,
    },
    errorText: {
        ...theme.typography.bodySmall,
        color: theme.colors.error,
        textAlign: 'center',
        marginTop: theme.spacing.sm,
    },
    testHelper: {
        marginTop: theme.spacing.xxl,
        padding: theme.spacing.md,
        alignItems: 'center',
    },
    testHelperTitle: {
        ...theme.typography.caption,
        color: theme.colors.text.tertiary,
        marginBottom: theme.spacing.xs,
    },
    testHelperRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    testHelperLink: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '600',
    }
});
