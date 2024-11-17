'use client';

import React, { useEffect, useState } from 'react';
import View from '~/hooks/display/use-view';

interface RenderFileProps {
    slug: string;
}

const RenderFile: React.FC<RenderFileProps> = ({ slug }) => {
    const [fileData, setFileData] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);

    useEffect(() => {
        const fetchFile = async () => {
            const response = await fetch(`/api/routes/files/${slug}`);
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setFileData(data.data.signedUrl);
                setFileType(data.data.mimetype);
            } else {
                console.error('Failed to fetch file');
            }
        };

        fetchFile();
    }, [slug]);

    if (fileData) {
        return <View fileId={slug} file={fileData!} fileType={fileType!} />;
    } else {
        <>Loading file</>;
    }
};

export default RenderFile;
