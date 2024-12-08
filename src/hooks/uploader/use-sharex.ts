export default function useShareX(uploadsecret: string) {
    const domain = typeof window !== 'undefined' ? window.location.origin : '';
    const uploadEndpoint = `${domain}/api/routes/files/external`;

    return JSON.stringify(
        {
            Version: '16.1.0',
            Name: 'ShareX Uploader',
            DestinationType: 'ImageUploader',
            RequestMethod: 'POST',
            RequestURL: uploadEndpoint,
            Body: 'MultipartFormData',
            Headers: {
                Authorization: `Bearer ${uploadsecret}`,
            },
            FileFormName: 'd',
            TextFormName: 'text',
            ClipboardUploadEnabled: true,
        },
        null,
        2,
    );
}
