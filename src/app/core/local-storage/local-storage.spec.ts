import { PLATFORM_ID, provideZonelessChangeDetection, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalStorage } from './local-storage';

describe('LocalStorage', () => {
  describe('Server Environment', () => {
    let storage: LocalStorage;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }],
      });

      storage = TestBed.inject(LocalStorage);
    });

    it('should return length of internal storage', () => {
      storage.setItem('item1', 'value');
      storage.setItem('item2', 'another-value');
      storage.setItem('item3', 'some-other-value');

      const length = storage.length;

      expect(length).toBe(3);
    });

    it('should store and retrieve data from internal storage', () => {
      storage.setItem('item', 'test');
      const testData = storage.getItem('item');

      expect(testData).toBe('test');
    });

    it('should remove data from internal storage', () => {
      storage.setItem('item', 'test');
      storage.removeItem('item');
      const testData = storage.getItem('item');

      expect(testData).toBeNull();
    });

    it('should clear internal storage', () => {
      storage.setItem('item1', 'value');
      storage.setItem('item2', 'another-value');
      storage.setItem('item3', 'some-other-value');
      storage.clear();

      expect(storage.length).toBe(0);
    });

    it('should return null for non-existing key', () => {
      const testData = storage.getItem('non-existing-key');

      expect(testData).toBeNull();
    });

    it('should return key by index', () => {
      storage.setItem('item1', 'value');
      storage.setItem('item2', 'another-value');
      storage.setItem('item3', 'some-other-value');

      const key = storage.key(1);

      expect(key).toBe('item2');
    });

    it('should return null for non-existing index', () => {
      const key = storage.key(100);

      expect(key).toBeNull();
    });
  });

  describe('Browser Environment', () => {
    let storage: LocalStorage;

    const transferState = {
      get: vi.fn(() => [['testKeyInitial', 'testValueInitial']]),
      set: vi.fn(),
    };

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: PLATFORM_ID, useValue: 'browser' },
          { provide: TransferState, useValue: transferState },
        ],
      });

      storage = TestBed.inject(LocalStorage);
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should initialize localStorage from transfer state', () => {
      expect(localStorage.getItem('testKeyInitial')).toBe('testValueInitial');
    });

    it('should not update transfer state in browser when setting item', () => {
      storage.setItem('testKey', 'testValue');
      expect(transferState.set).not.toHaveBeenCalled();
    });

    it('should set item to localStorage', () => {
      storage.setItem('testKey', 'testValue');
      expect(localStorage.getItem('testKey')).toBe('testValue');
    });

    it('should get item from localStorage', () => {
      localStorage.setItem('testKey', 'testValue');
      expect(storage.getItem('testKey')).toBe('testValue');
    });

    it('should remove item from localStorage', () => {
      localStorage.setItem('testKey', 'testValue');
      storage.removeItem('testKey');
      expect(localStorage.getItem('testKey')).toBeNull();
    });

    it('should return the name of the nth key in the list from localStorage', () => {
      localStorage.clear();
      localStorage.setItem('testKey', 'testValue');
      expect(storage.key(0)).toBe('testKey');
    });
  });
});
