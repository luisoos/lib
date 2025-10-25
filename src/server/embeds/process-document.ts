import PDFParser from 'pdf2json';

export async function processDocument(
    fileResponse: Response,
    mimetype: string,
) {
    // Extract text based on file type
    const text = await extractTextFromFile(fileResponse, mimetype);

    // Split into chunks
    //   const chunks = chunkText(text, 1000, 200) // size, overlap

    //   // Generate embeddings for each chunk
    //   const chunksWithEmbeddings = await Promise.all(
    //     chunks.map(async (chunk) => {
    //       const { embedding } = await embed({
    //         model: openai.embedding('text-embedding-3-small'),
    //         value: chunk,
    //       })
    //       return { content: chunk, embedding }
    //     })
    //   )

    return text; //chunksWithEmbeddings
}

async function extractTextFromFile(
    fileResponse: Response,
    fileType: string,
): Promise<string> {
    let text = '';

    if (fileType.startsWith('text/plain')) {
        // TODO: Remove all HTML tags
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
        pdfParser.on('pdfParser_dataReady', () => {
            try {
                const text = pdfParser.getRawTextContent();
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
