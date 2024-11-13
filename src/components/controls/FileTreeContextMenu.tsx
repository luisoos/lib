import { FilePlus2, FileUp, FolderPlus, Share, Trash2 } from 'lucide-react';
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
    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const selectedFile = event.target.files?.[0];
        await upload(selectedFile);
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
                <ContextMenuItem className='cursor-pointer'>
                    <label htmlFor='file-upload' className='w-full'>
                        <input
                            id='file-upload'
                            type='file'
                            onChange={handleFileChange}
                            className='hidden'
                        />
                        <ContextMenuAction icon='FileUp' label='Upload File' />
                    </label>
                </ContextMenuItem>
                <ContextMenuItem>
                    <ContextMenuAction icon='FilePlus2' label='New Note' />
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
