import { JsonValue } from '@prisma/client/runtime/library';

export interface DatabaseHighlights {
    description: string | null;
    id: number;
    title: string;
    data: JsonValue;
    storageObjectId: string;
}
