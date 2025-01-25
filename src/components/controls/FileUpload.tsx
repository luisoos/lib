'use client';

import React, { useState } from 'react';
import { FilePlus2 } from 'lucide-react'; // Import your Lucide icon here
import upload from '~/hooks/files/upload';
import { toast } from '~/hooks/use-toast';

const FileUpload = () => {
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
