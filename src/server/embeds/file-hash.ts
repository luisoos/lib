import crypto from 'crypto';
import { db } from '../db';

export async function calculateDocumentHash(
    arrayBuffer: ArrayBuffer,
): Promise<string> {
    const buffer = Buffer.from(arrayBuffer);

    // SHA-256 Hash of document
    return crypto.createHash('sha256').update(buffer).digest('hex');
}
