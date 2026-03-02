'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface ResponseEditorProps {
    feedbackId: string;
    initialDraft?: string;
    onSent: () => void;
}

export default function ResponseEditor({ feedbackId, initialDraft, onSent }: ResponseEditorProps) {
    const [response, setResponse] = useState(initialDraft || '');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!response.trim()) return;
        setSending(true);
        try {
            await api.submitResponse(feedbackId, response);
            onSent();
        } catch (error) {
            console.error('Failed to send response:', error);
            alert('Failed to send response');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                    Final Response
                </label>
                <textarea
                    rows={4}
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-600 focus:border-blue-600 p-4 text-gray-800 leading-relaxed"
                />
            </div>

            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                    Draft carefully. This response will be visible to the resident and their family.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => setResponse(initialDraft || '')}
                        className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 font-medium"
                    >
                        Reset to Draft
                    </button>
                    <button
                        disabled={sending || !response.trim()}
                        onClick={handleSend}
                        className={`bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all ${(sending || !response.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {sending ? 'Sending...' : 'Send Response'}
                    </button>
                </div>
            </div>
        </div>
    );
}
