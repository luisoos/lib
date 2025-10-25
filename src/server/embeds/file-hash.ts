import crypto from 'crypto';
import { db } from '../db';

export async function calculateDocumentHash(fileUrl: string): Promise<string> {
  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // SHA-256 Hash of document
  return crypto.createHash('sha256').update(buffer).digest('hex');
}