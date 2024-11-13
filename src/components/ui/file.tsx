// RenderFile.tsx
'use client'; // This directive makes this component a client component

import React, { useEffect, useState } from 'react';

interface RenderFileProps {
    slug: string;
}

const RenderFile: React.FC<RenderFileProps> = ({ slug }) => {
    const [fileData, setFileData] = useState<Blob | null>(null);

    useEffect(() => {
        const fetchFile = async () => {
            const response = await fetch(`/api/routes/file?slug=${slug}`);
            if (response.ok) {
                const data = await response.blob(); // Adjust based on expected response type
                setFileData(data);
            } else {
                console.error('Failed to fetch file');
            }
        };

        fetchFile();
    }, [slug]);

    return <div>{fileData ? <p>Loaded file</p> : <p>Loading file...</p>}</div>;
};

export default RenderFile;
