import crypto from 'node:crypto'

export function encrypt(data: string, secret: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', secret)
  let encryptedData = cipher.update(data, 'utf8', 'hex')
  encryptedData += cipher.final('hex')
  return encryptedData
}

export function decrypt(encryptedData: string, secret: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', secret)
  let decryptedData = decipher.update(encryptedData, 'hex', 'utf8')
  decryptedData += decipher.final('utf8')
  return decryptedData
}

export function uuid(): string {
  return crypto.randomUUID()
}
