export interface Message {
    role: 'user' | 'assistant';
    content: string;
    id?: string;
}

export interface ChatMessage extends Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}
