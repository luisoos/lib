'use client';

import * as React from 'react';
import { Editor } from '@tiptap/core';

// TODO

export function HighlightDropdown({ editor }: { editor: Editor }) {
    return (
        <>
            <button
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={editor.isActive('highlight') ? 'is-active' : ''}>
                Toggle highlight
            </button>
            <button
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: '#ffc078' })
                        .run()
                }
                className={
                    editor.isActive('highlight', { color: '#ffc078' })
                        ? 'is-active'
                        : ''
                }>
                Orange
            </button>
            <button
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: '#8ce99a' })
                        .run()
                }
                className={
                    editor.isActive('highlight', { color: '#8ce99a' })
                        ? 'is-active'
                        : ''
                }>
                Green
            </button>
            <button
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: '#74c0fc' })
                        .run()
                }
                className={
                    editor.isActive('highlight', { color: '#74c0fc' })
                        ? 'is-active'
                        : ''
                }>
                Blue
            </button>
            <button
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: '#b197fc' })
                        .run()
                }
                className={
                    editor.isActive('highlight', { color: '#b197fc' })
                        ? 'is-active'
                        : ''
                }>
                Purple
            </button>
            <button
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: 'red' })
                        .run()
                }
                className={
                    editor.isActive('highlight', { color: 'red' })
                        ? 'is-active'
                        : ''
                }>
                Red ('red')
            </button>
            <button
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: '#ffa8a8' })
                        .run()
                }
                className={
                    editor.isActive('highlight', { color: '#ffa8a8' })
                        ? 'is-active'
                        : ''
                }>
                Red (#ffa8a8)
            </button>
            <button
                onClick={() => editor.chain().focus().unsetHighlight().run()}
                disabled={!editor.isActive('highlight')}>
                Unset highlight
            </button>
        </>
    );
}
