'use client';

import React, { useEffect, useState } from 'react';
import { DocumentView } from '~/components/ui/file/DocumentView';
import ImageView from '~/components/ui/file/ImageView';
import { PDFView } from '~/components/ui/file/PDFView';

const View: React.FC<{ file: string; fileType: string }> = ({
    file,
    fileType,
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

    console.log(fileType);

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
            return <PDFView content={fileContent} />;
        default:
            return <>Filetype {fileType} is not supported.</>;
    }

    return <div></div>;
};

export default View;
