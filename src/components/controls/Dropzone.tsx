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
    const [file, setFile] = useState<File>();
    const hasChildren = React.Children.count(children) > 0;
    const Comp = hasChildren ? FileTreeContextMenu : 'div';

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFile(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
    });

    useEffect(() => {
        const uploadFile = async (id: string) => {
            await upload(file, id);
        };
        uploadFile(id);
    }, [file]);

    return (
        <Comp id={id} data-dropzone='true'>
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
