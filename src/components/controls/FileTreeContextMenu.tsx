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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import removeExtension, {
    addFileExtension,
} from '~/hooks/files/removeExtension';
import getFileUrl from '~/hooks/files/getFileUrl';

const FileTreeContextMenu: React.FC<ControlComponentProps> = ({
    item,
    className,
    children,
}) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();

    const [name, setName] = useState<string>(item?.title || '');

    const handleNewNoteClick = async () => {
        const file = new File([''], 'New Note.txt', {
            type: 'text/plain',
        });
        await upload(file, item?.id ?? '');
    };

    const handleRenameFileClick = async () => {
        if (!item || !item.id) return;

        const response = await fetch(
            `/api/routes/files/${item.id}?upsert=false`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: addFileExtension(item, name),
                }),
            },
        );

        let json = await response.json();

        if (response.status === 409) {
            toast({
                variant: 'destructive',
                title: 'Conflict',
                description:
                    'There already is a file with this name at the given location.',
                action: (
                    <ToastAction
                        altText='Replace'
                        onClick={async () => {
                            const toastResponse = await fetch(
                                `/api/routes/files/${item.id}?upsert=true`,
                                {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        fileName: addFileExtension(item, name),
                                    }),
                                },
                            );

                            json = await toastResponse.json();
                        }}>
                        Replace
                    </ToastAction>
                ),
            });
        } else if (!response.ok) {
            return toast({
                variant: 'destructive',
                title: 'Failed to rename file.',
                description:
                    'There was an error renaming your file. Reload the page or try again later.',
            });
        }

        queryClient.invalidateQueries({
            queryKey: ['sidebar'],
        });
        toast({
            title: `File renamed successfully to ${name}.`,
        });
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
                            `/api/routes/files/${item.id}`,
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
        <Dialog>
            <ContextMenu>
                <ContextMenuTrigger className={className}>
                    {children}
                </ContextMenuTrigger>
                <ContextMenuContent className='max-w-40'>
                    {item && item.id && (
                        <ContextMenuItem
                            noFocus
                            className='text-xs font-medium truncate max-w-full block'>
                            {removeExtension(item.title) ?? item.id}
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
                        <ContextMenuAction
                            icon='FolderPlus'
                            label='New Folder'
                        />
                    </ContextMenuItem>
                    <ContextMenuItem>
                        <ContextMenuAction icon='Share' label='Export' />
                    </ContextMenuItem>
                    <ContextMenuItem>
                        <DialogTrigger className='w-full'>
                            <ContextMenuAction icon='Edit' label='Rename' />
                        </DialogTrigger>
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename file</DialogTitle>
                    <DialogDescription>
                        Enter a new name for{' '}
                        {item?.title && removeExtension(item.title)}.
                    </DialogDescription>
                    <div className='flex w-full max-w-sm items-center space-x-2'>
                        <Input
                            onChange={(e) => setName(e.target.value)}
                            value={removeExtension(name)}
                        />
                        <DialogClose asChild>
                            <Button
                                onClick={handleRenameFileClick}
                                type='submit'>
                                Rename
                            </Button>
                        </DialogClose>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default FileTreeContextMenu;
