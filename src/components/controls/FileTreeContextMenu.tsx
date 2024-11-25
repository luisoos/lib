'use client';

import { redirect, usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ContextMenu,
    ContextMenuAction,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from '~/components/ui/context-menu';
import upload from '~/hooks/files/upload';
import { useToast } from '~/hooks/use-toast';
import ControlComponentProps from '~/types/controls/ControlComponentProps';

const FileTreeContextMenu: React.FC<ControlComponentProps> = ({
    id,
    className,
    children,
}) => {
    console.log(id)
    const { toast } = useToast();
    const router = useRouter();
    
  const pathname = usePathname()

    const handleNewNoteClick = async () => {
        console.log('Button was clicked!', id);
        const file = new File([''], 'New Note.txt', {
            type: 'text/plain',
        });
        await upload(file, id);
    };

    const handleDeleteFileClick = async () => {
        console.log(id)
        const response = await fetch(
            `/api/routes/files/${id}?upsert=true`,
            {
                method: 'DELETE', }
        );
        const json =
            await response.json();
        
        if (response.ok) {
            toast({
                title: 'Deleted succesfully.',
                description:
                    'We successfully deleted the requested file.',
            });
            if (pathname.includes(id)) {
                setTimeout(() => {
                  router.push(`/dashboard`);
                }, 5000);
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'Failed to delete.',
                description:
                    'We had an error deleting the requested file.',
            });
        }
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
                        onClick={handleDeleteFileClick}
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
