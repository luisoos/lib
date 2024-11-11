'use client';

import React, { useState } from 'react';
import { FilePlus2, LucideIcon } from 'lucide-react'; // Import your Lucide icon here

const FileUpload = () => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            
            reader.onloadend = async () => {
                const base64Data = reader.result?.toString().split(',')[1]; // Get Base64 part
                if (base64Data) {
                    try {
                        const response = await fetch('/api/files', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                fileName: selectedFile.name,
                                fileType: selectedFile.type,
                                fileData: base64Data,
                            }),
                        });
    
                        const result = await response.json();
    
                        if (response.ok) {
                            console.log('File uploaded successfully:', result);
                        } else {
                            console.error('Error uploading file:', result.error || 'Unknown error');
                        }
                    } catch (error) {
                        console.error('Error uploading file:', error);
                    }
                }
            };
            
            reader.readAsDataURL(selectedFile); // Read the file as a data URL
        }
    };
    
    return (
        <div className="ml-auto">
            <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                <FilePlus2 size={14} className="ml-auto mr-2 my-2" />
                <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }} // Hide the default file input
                />
            </label>
        </div>
    );
};

export default FileUpload;
