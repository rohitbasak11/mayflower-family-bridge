'use client';

import { Feedback } from '@/lib/api';
import ResponseEditor from './ResponseEditor';
import OverrideControls from './OverrideControls';

interface FeedbackDetailProps {
    item: Feedback;
    onClose: () => void;
    onUpdate: () => void;
}

export default function FeedbackDetail({ item, onClose, onUpdate }: FeedbackDetailProps) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end transition-opacity">
            <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-slide-in">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Feedback Details</h2>
                        <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mt-1">ID: {item.id.slice(0, 8)}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Resident Info & Content */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Resident Feedback</h3>
                        <div className="bg-white border rounded-2xl p-6 shadow-sm">
                            <p className="text-lg text-gray-800 leading-relaxed italic border-l-4 border-blue-500 pl-4 py-1">
                                "{item.content}"
                            </p>
                            <div className="mt-4 flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                                <span>Submitted: {new Date(item.created_at).toLocaleString()}</span>
                                <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">{item.category}</span>
                            </div>
                        </div>
                    </section>

                    {/* AI Analysis Result */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Analysis</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Confidence:</span>
                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden border">
                                    <div
                                        className="h-full bg-green-500 transition-all shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                                        style={{ width: `${(item.ai_confidence || 0) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-bold text-gray-700">{(item.ai_confidence || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Sentiment</p>
                                <p className="text-sm font-bold text-blue-900">{item.ai_sentiment || 'Neutral'}</p>
                            </div>
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Suggested Summary</p>
                                <p className="text-sm font-bold text-blue-900 line-clamp-2">{item.ai_summary || 'N/A'}</p>
                            </div>
                        </div>

                        <OverrideControls
                            feedbackId={item.id}
                            currentCategory={item.ai_category}
                            currentPriority={item.ai_priority}
                            onUpdate={onUpdate}
                        />
                    </section>

                    {/* Final Response Action */}
                    <section className="bg-gray-50 -mx-8 -mb-8 p-8 border-t">
                        <ResponseEditor
                            feedbackId={item.id}
                            initialDraft={item.ai_draft}
                            onSent={() => {
                                onUpdate();
                                onClose();
                            }}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}
