'use client';

import React, { useState } from 'react';
import { FilePlus2 } from 'lucide-react';
import upload from '~/hooks/files/upload';
import { toast } from '~/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const FileUpload = () => {
    const queryClient = useQueryClient();

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const selectedFile = event.target.files?.[0];
        const status = await upload(selectedFile);
        if (status.statusCode !== 200) {
            toast({
                variant: 'destructive',
                title: 'Something went wrong!',
                description: status.error,
            });
        } else {
            queryClient.invalidateQueries({
                queryKey: ['sidebar'],
            });
        }
    };

    return (
        <div className='ml-auto'>
            <label htmlFor='file-upload' style={{ cursor: 'pointer' }}>
                <FilePlus2 size={14} className='ml-auto mr-2 my-2' />
                <input
                    id='file-upload'
                    type='file'
                    onChange={handleFileChange}
                    style={{ display: 'none' }} // Hide the default file input
                />
            </label>
        </div>
    );
};

export default FileUpload;
