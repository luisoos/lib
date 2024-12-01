'use client';

import * as React from 'react';
import { Editor } from '@tiptap/core';
import { cn } from '~/hooks/utils';

// TODO

const colors: string[] = [
    '#ffc078',
    '#8ce99a',
    '#74c0fc',
    '#b197fc',
];

function getCurrentColor(editor: Editor) {
    colors.forEach(color => {
        if(editor.isActive('highlight', { color: color })) return color;
    });
    return false;
}

function Color({ className }: { className?: string }) {
    return <div className={cn("w-4 h-4 mx-1 border rounded-full shadow-inner", className)}></div>
}

function NoColor({ className }: { className?: string }) {
    return '/'
}

export function HighlightDropdown({ editor }: { editor: Editor }) {
    const [dropdownState, setDropdownState] = React.useState(false);
    return (
        <>
            <button
                onClick={() => setDropdownState(true)}
                className={editor.isActive('highlight') ? 'is-active' : ''}>
                {getCurrentColor(editor) ? <Color className={`bg-${getCurrentColor(editor)}`} /> : <NoColor />}
            </button>
            {dropdownState && <div className={cn("absolute")}><>{colors.map((color) => {
                <button
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleHighlight({ color: color })
                            .run()
                    }
                    className={
                        editor.isActive('highlight', { color: color })
                            ? 'is-active'
                            : ''
                    }>
                    <Color className={`bg-${color}`} />
                </button>
            })}</>
            <button
                onClick={() => editor.chain().focus().unsetHighlight().run()}
                disabled={!editor.isActive('highlight')}>
                <NoColor />
            </button></div> }
        </>
    );
}
