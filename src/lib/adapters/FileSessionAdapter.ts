import type { SessionAdapter } from '$lib/SessionAdapter.js'
import fs from 'node:fs'

/** File-based session adapter. Stores session data in files on the filesystem. */
export class FileSessionAdapter implements SessionAdapter {
  private readonly sessionDir: string

  constructor(sessionDir: string) {
    this.sessionDir = sessionDir
  }

  async read(sessionId: string): Promise<string | null> {
    const filePath = this.getSessionFilePath(sessionId)
    try {
      const sessionData = await fs.promises.readFile(filePath, 'utf8')
      const session = JSON.parse(sessionData)
      if (session.expires < Date.now()) {
        await this.destroy(sessionId)
        return null
      }
      return session.data
    } catch (error) {
      return null
    }
  }

  async write(sessionId: string, data: string, expires: number): Promise<void> {
    const filePath = this.getSessionFilePath(sessionId)
    const session = { data, expires }
    await fs.promises.writeFile(filePath, JSON.stringify(session))
  }

  async destroy(sessionId: string): Promise<void> {
    const filePath = this.getSessionFilePath(sessionId)
    try {
      await fs.promises.unlink(filePath)
    } catch (error) {
      // Ignore if the file doesn't exist
    }
  }

  async getExpiredSessions(timestamp: number): Promise<string[]> {
    const expiredSessions: string[] = []
    const sessionFiles = await fs.promises.readdir(this.sessionDir)
    for (const sessionFile of sessionFiles) {
      const filePath = `${this.sessionDir}/${sessionFile}`
      const sessionData = await fs.promises.readFile(filePath, 'utf8')
      const session = JSON.parse(sessionData)
      if (session.expires < timestamp) {
        expiredSessions.push(sessionFile)
      }
    }
    return expiredSessions
  }

  private getSessionFilePath(sessionId: string): string {
    return `${this.sessionDir}/${sessionId}.json`
  }
}
