import OpenAI from 'openai';
import PDFParser from 'pdf2json';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { cleanText } from '~/lib/utils';

export async function processDocument(
    fileResponse: Response,
    mimetype: string,
) {
    // Extract text based on file type
    const text = await extractTextFromFile(fileResponse, mimetype);

    // Split into chunks
    const cleanedText = cleanText(text);
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const chunks = await splitter.splitText(cleanedText);

    const openai = new OpenAI();

    // Generate embeddings for each chunk
    const embeddings = await Promise.all(
        chunks.map(async (chunk) => {
            const embedding = await openai.embeddings.create({
                model: 'mistral-embed-7b',
                input: chunk,
                encoding_format: 'float',
            });
            return { content: chunk, embedding };
        }),
    );

    return embeddings;
}

async function extractTextFromFile(
    fileResponse: Response,
    fileType: string,
): Promise<string> {
    let text = '';

    if (fileType.startsWith('text/plain')) {
        text = await fileResponse.text();
    } else if (fileType.startsWith('application/pdf')) {
        const buffer = await fileResponse.arrayBuffer();
        text = await extractTextFromPDF(buffer);
    } else if (fileType.startsWith('image/')) {
        text = await extractTextFromImage(fileResponse);
    } else {
        console.warn('Unsupported file type');
    }

    return text;
}

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on('pdfParser_dataError', (errData) =>
            reject((errData as { parserError: Error }).parserError),
        );

        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
            try {
                let pages = pdfData.formImage?.Pages ?? pdfData.Pages;

                if (!pages) {
                    return reject(
                        new Error(
                            "PDF data structure unexpected: 'Pages' missing.",
                        ),
                    );
                }

                const text = pages
                    .map((page: any) =>
                        page.Texts.map((textItem: any) =>
                            decodeURIComponent(textItem.R[0].T),
                        ).join(' '),
                    )
                    .join('\n\n');

                resolve(text);
            } catch (error) {
                reject(error);
            }
        });

        pdfParser.parseBuffer(Buffer.from(buffer));
    });
}

async function extractTextFromImage(fileResponse: Response): Promise<string> {
    // Use Vision AI (Groq)
    return 'not yet implemented';
}
