import '~/styles/tiptap.css';

import {
    BubbleMenu,
    Editor,
    EditorContent,
    FloatingMenu,
    useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect, useState } from 'react';
import { cn } from '~/hooks/utils';
import useDebounce from '~/hooks/use-debounce';
import removeExtension from '~/hooks/files/removeExtension';

const proseClasses = 'prose prose-sm sm:prose lg:prose-md prose-neutral';

export default ({
    fileId,
    fileName,
    content,
}: {
    fileId: string;
    fileName: string;
    content?: string;
}) => {
    const [title, setTitle] = useState(removeExtension(fileName));
    const [editorContent, setEditorContent] = useState(content);
    const debouncedContent = useDebounce([editorContent, title], 5000);

    const editor = useEditor({
        extensions: [StarterKit],
        content: editorContent,
        editorProps: {
            attributes: {
                class: cn(
                    proseClasses,
                    'mx-auto focus:outline-none focus-visible:outline-none',
                ),
                style: 'height: 90vh;',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setEditorContent(html);
        },
    });

    const handleTitleChange = (event: {
        target: { value: React.SetStateAction<string> };
    }) => {
        setTitle(event.target.value);
    };

    useEffect(() => {
        const updateFile = async () => {
            const response = await fetch(`/api/routes/files/${fileId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: title,
                    fileData: editorContent,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setEditorContent(data.data.fileContent);
            } else {
                console.error('Failed to fetch file');
            }
        };

        if (
            editor &&
            debouncedContent &&
            (debouncedContent[0] !== editorContent ||
                debouncedContent[1] !== title)
        ) {
            updateFile();
        }
    }, [debouncedContent, editor, editorContent, title]);

    function getButtonClasses(
        editor: Editor,
        isActiveEntity: string,
        floating: boolean = false,
        attributes?: {},
    ) {
        return cn(
            editor.isActive(isActiveEntity, attributes) ? 'is-active' : '',
            floating
                ? 'rounded border bg-white px-1 mx-1 opacity-80 hover:opacity-100 hover:shadow-inner transition-all duration-100'
                : 'px-2 py-0.5',
        );
    }

    return (
        <>
            <div className={cn(proseClasses, 'mx-auto')}>
                <input
                    className='text-xl font-medium rounded focus:outline-none focus-visible:outline-none focus-visible:opacity-80 transition-all delay-75'
                    type='text'
                    value={title}
                    onChange={handleTitleChange}
                />
            </div>
            {editor && (
                <BubbleMenu
                    className='divide-x rounded border shadow-inner bg-white'
                    tippyOptions={{ duration: 100 }}
                    editor={editor}>
                    <button
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                        className={getButtonClasses(editor, 'bold')}>
                        Bold
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        className={getButtonClasses(editor, 'italic')}>
                        Italic
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().toggleStrike().run()
                        }
                        className={getButtonClasses(editor, 'strike')}>
                        Strike
                    </button>
                </BubbleMenu>
            )}

            {editor && (
                <FloatingMenu
                    className='text-sm'
                    tippyOptions={{ duration: 100 }}
                    editor={editor}>
                    <button
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                        }
                        className={getButtonClasses(editor, 'heading', true, {
                            level: 1,
                        })}>
                        H1
                    </button>
                    <button
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                        className={getButtonClasses(editor, 'heading', true, {
                            level: 2,
                        })}>
                        H2
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                        }
                        className={getButtonClasses(
                            editor,
                            'bulletList',
                            true,
                        )}>
                        Bullet list
                    </button>
                </FloatingMenu>
            )}

            <EditorContent editor={editor} />
        </>
    );
};
