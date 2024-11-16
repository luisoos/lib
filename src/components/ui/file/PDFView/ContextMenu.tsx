import React from 'react';
import { cn } from '~/hooks/utils';
import { ContextMenuAction } from '~/components/ui/context-menu';

export interface ContextMenuProps {
    xPos: any;
    yPos: any;
    editComment: () => void;
    deleteHighlight: () => void;
}

const ContextMenu = ({
    xPos,
    yPos,
    editComment,
    deleteHighlight,
}: ContextMenuProps) => {
    return (
        <div
            className='fixed rounded border bg-white shadow z-20'
            style={{ top: yPos + 2, left: xPos + 2 }}>
            <ContextMenuItem onClick={editComment}>
                <ContextMenuAction icon='Pencil' label='Edit Comment' />
            </ContextMenuItem>
            <ContextMenuItem onClick={deleteHighlight}>
                <ContextMenuAction
                    icon='Trash2'
                    label='Delete'
                    className='text-red-600'
                />
            </ContextMenuItem>
        </div>

        // <div className='context-menu' style={{ top: yPos + 2, left: xPos + 2 }}>
        //     <button onClick={editComment}>Edit Comment</button>
        //     <button onClick={deleteHighlight}>Delete</button>
        // </div>
    );
};

export default ContextMenu;

interface ContextMenuItemProps {
    children: React.ReactNode;
    onClick: () => void;
}

const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
    children,
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                'hover:bg-gray-100',
            )}>
            {children}
        </div>
    );
};
