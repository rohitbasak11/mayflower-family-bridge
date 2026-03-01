export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    role: 'resident' | 'family' | 'staff'
                    credits: number
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role: 'resident' | 'family' | 'staff'
                    credits?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'resident' | 'family' | 'staff'
                    credits?: number
                    created_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    content: string
                    sender_id: string
                    recipient_id: string | null
                    role_target: 'resident' | 'family' | 'staff' | null
                    created_at: string
                    read: boolean
                }
                Insert: {
                    id?: string
                    content: string
                    sender_id: string
                    recipient_id?: string | null
                    role_target?: 'resident' | 'family' | 'staff' | null
                    created_at?: string
                    read?: boolean
                }
                Update: {
                    id?: string
                    content?: string
                    sender_id?: string
                    recipient_id?: string | null
                    role_target?: 'resident' | 'family' | 'staff' | null
                    created_at?: string
                    read?: boolean
                }
            }
            credit_transactions: {
                Row: {
                    id: string
                    amount: number
                    from_user_id: string
                    to_user_id: string
                    type: 'gift' | 'service_payment' | 'refund'
                    description: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    amount: number
                    from_user_id: string
                    to_user_id: string
                    type?: 'gift' | 'service_payment' | 'refund'
                    description?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    amount?: number
                    from_user_id?: string
                    to_user_id?: string
                    type?: 'gift' | 'service_payment' | 'refund'
                    description?: string | null
                    created_at?: string
                }
            }
            services: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    cost_credits: number
                    category: string | null
                    available: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    cost_credits: number
                    category?: string | null
                    available?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    cost_credits?: number
                    category?: string | null
                    available?: boolean
                    created_at?: string
                }
            }
            bookings: {
                Row: {
                    id: string
                    resident_id: string
                    service_id: string
                    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
                    scheduled_for: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    resident_id: string
                    service_id: string
                    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
                    scheduled_for?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    resident_id?: string
                    service_id?: string
                    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
                    scheduled_for?: string | null
                    created_at?: string
                }
            }
            feedback: {
                Row: {
                    id: string
                    user_id: string
                    category: 'Dining' | 'Temperature' | 'Activity' | 'Staff' | 'General' | null
                    content: string
                    status: 'new' | 'resolved'
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    category?: 'Dining' | 'Temperature' | 'Activity' | 'Staff' | 'General' | null
                    content: string
                    status?: 'new' | 'resolved'
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    category?: 'Dining' | 'Temperature' | 'Activity' | 'Staff' | 'General' | null
                    content?: string
                    status?: 'new' | 'resolved'
                    created_at?: string
                }
            }
        }
    }
}
