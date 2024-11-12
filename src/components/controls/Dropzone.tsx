'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import upload from '~/hooks/files/upload';
import { cn } from '~/hooks/utils';

interface DropzoneProps {
    id: string;
    className?: string;
    children?: React.ReactNode;
}

const Dropzone: React.FC<DropzoneProps> = ({ id, className, children }) => {
    const [file, setFile] = useState<File>();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFile(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
    });

    useEffect(() => {
        const uploadFile = async () => {
            await upload(file, id);
        };
        uploadFile();
    }, [file]);

    return (
        <div
            {...getRootProps()}
            className={cn(
                'dropzone',
                isDragActive ? 'opacity-60 transition-all delay-75' : '',
                className,
            )}>
            <input {...getInputProps()} />
            {children}
        </div>
    );
};

export default Dropzone;
