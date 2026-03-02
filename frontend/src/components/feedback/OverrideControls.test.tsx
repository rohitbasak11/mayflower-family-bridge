import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OverrideControls from './OverrideControls';
import { api } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
    api: {
        overrideField: vi.fn(),
    },
}));

describe('OverrideControls', () => {
    const mockOnUpdate = vi.fn();
    const feedbackId = 'test-uuid';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders with current values', () => {
        render(
            <OverrideControls
                feedbackId={feedbackId}
                currentCategory="Dining"
                currentPriority="High"
                onUpdate={mockOnUpdate}
            />
        );

        expect(screen.getByLabelText(/Category:/i)).toHaveValue('Dining');
        expect(screen.getByLabelText(/Priority:/i)).toHaveValue('High');
    });

    it('calls API and onUpdate when category changes', async () => {
        vi.mocked(api.overrideField).mockResolvedValueOnce();

        render(
            <OverrideControls
                feedbackId={feedbackId}
                currentCategory="Dining"
                onUpdate={mockOnUpdate}
            />
        );

        const select = screen.getByLabelText(/Category:/i);
        fireEvent.change(select, { target: { value: 'Staff' } });

        expect(api.overrideField).toHaveBeenCalledWith(feedbackId, 'category', 'Staff');

        await waitFor(() => {
            expect(mockOnUpdate).toHaveBeenCalled();
        });
    });

    it('displays updating state during API call', async () => {
        let resolvePromise: (value: void | PromiseLike<void>) => void;
        const promise = new Promise<void>((resolve) => {
            resolvePromise = resolve;
        });
        vi.mocked(api.overrideField).mockReturnValueOnce(promise);

        render(
            <OverrideControls
                feedbackId={feedbackId}
                onUpdate={mockOnUpdate}
            />
        );

        const select = screen.getByLabelText(/Priority:/i);
        fireEvent.change(select, { target: { value: 'Urgent' } });

        expect(screen.getByText(/Updating.../i)).toBeInTheDocument();
        expect(select).toBeDisabled();

        // Resolve the promise
        resolvePromise!();

        await waitFor(() => {
            expect(screen.queryByText(/Updating.../i)).not.toBeInTheDocument();
        });
    });
});
