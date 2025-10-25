'use client';

import React from 'react';
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
    if (fileType.startsWith('text/plain')) {
        return (
            <NoteView
                fileId={fileId}
                fileName={fileName ?? ''}
                content={file}
            />
        );
    } else if (fileType.startsWith('image/')) {
        return (
            <ImageView
                content={file}
                fileType={fileType}
                fileName={fileName}
                lastModified={lastModified}
            />
        );
    } else if (fileType.startsWith('application/pdf')) {
        return <PDFView fileId={fileId} pdfUrl={file} />;
    } else {
        return (
            <div className='flex items-center justify-center'>
                Filetype {fileType} is not supported.
            </div>
        );
    }
};

export default View;
