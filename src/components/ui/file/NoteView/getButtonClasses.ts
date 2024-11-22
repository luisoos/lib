import { Editor } from '@tiptap/core';
import { cn } from '~/hooks/utils';

export default function getButtonClasses(
    editor: Editor,
    isActiveEntity?: string,
    floating: boolean = false,
    attributes?: {},
) {
    return cn(
        isActiveEntity && editor.isActive(isActiveEntity, attributes)
            ? 'is-active'
            : '',
        floating
            ? 'rounded border bg-white p-0.5 mr-2 opacity-80 hover:opacity-100 hover:shadow-inner'
            : 'h-8 px-2 py-0.5 hover:opacity-80',
        'transition-all duration-100',
    );
}
