'use client';

import { ToastAction } from '@radix-ui/react-toast';
import { useQueryClient } from '@tanstack/react-query';
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
    item,
    className,
    children,
}) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const router = useRouter();

    const pathname = usePathname();

    const handleNewNoteClick = async () => {
        const file = new File([''], 'New Note.txt', {
            type: 'text/plain',
        });
        await upload(file, item?.id ?? '');
    };

    const handleDeleteFileClick = async () => {
        if (!item || !item.id) return;
        toast({
            variant: 'destructive',
            title: 'Confirm deletion.',
            description: `Are you sure you want to delete the file ${item.title}? This action is irreversible!`,
            action: (
                <ToastAction
                    altText='Delete'
                    onClick={async () => {
                        const response = await fetch(
                            `/api/routes/files/${item.id}?upsert=true`,
                            {
                                method: 'DELETE',
                            },
                        );
                        const json = await response.json();

                        if (response.ok) {
                            const redirect: boolean = Boolean(
                                item.id && pathname.includes(item.id),
                            );
                            queryClient.invalidateQueries({
                                queryKey: ['sidebar'],
                            });
                            toast({
                                title: 'Deleted succesfully.',
                                description: `We successfully deleted the requested file. ${redirect && 'You will be redirected to the dashboard now.'}`,
                            });
                            if (redirect) {
                                setTimeout(() => {
                                    router.replace(`/dashboard`);
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
                    }}>
                    Delete
                </ToastAction>
            ),
        });
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger className={className}>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className='max-w-40'>
                {item && item.id && (
                    <ContextMenuItem
                        noFocus
                        className='text-xs font-medium truncate max-w-full block'>
                        {item.id}
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
