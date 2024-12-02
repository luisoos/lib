'use client';

import * as React from 'react';
import { Editor } from '@tiptap/core';
import { cn } from '~/hooks/utils';
import { Circle, CircleSlash } from 'lucide-react';
import getButtonClasses from './getButtonClasses';
import { motion } from 'framer-motion';

// TODO

const colors: string[] = ['#ffc078', '#8ce99a', '#74c0fc', '#b197fc'];

function getCurrentColor(editor: Editor) {
    colors.forEach((color) => {
        if (editor.isActive('highlight', { color: color })) return color;
    });
    return false;
}

function Color({ color, className }: { color: string; className?: string }) {
    return <Circle size={16} fill={color} className={className} />;
}

function NoColor({ className }: { className?: string }) {
    return (
        <CircleSlash
            size={16}
            fill='#49477f'
            fillOpacity={0.4}
            className={className}
        />
    );
}

export function HighlightDropdown({
    editor,
    requirements,
}: {
    editor: Editor;
    requirements?: {};
}) {
    const [dropdownState, setDropdownState] = React.useState(false);
    React.useEffect(() => {
        setDropdownState(false);
    }, [requirements]);
    return (
        <>
            <button
                onClick={() => setDropdownState(!dropdownState)}
                className={cn('z-30', getButtonClasses(editor, 'highlight'))}>
                {getCurrentColor(editor) ? (
                    <Color color={String(getCurrentColor(editor))} />
                ) : (
                    <NoColor />
                )}
            </button>
            {dropdownState && (
                <motion.div
                    className={cn(
                        'absolute h-6 px-1 py-0.5 z-20 bg-white rounded-b border-x border-b shadow-inner -translate-y-1',
                    )}
                    style={{ left: '100px' }}
                    initial={{ opacity: 0, x: 0, y: -50 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{
                        duration: 0.3,
                        delay: 0,
                        type: 'spring',
                    }}>
                    <>
                        {colors.map((color) => (
                            <button
                                title='Highlight'
                                key={color}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHighlight({ color: color })
                                        .run()
                                }
                                className={
                                    editor.isActive('highlight', {
                                        color: color,
                                    })
                                        ? 'is-active'
                                        : ''
                                }>
                                <Color color={color} className='mr-1' />
                            </button>
                        ))}
                    </>
                    <button
                        title='Remove highlight'
                        onClick={() =>
                            editor.chain().focus().unsetHighlight().run()
                        }
                        disabled={!editor.isActive('highlight')}>
                        <NoColor />
                    </button>
                </motion.div>
            )}
        </>
    );
}
