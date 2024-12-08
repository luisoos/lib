'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ImageView from '~/components/ui/file/ImageView';
import NoteView from '~/components/ui/file/NoteView';
const PDFView = dynamic(() => import('~/components/ui/file/PDFView'), {
    ssr: false,
});

const View: React.FC<{
    fileId: string;
    file: string;
    fileType: string;
    fileName: string;
    lastModified: Date;
}> = ({ file, fileType, fileName, fileId, lastModified }) => {
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

    if (fileType.startsWith('text/plain')) {
        return (
            <NoteView
                fileId={fileId}
                fileName={fileName ?? ''}
                content={fileContent}
            />
        );
    } else if (fileType.startsWith('image/')) {
        return (
            <ImageView
                content={fileContent}
                fileType={fileType}
                fileName={fileName}
                lastModified={lastModified}
            />
        );
    } else if (fileType.startsWith('application/pdf')) {
        return <PDFView fileId={fileId} pdfUrl={file} />;
    } else {
        return (
            <div className='flex item-middle justify-center'>
                Filetype {fileType} is not supported.
            </div>
        );
    }
};

export default View;
