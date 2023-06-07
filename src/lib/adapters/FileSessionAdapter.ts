import type { SessionAdapter } from '$lib/SessionAdapter.js'
import fs from 'node:fs'
import path from 'node:path'

/** File-based session adapter. Stores session data in files on the filesystem. */
export class FileSessionAdapter implements SessionAdapter {
  private readonly sessionDir: string

  constructor(sessionDir: string) {
    this.sessionDir = sessionDir
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true })
    }
  }

  read(sessionId: string): string | null {
    const filePath = this.getSessionFilePath(sessionId)
    try {
      return fs.readFileSync(filePath, 'utf8')
    } catch (error) {
      return null
    }
  }

  write(sessionId: string, data: string): void {
    const filePath = this.getSessionFilePath(sessionId)
    fs.writeFileSync(filePath, data)
  }

  destroy(sessionId: string): void {
    const filePath = this.getSessionFilePath(sessionId)
    try {
      fs.unlinkSync(filePath)
    } catch (error) {
      // Ignore if the file doesn't exist
    }
  }

  getExpiredSessions(timestamp: number): string[] {
    const expiredSessions: string[] = []
    const sessionFiles = fs.readdirSync(this.sessionDir)
    for (const sessionFile of sessionFiles) {
      const filePath = `${this.sessionDir}/${sessionFile}`
      const sessionData = fs.readFileSync(filePath, 'utf8')
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
