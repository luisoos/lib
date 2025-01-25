export default async function upload(
    file: File | undefined,
    path?: string | null
): Promise<any> {
    if (!file) return;

    // Convert FileReader to a Promise
    const readFileAsBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = reader.result?.toString().split(',')[1]; // Get Base64 part
                if (base64Data) resolve(base64Data);
                else reject(new Error('Failed to read file as base64'));
            };
            reader.onerror = reject; // Handle FileReader error
            reader.readAsDataURL(file);
        });

    try {
        const base64Data = await readFileAsBase64(file);

        const response = await fetch('/api/routes/files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                fileData: base64Data,
                folderName: path,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            return { statusCode: response.status, data: result };
        } else {
            return { statusCode: response.status, error: result.error[0]?.message || 'Unknown error' };
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return { statusCode: 500, error: 'Internal error occurred' };
    }
}
