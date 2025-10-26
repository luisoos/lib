import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import striptags from 'striptags';
import removeMd from 'remove-markdown';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function ucfirst(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(s: string): string {
    return s
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('');
}

export function standardiseWord(str: string): string {
    if (!str) return str;
    return ucfirst(str.toLowerCase().replace('_', ' '));
}

export function trimUnfinishedSentence(text: string): string {
    const finishedSentences: string[] = text.split(/([.!?;:])/);
    if (finishedSentences.length === 0) return '';
    const lastSentence: string =
        finishedSentences[finishedSentences.length - 1]!;
    if (!/([.!?;:])/.test(lastSentence)) {
        finishedSentences.pop();
    }
    return finishedSentences.join(' ').trim();
}

export function cleanText(input: string): string {
    let withoutHtml = striptags(input);
    let clean = removeMd(withoutHtml);
    return clean.replace(/\s+/g, ' ').trim();
}
