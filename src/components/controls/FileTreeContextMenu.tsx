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
import { NavMainItem } from '~/types/dashboard/sidebar';
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

// Dialog types for different actions
type DialogType = 'rename' | 'newNote' | 'newFolder' | null;

// Extended props to support multiple selections
interface ExtendedControlComponentProps extends ControlComponentProps {
    selectedItems?: NavMainItem[];
}

const FileTreeContextMenu: React.FC<ExtendedControlComponentProps> = ({
    item,
    className,
    children,
    selectedItems = [],
}) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();

    const [name, setName] = useState<string>(item?.title || '');
    const [dialogType, setDialogType] = useState<DialogType>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dialog handlers
    const openDialog = (type: DialogType) => {
        setDialogType(type);
        setIsDialogOpen(true);
        if (type === 'newNote' || type === 'newFolder') {
            setName('');
        }
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setDialogType(null);
        setIsSubmitting(false);
    };

    const handleNewNoteClick = () => {
        openDialog('newNote');
    };

    const handleNewFolderClick = () => {
        openDialog('newFolder');
    };

    const handleRenameClick = () => {
        openDialog('rename');
    };

    const handleNewNoteSubmit = async () => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            const fileName = name.trim() || 'New Note';
            const file = new File([''], `${fileName}.txt`, {
                type: 'text/plain',
            });
            const result = await upload(file, item?.id ?? '');

            if (result.statusCode === 200) {
                toast({
                    title: 'File created successfully.',
                });
                queryClient.invalidateQueries({
                    queryKey: ['sidebar'],
                });
                closeDialog();
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Failed to create note.',
                description: 'Please try again later.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNewFolderSubmit = async () => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            // TODO: Implement folder creation API
            toast({
                title: 'Folder creation not yet implemented.',
                variant: 'destructive',
            });
            closeDialog();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRenameSubmit = async () => {
        if (!item || !item.id || isSubmitting) return;

        setIsSubmitting(true);
        try {
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
                toast({
                    variant: 'destructive',
                    title: 'Failed to rename file.',
                    description:
                        'There was an error renaming your file. Reload the page or try again later.',
                });
                return;
            }

            queryClient.invalidateQueries({
                queryKey: ['sidebar'],
            });
            toast({
                title: `File renamed successfully to ${name}.`,
            });
            closeDialog();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Failed to rename file.',
                description: 'Please try again later.',
            });
        } finally {
            setIsSubmitting(false);
        }
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

    // Dynamic dialog content based on dialog type
    const renderDialogContent = () => {
        if (!dialogType) return null;

        const getDialogConfig = () => {
            switch (dialogType) {
                case 'rename':
                    return {
                        title: 'Rename file',
                        description: `Enter a new name for ${item?.title && removeExtension(item.title)}.`,
                        placeholder: 'Enter new name',
                        buttonText: 'Rename',
                        onSubmit: handleRenameSubmit,
                    };
                case 'newNote':
                    return {
                        title: 'Create new note',
                        description: 'Enter a name for your new note.',
                        placeholder: 'Enter note name',
                        buttonText: 'Create Note',
                        onSubmit: handleNewNoteSubmit,
                    };
                case 'newFolder':
                    return {
                        title: 'Create new folder',
                        description: 'Enter a name for your new folder.',
                        placeholder: 'Enter folder name',
                        buttonText: 'Create Folder',
                        onSubmit: handleNewFolderSubmit,
                    };
                default:
                    return null;
            }
        };

        const config = getDialogConfig();
        if (!config) return null;

        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{config.title}</DialogTitle>
                    <DialogDescription>{config.description}</DialogDescription>
                    <div className='pt-2 flex w-full items-center space-x-2'>
                        <Input
                            onChange={(e) => setName(e.target.value)}
                            value={dialogType === 'rename' ? removeExtension(name) : name}
                            placeholder={config.placeholder}
                            autoFocus
                            disabled={isSubmitting}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isSubmitting) {
                                    e.preventDefault();
                                    config.onSubmit();
                                }
                            }}
                        />
                        <DialogClose asChild>
                            <Button 
                                onClick={config.onSubmit} 
                                type='submit'
                                disabled={isSubmitting}
                                className="min-w-[125px]"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </span>
                                ) : (
                                    config.buttonText
                                )}
                            </Button>
                        </DialogClose>
                    </div>
                </DialogHeader>
            </DialogContent>
        );
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                            onClick={handleNewFolderClick}
                            icon='FolderPlus'
                            label='New Folder'
                        />
                    </ContextMenuItem>
                    <ContextMenuItem>
                        {/* TODO: Implement extensive download functionality with many options */}
                        <ContextMenuAction icon='Share' label='Export' />
                    </ContextMenuItem>
                    {(item && item.id) && <ContextMenuItem>
                        <ContextMenuAction
                            onClick={handleRenameClick}
                            icon='Edit'
                            label='Rename'
                        />
                    </ContextMenuItem>}
                    {(item && item.id) && <ContextMenuItem>
                        <ContextMenuAction
                            onClick={handleDeleteFileClick}
                            icon='Trash2'
                            label='Delete'
                            className='text-red-600'
                        />
                    </ContextMenuItem>}
                </ContextMenuContent>
            </ContextMenu>
            {renderDialogContent()}
        </Dialog>
    );
};

export default FileTreeContextMenu;
