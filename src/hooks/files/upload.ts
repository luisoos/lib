import { redirect } from 'next/navigation';

export default async function upload(file: File | undefined, path?: string) {
    if (file) {
        const reader = new FileReader();

        reader.onloadend = async () => {
            const base64Data = reader.result?.toString().split(',')[1]; // Get Base64 part
            if (base64Data) {
                try {
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
                        console.log('File uploaded successfully:', result);
                    } else {
                        console.error(
                            'Error uploading file:',
                            result.error || 'Unknown error',
                        );
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                }
            }
        };

        reader.readAsDataURL(file); // Read the file as a data URL
    }
}
