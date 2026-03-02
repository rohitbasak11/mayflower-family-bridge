import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ResponseEditor from './ResponseEditor';
import { api } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
    api: {
        submitResponse: vi.fn(),
    },
}));

describe('ResponseEditor', () => {
    const mockOnSent = vi.fn();
    const feedbackId = 'test-uuid';
    const initialDraft = 'This is a draft response.';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders with initial draft', () => {
        render(
            <ResponseEditor
                feedbackId={feedbackId}
                initialDraft={initialDraft}
                onSent={mockOnSent}
            />
        );

        expect(screen.getByPlaceholderText(/Type your response here.../i)).toHaveValue(initialDraft);
    });

    it('updates state when text is typed', () => {
        render(
            <ResponseEditor
                feedbackId={feedbackId}
                onSent={mockOnSent}
            />
        );

        const textarea = screen.getByPlaceholderText(/Type your response here.../i);
        fireEvent.change(textarea, { target: { value: 'New message' } });
        expect(textarea).toHaveValue('New message');
    });

    it('calls API and onSent when send button is clicked', async () => {
        vi.mocked(api.submitResponse).mockResolvedValueOnce({} as any);

        render(
            <ResponseEditor
                feedbackId={feedbackId}
                initialDraft={initialDraft}
                onSent={mockOnSent}
            />
        );

        const sendButton = screen.getByText(/Send Response/i);
        fireEvent.click(sendButton);

        expect(api.submitResponse).toHaveBeenCalledWith(feedbackId, initialDraft);

        await waitFor(() => {
            expect(mockOnSent).toHaveBeenCalled();
        });
    });

    it('resets to draft when reset button is clicked', () => {
        render(
            <ResponseEditor
                feedbackId={feedbackId}
                initialDraft={initialDraft}
                onSent={mockOnSent}
            />
        );

        const textarea = screen.getByPlaceholderText(/Type your response here.../i);
        fireEvent.change(textarea, { target: { value: 'Changed text' } });

        const resetButton = screen.getByText(/Reset to Draft/i);
        fireEvent.click(resetButton);

        expect(textarea).toHaveValue(initialDraft);
    });

    it('disables button when response is empty', () => {
        render(
            <ResponseEditor
                feedbackId={feedbackId}
                onSent={mockOnSent}
            />
        );

        const sendButton = screen.getByText(/Send Response/i);
        expect(sendButton).toBeDisabled();
    });
});
