'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DocumentView } from '~/components/ui/file/DocumentView';
import ImageView from '~/components/ui/file/ImageView';
import NoteView from '~/components/ui/file/NoteView';
const PDFView = dynamic(() => import('~/components/ui/file/PDFView'), {
    ssr: false,
});

const View: React.FC<{
    fileId: string;
    file: string;
    fileType: string;
    fileName?: string;
}> = ({ file, fileType, fileName, fileId }) => {
    const [fileContent, setFileContent] = useState<string | null>(null);

    useEffect(() => {
        const readFile = async () => {
            try {
                setFileContent(file);
            } catch (error) {
                console.error('Error reading file:', error);
            }
        };

        readFile();
    }, [file]);

    if (!fileContent) {
        return <div>Loading file content...</div>;
    }

    switch (fileType) {
        case 'text/plain':
            return (
                <NoteView
                    fileId={fileId}
                    fileName={fileName ?? ''}
                    content={fileContent}
                />
            );
        case 'image/jpg':
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
        case 'image/bmp':
        case 'image/tiff':
            return <ImageView content={fileContent} />;
        case 'application/pdf':
            return <PDFView fileId={fileId} pdfUrl={file} />;
        default:
            return (
                <div className='flex item-middle justify-center'>
                    Filetype {fileType} is not supported.
                </div>
            );
    }
};

export default View;
