'use client';

import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import upload from '~/hooks/files/upload';
import { cn } from '~/hooks/utils';
import FileTreeContextMenu from '~/components/controls/FileTreeContextMenu';
import ControlComponentProps from '~/types/controls/ControlComponentProps';

const Dropzone: React.FC<ControlComponentProps> = ({
    id,
    className,
    children,
}) => {
    const hasChildren = React.Children.count(children) > 0;
    const Comp = hasChildren ? FileTreeContextMenu : 'div';
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
        <Comp id={id}>
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
        </Comp>
    );
};

export default Dropzone;
