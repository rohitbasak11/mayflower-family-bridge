import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMock = createFetchMock(vi);

// sets globalThis.fetch and globalThis.fetchMock
fetchMock.enableMocks();
