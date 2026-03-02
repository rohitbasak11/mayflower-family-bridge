const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Feedback {
    id: string;
    user_id: string;
    content: string;
    category?: string;
    status: string;
    ai_category?: string;
    ai_priority?: string;
    ai_sentiment?: string;
    ai_summary?: string;
    ai_draft?: string;
    ai_confidence?: number;
    ai_processed_at?: string;
    response?: string;
    responded_at?: string;
    created_at: string;
}

export const api = {
    async getFeedback(status?: string): Promise<Feedback[]> {
        const url = new URL(`${API_BASE_URL}/feedback`);
        if (status) url.searchParams.append('status', status);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Failed to fetch feedback');
        return res.json();
    },

    async getFeedbackItem(id: string): Promise<Feedback> {
        const res = await fetch(`${API_BASE_URL}/feedback/${id}`);
        if (!res.ok) throw new Error('Failed to fetch feedback item');
        return res.json();
    },

    async updateStatus(id: string, status: string): Promise<Feedback> {
        const res = await fetch(`${API_BASE_URL}/feedback/${id}?status=${status}`, {
            method: 'PATCH',
        });
        if (!res.ok) throw new Error('Failed to update status');
        return res.json();
    },

    async submitResponse(id: string, response: string): Promise<Feedback> {
        const res = await fetch(`${API_BASE_URL}/feedback/${id}/response?response=${encodeURIComponent(response)}`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to submit response');
        return res.json();
    },

    async overrideField(id: string, field: string, value: string): Promise<void> {
        const res = await fetch(`${API_BASE_URL}/feedback/${id}/override?field_name=${field}&new_value=${encodeURIComponent(value)}`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to override field');
    }
};
