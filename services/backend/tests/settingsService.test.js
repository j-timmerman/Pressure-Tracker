import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    filter: vi.fn(),
    collection: vi.fn(),
    getFirstListItem: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
}));

vi.mock('../pocketbaseClient', () => ({
    pocketbase: {
        filter: mocks.filter,
        collection: mocks.collection,
    },
}));

import { settingsService } from '../settingsService';

function mockSettingsRow(overrides = {}) {
    return {
        id: 'settings-1',
        user_id: 'user-1',
        pressure_unit: 'hPa',
        watch_levels: [980, 1013.25],
        ...overrides,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    mocks.filter.mockImplementation((_query, params) =>
        `user_id = ${params.userId}`
    );
    mocks.collection.mockReturnValue({
        getFirstListItem: mocks.getFirstListItem,
        update: mocks.update,
        create: mocks.create,
    });
});

describe('settingsService', () => {

    it('converts watch levels when changing pressure units', async () => {
        mocks.getFirstListItem.mockResolvedValue(mockSettingsRow());
        mocks.update.mockImplementation((_id, values) =>
            Promise.resolve(mockSettingsRow(values))
        );

        // When converted from hPa to inHg, the watch levels [980, 1013.25] become [28.94, 29.92].
        await expect(
            settingsService.updatePressureUnit('user-1', 'inHg')
        ).resolves.toEqual({
            pressure_unit: 'inHg',
            watch_levels: [28.94, 29.92],
        });

        // Verify that the update was called with the converted watch levels.
        expect(mocks.update).toHaveBeenCalledWith('settings-1', {
            pressure_unit: 'inHg',
            watch_levels: [28.94, 29.92],
        });
    });

    it('maps an invalid watch_levels value to an empty array', async () => {
        mocks.getFirstListItem.mockResolvedValue(
            mockSettingsRow({ watch_levels: null })
        );

        await expect(settingsService.get('user-1')).resolves.toEqual({
            pressure_unit: 'hPa',
            watch_levels: [],
        });
    });
});

