import { InMemorySessionAdapter } from '$lib/adapters/InMemorySessionAdapter.js'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

describe('InMemorySessionAdapter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('Read and write sessions', async () => {
    const adapter = new InMemorySessionAdapter()

    await adapter.write('session1', 'data1', Date.now() + 1000) // session expires after 1 second
    await adapter.write('session2', 'data2', Date.now() + 2000) // session expires after 2 seconds
    await adapter.write('session3', 'data3', Date.now() + 3000) // session expires after 3 seconds

    expect(await adapter.read('session1')).toBe('data1')
    expect(await adapter.read('session2')).toBe('data2')
    expect(await adapter.read('session3')).toBe('data3')
  })
})
