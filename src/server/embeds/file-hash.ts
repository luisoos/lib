import crypto from 'crypto';
import { db } from '../db';

export async function calculateDocumentHash(fileUrl: string): Promise<string> {
  // Datei content laden (z.B. von Supabase Storage)
  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // SHA-256 Hash berechnen
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Prüfen ob Analysis für diesen Hash bereits existiert
export async function findExistingAnalysis(
  storageObjectId: string, 
  userId: string, 
  documentHash: string
) {
  return db.documentAnalysis.findFirst({
    where: {
      storage_object_id: storageObjectId,
      userId,
      documentHash,
    }
  });
}
