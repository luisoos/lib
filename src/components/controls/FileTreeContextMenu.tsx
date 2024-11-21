'use client';

import { redirect } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ContextMenu,
    ContextMenuAction,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '~/components/ui/context-menu';
import upload from '~/hooks/files/upload';
import ControlComponentProps from '~/types/controls/ControlComponentProps';

const FileTreeContextMenu: React.FC<ControlComponentProps> = ({
    id,
    className,
    children,
}) => {
    // const [file, setFile] = useState<File>();

    // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     if(event.target.files) setFile(event.target.files![0]);
    // };

    // useEffect(() => {
    //     const uploadFile = async () => {
    //         if (file && id) {
    //             console.log("Uploading file with id:", id);
    //             try {
    //                 await upload(file, id);
    //             } catch (error) {
    //                 console.error("Upload failed:", error);
    //             }
    //         }
    //     };

    //     uploadFile();
    // }, [file, id]);

    const handleNewNoteClick = async () => {
        console.log('Button was clicked!', id);
        const file = new File([''], 'New Note.txt', {
            type: 'text/plain',
        });
        await upload(file, id);
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger className={className}>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className='max-w-40'>
                {id && (
                    <ContextMenuItem
                        noFocus
                        className='text-xs font-medium truncate max-w-full block'>
                        {id}
                    </ContextMenuItem>
                )}
                {/* <ContextMenuItem className='cursor-pointer'>
                    <label htmlFor='file-upload' className='w-full'>
                        <input
                            id='file-upload'
                            type='file'
                            onChange={handleFileChange}
                            className='hidden'
                        />
                        <ContextMenuAction icon='FileUp' label='Upload File' />
                    </label>
                </ContextMenuItem> */}
                <ContextMenuItem>
                    <ContextMenuAction
                        onClick={handleNewNoteClick}
                        icon='FilePlus2'
                        label='New Note'
                    />
                </ContextMenuItem>
                <ContextMenuItem>
                    <ContextMenuAction icon='FolderPlus' label='New Folder' />
                </ContextMenuItem>
                <ContextMenuItem>
                    <ContextMenuAction icon='Share' label='Export' />
                </ContextMenuItem>
                <ContextMenuItem>
                    <ContextMenuAction
                        icon='Trash2'
                        label='Delete'
                        className='text-red-600'
                    />
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export default FileTreeContextMenu;
