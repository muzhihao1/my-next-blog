import { renderHook, act }
from '@testing-library/react' 

import { useDebounce }
from '../useDebounce' describe('useDebounce', () => { beforeEach(() => { jest.useFakeTimers() })
afterEach(() => { jest.useRealTimers() })
it('returns initial value immediately', () => { const { result } = renderHook(() => useDebounce('initial', 500)) expect(result.current).toBe('initial') })
it('debounces value changes', () => { const { result, rerender } = renderHook( ({ value, delay }) => useDebounce(value, delay), { initialProps: { value: 'initial', delay: 500 }
}) // Initial value expect(result.current).toBe('initial') // Change value rerender({ value: 'updated', delay: 500 }) // Should still be initial value expect(result.current).toBe('initial') // Fast forward time act(() => { jest.advanceTimersByTime(499) }) // Still initial value expect(result.current).toBe('initial') // Complete the delay act(() => { jest.advanceTimersByTime(1) }) // Now should be updated expect(result.current).toBe('updated') })
it('cancels previous timeout on rapid changes', () => { const { result, rerender } = renderHook( ({ value }) => useDebounce(value, 500), { initialProps: { value: 'first' }
}) // Rapid changes rerender({ value: 'second' }) act(() => { jest.advanceTimersByTime(200) }) rerender({ value: 'third' }) act(() => { jest.advanceTimersByTime(200) }) rerender({ value: 'fourth' }) act(() => { jest.advanceTimersByTime(200) }) // Total time passed: 600ms, but each change reset the timer // So the value should still be 'first' expect(result.current).toBe('first') // Complete the delay from the last change act(() => { jest.advanceTimersByTime(300) }) // Now should be the last value expect(result.current).toBe('fourth') })
it('works with different data types', () => { // Number const { result: numberResult } = renderHook(() => useDebounce(42, 100)) expect(numberResult.current).toBe(42) // Object const obj = { name: 'test', value: 123 }
const { result: objectResult } = renderHook(() => useDebounce(obj, 100)) expect(objectResult.current).toBe(obj) // Array const arr = [1, 2, 3]
const { result: arrayResult } = renderHook(() => useDebounce(arr, 100)) expect(arrayResult.current).toBe(arr) // Boolean const { result: boolResult } = renderHook(() => useDebounce(true, 100)) expect(boolResult.current).toBe(true) })
it('handles delay changes', () => { const { result, rerender } = renderHook( ({ value, delay }) => useDebounce(value, delay), { initialProps: { value: 'initial', delay: 500 }
}) // Change value with original delay rerender({ value: 'updated', delay: 500 }) // Change delay while timer is running rerender({ value: 'updated', delay: 200 }) // Fast forward with new delay act(() => { jest.advanceTimersByTime(200) }) // Should be updated with new delay expect(result.current).toBe('updated') })
it('cleans up timeout on unmount', () => { const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout') const { unmount, rerender } = renderHook( ({ value }) => useDebounce(value, 500), { initialProps: { value: 'initial' }
}) // Trigger a change rerender({ value: 'updated' }) // Unmount before timeout completes unmount() // Verify clearTimeout was called expect(clearTimeoutSpy).toHaveBeenCalled() clearTimeoutSpy.mockRestore() })
it('handles immediate updates with zero delay', () => { const { result, rerender } = renderHook( ({ value }) => useDebounce(value, 0), { initialProps: { value: 'initial' }
}) expect(result.current).toBe('initial') rerender({ value: 'updated' }) // With zero delay, should update immediately in next tick act(() => { jest.runAllTimers() }) expect(result.current).toBe('updated') })
it('maintains referential equality for objects when value does not change', () => { const obj = { count: 1 }
const { result, rerender } = renderHook(() => useDebounce(obj, 500)) const firstResult = result.current // Re-render without changing the value rerender() // Should be the same reference expect(result.current).toBe(firstResult) })
it('handles null and undefined values', () => { // Test with null const { result: nullResult, rerender: rerenderNull } = renderHook( ({ value }) => useDebounce(value, 100), { initialProps: { value: null as string | null }
}) expect(nullResult.current).toBeNull() rerenderNull({ value: 'not null' }) act(() => { jest.advanceTimersByTime(100) }) expect(nullResult.current).toBe('not null') // Test with undefined const { result: undefinedResult } = renderHook(() => useDebounce(undefined as string | undefined, 100) ) expect(undefinedResult.current).toBeUndefined() }) })