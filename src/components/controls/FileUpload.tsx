'use client';

import React, { useState } from 'react';
import { FilePlus2 } from 'lucide-react'; // Import your Lucide icon here
import upload from '~/hooks/files/upload';

const FileUpload = () => {
    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const selectedFile = event.target.files?.[0];
        await upload(selectedFile);
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
