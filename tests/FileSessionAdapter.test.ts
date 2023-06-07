import { FileSessionAdapter } from '$lib/adapters/FileSessionAdapter.js'
import fs from 'node:fs'
import { afterEach, describe, expect, test } from 'vitest'

const testSessionDir = '.svelte-kit/tests/sessions'

describe('FileSessionAdapter', () => {
  afterEach(() => {
    fs.rmSync(testSessionDir, { recursive: true })
  })

  test('Read and write sessions', async () => {
    const adapter = new FileSessionAdapter(testSessionDir)

    await adapter.write('session1', 'data1', Date.now() + 1000) // session expires after 1 second
    await adapter.write('session2', 'data2', Date.now() + 2000) // session expires after 2 seconds
    await adapter.write('session3', 'data3', Date.now() + 3000) // session expires after 3 seconds

    expect(await adapter.read('session1')).toBe('data1')
    expect(await adapter.read('session2')).toBe('data2')
    expect(await adapter.read('session3')).toBe('data3')
  })
})
