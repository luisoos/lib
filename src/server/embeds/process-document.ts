import pdf from 'pdf-parse';

export async function processDocument(signedFileUrl: string, mimetype: string) {
  // Extract text based on file type
  const text = await extractTextFromFile(signedFileUrl, mimetype)

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

async function extractTextFromFile(signedFileUrl: string, fileType: string): Promise<string> {
    let text = '';

    if (fileType.startsWith('text/plain')) {
        const res = await fetch(signedFileUrl);
        // TODO: Remove all HTML tags
        text = await res.text();
    } else if (fileType.startsWith('application/pdf')) {
        const res = await fetch(signedFileUrl);
        const buffer = await res.arrayBuffer();
        text = await extractTextFromPDF(buffer);
    } else if (fileType.startsWith('image/')) {
        text = await extractTextFromImage(signedFileUrl);
    } else {
        console.warn('Unsupported file type');
    }

    return text;
}

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    const data = await pdf(Buffer.from(buffer))
    return data.text
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to parse PDF')
  }
}

async function extractTextFromImage(signedFileUrl: string): Promise<string> {
    // Use Vision AI (Groq)
    return "not yet implemented";
}