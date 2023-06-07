import type { SessionAdapter } from '$lib/SessionAdapter.js'
import fs from 'node:fs/promises'
import path from 'node:path'

/** File-based session adapter. Stores session data in files on the filesystem. */
export class FileSessionAdapter implements SessionAdapter {
  private readonly sessionDir: string

  constructor(sessionDir: string) {
    this.sessionDir = sessionDir
  }

  async read(sessionId: string) {
    const filePath = this.getSessionFilePath(sessionId)
    try {
      return await fs.readFile(filePath, 'utf8')
    } catch (error) {
      return null
    }
  }

  async write(sessionId: string, data: string) {
    const filePath = this.getSessionFilePath(sessionId)
    await fs.writeFile(filePath, data)
  }

  async destroy(sessionId: string) {
    const filePath = this.getSessionFilePath(sessionId)
    try {
      await fs.unlink(filePath)
    } catch (error) {
      // Ignore if the file doesn't exist
    }
  }

  async getExpiredSessions(timestamp: number) {
    const expiredSessions: string[] = []
    const sessionFiles = await fs.readdir(this.sessionDir)
    for (const sessionFile of sessionFiles) {
      const filePath = `${this.sessionDir}/${sessionFile}`
      const sessionData = await fs.readFile(filePath, 'utf8')
      const session = JSON.parse(sessionData)
      if (session.expires < timestamp) {
        expiredSessions.push(sessionFile)
      }
    }
    return expiredSessions
  }

  private getSessionFilePath(sessionId: string): string {
    return path.join(this.sessionDir, `${sessionId}.json`)
  }
}
