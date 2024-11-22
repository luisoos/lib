'use client';

import React from 'react';
import { Editor } from '@tiptap/core'; // Replace with actual import
import getButtonClasses from './getButtonClasses';

type Level = 1 | 2 | 3 | 4; // Define Level type if not defined elsewhere

export function HeadingDropdown({ editor }: { editor: Editor }) {
    const [level, setLevel] = React.useState<Level | false>(false);
    const allLevels: Level[] = [1, 2, 3, 4];

    return (
        <div className='flex'>
            {allLevels.map((level: Level) => (
                <button
                    key={level}
                    onClick={() => {
                        editor.chain().focus().toggleHeading({ level }).run();
                        setLevel(level);
                    }}
                    className={getButtonClasses(editor, 'heading', true, {
                        level: level,
                    })}>
                    H{level}
                </button>
            ))}
        </div>
    );
}
