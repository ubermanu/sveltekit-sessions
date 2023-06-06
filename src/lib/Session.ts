import type { SessionManager } from '$lib/SessionManager.js'
import type { RequestEvent } from '@sveltejs/kit'

export class Session {
  private manager: SessionManager
  private event: RequestEvent
  private data: Record<string, unknown> = {}

  constructor(manager: SessionManager, event: RequestEvent) {
    this.manager = manager
    this.event = event
    this.data = {}
  }

  get(key: string) {
    return this.data[key]
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

  get expires() {
    // TODO: Implement this
    return 0
  }
}
