'use client';

import React, { useEffect, useState } from 'react';
import ChatInterface from '~/components/chat';
import View from '~/hooks/display/use-view';

interface RenderFileProps {
    slug: string;
}

const RenderFile: React.FC<RenderFileProps> = ({ slug }) => {
    const [fileData, setFileData] = useState<string | undefined>(undefined);
    const [fileName, setFileName] = useState<string | undefined>(undefined);
    const [fileType, setFileType] = useState<string | undefined>(undefined);
    const [lastModified, setLastModified] = useState<Date | undefined>(
        undefined,
    );

    useEffect(() => {
        const fetchFile = async () => {
            const response = await fetch(`/api/routes/files/${slug}`);
            if (response.ok) {
                const data = await response.json();
                setFileData(data.data.fileContent ?? data.data.signedUrl);
                setFileName(data.data.fileName);
                setFileType(data.data.mimetype);
                setLastModified(new Date(data.data.lastModified));
            } else {
                console.error('Failed to fetch file');
            }
        };

        fetchFile();
    }, [slug]);

    if (
        fileData !== undefined &&
        fileName !== undefined &&
        fileType !== undefined &&
        lastModified !== undefined
    ) {
        return (
            <>
                <View
                    fileId={slug}
                    file={fileData}
                    fileType={fileType}
                    fileName={fileName}
                    lastModified={lastModified}
                />
                <ChatInterface />
            </>
        );
    } else {
        return <>Loading file</>;
    }
};

export default RenderFile;
