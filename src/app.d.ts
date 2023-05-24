// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { Session } from '$lib'

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: Session<{ loggedIn: boolean }>
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {}
