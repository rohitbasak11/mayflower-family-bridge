'use client';

import { useState, useEffect } from 'react';
import { api, Feedback } from '@/lib/api';
import FeedbackDetail from '@/components/feedback/FeedbackDetail';

export default function AdminFeedbackPage() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('');
    const [selectedItem, setSelectedItem] = useState<Feedback | null>(null);

    useEffect(() => {
        loadFeedback();
    }, [filter]);

    const loadFeedback = async () => {
        setLoading(true);
        try {
            const data = await api.getFeedback(filter || undefined);
            setFeedback(data);

            // Re-select item if it was updated
            if (selectedItem) {
                const refreshed = data.find(i => i.id === selectedItem.id);
                if (refreshed) setSelectedItem(refreshed);
            }
        } catch (error) {
            console.error('Error loading feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await api.updateStatus(id, newStatus);
            loadFeedback();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Feedback Intelligence</h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage resident voices amplified by AI analysis.</p>
                </div>

                <div className="flex gap-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border-gray-200 rounded-xl px-4 py-2 bg-white shadow-sm font-medium focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Feedbacks</option>
                        <option value="submitted">New Entries</option>
                        <option value="ai_processed">AI Analyzed</option>
                        <option value="responded">Completed</option>
                    </select>
                    <button
                        onClick={loadFeedback}
                        className="bg-white border-2 border-gray-100 text-gray-700 px-5 py-2 rounded-xl hover:bg-gray-50 transition-all font-bold shadow-sm"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {loading && !feedback.length ? (
                <div className="flex justify-center items-center h-96">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-full border-4 border-blue-50 border-t-blue-600 animate-spin"></div>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {feedback.length === 0 ? (
                        <div className="bg-white p-24 rounded-3xl shadow-sm border border-dashed text-center">
                            <div className="text-gray-300 mb-4 flex justify-center">
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                            <p className="text-xl font-medium text-gray-400">Everything clear! No feedback matching your filters.</p>
                        </div>
                    ) : (
                        feedback.map((item: Feedback) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                data-testid="feedback-card"
                                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-400 transition-all duration-300 cursor-pointer p-6"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.ai_priority === 'Urgent' ? 'bg-red-500 text-white shadow-lg shadow-red-200' :
                                                item.ai_priority === 'High' ? 'bg-orange-400 text-white' :
                                                    'bg-blue-500 text-white'
                                                }`}>
                                                {item.ai_priority || 'Normal'}
                                            </span>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                {item.ai_category || item.category}
                                            </span>
                                            <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {item.ai_summary || item.content.slice(0, 60) + '...'}
                                        </h3>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-2.5 w-2.5 rounded-full ${item.status === 'responded' ? 'bg-green-500' :
                                                    item.status === 'ai_processed' ? 'bg-blue-500 animate-pulse' :
                                                        'bg-gray-300'
                                                    }`}></div>
                                                <span className="text-xs font-bold text-gray-500 uppercase">{item.status.replace('_', ' ')}</span>
                                            </div>

                                            <button className="text-blue-600 font-bold text-sm tracking-tight flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                Review Details
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {selectedItem && (
                <FeedbackDetail
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onUpdate={loadFeedback}
                />
            )}
        </div>
    );
}
