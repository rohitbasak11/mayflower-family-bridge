'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface OverrideControlsProps {
    feedbackId: string;
    currentCategory?: string;
    currentPriority?: string;
    onUpdate: () => void;
}

export default function OverrideControls({
    feedbackId,
    currentCategory,
    currentPriority,
    onUpdate
}: OverrideControlsProps) {
    const [updating, setUpdating] = useState(false);

    const categories = ['Dining', 'Temperature', 'Activity', 'Staff', 'General'];
    const priorities = ['Low', 'Medium', 'High', 'Urgent'];

    const handleOverride = async (field: string, value: string) => {
        setUpdating(true);
        try {
            await api.overrideField(feedbackId, field, value);
            onUpdate();
        } catch (error) {
            console.error('Override failed:', error);
            alert('Failed to update field');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2">
                <label htmlFor={`cat-${feedbackId}`} className="text-xs font-semibold text-gray-500 uppercase">Category:</label>
                <select
                    id={`cat-${feedbackId}`}
                    disabled={updating}
                    value={currentCategory || ''}
                    onChange={(e) => handleOverride('category', e.target.value)}
                    className="text-sm border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <label htmlFor={`prio-${feedbackId}`} className="text-xs font-semibold text-gray-500 uppercase">Priority:</label>
                <select
                    id={`prio-${feedbackId}`}
                    disabled={updating}
                    value={currentPriority || ''}
                    onChange={(e) => handleOverride('priority', e.target.value)}
                    className="text-sm border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                    <option value="" disabled>Select Priority</option>
                    {priorities.map(prio => (
                        <option key={prio} value={prio}>{prio}</option>
                    ))}
                </select>
            </div>

            {updating && (
                <div className="text-xs text-blue-600 animate-pulse font-medium">Updating...</div>
            )}
        </div>
    );
}
