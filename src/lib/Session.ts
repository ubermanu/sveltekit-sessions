import type { SessionManager } from '$lib/SessionManager.js'
import type { RequestEvent } from '@sveltejs/kit'

export class Session {
  private readonly manager: SessionManager
  private readonly event: RequestEvent
  data: Record<string, unknown> = {}

  constructor(manager: SessionManager, event: RequestEvent) {
    this.manager = manager
    this.event = event
  }

  get(key: string) {
    return this.data[key]
  }

  has(key: string) {
    return key in this.data
  }

  set(key: string, value: unknown) {
    this.data[key] = value
  }

  delete(key: string) {
    delete this.data[key]
  }

  get id() {
    return this.manager.id(this.event)
  }
}
