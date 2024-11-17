'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DocumentView } from '~/components/ui/file/DocumentView';
import ImageView from '~/components/ui/file/ImageView';
const PDFView = dynamic(() => import('~/components/ui/file/PDFView'), {
    ssr: false,
});

const View: React.FC<{ file: string; fileType: string; fileId: string }> = ({
    file,
    fileType,
    fileId,
}) => {
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
            return <DocumentView content={fileContent} />;
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
            return <>Filetype {fileType} is not supported.</>;
    }
};

export default View;
