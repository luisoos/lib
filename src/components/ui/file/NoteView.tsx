'use client';
import '~/styles/tiptap.css';

import {
    BubbleMenu,
    Editor,
    EditorContent,
    FloatingMenu,
    useEditor,
} from '@tiptap/react';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Highlight from '@tiptap/extension-highlight';
import Code from '@tiptap/extension-code';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Typography from '@tiptap/extension-typography';
import React, { useEffect, useState } from 'react';
import { cn } from '~/hooks/utils';
import useDebounce from '~/hooks/use-debounce';
import removeExtension from '~/hooks/files/removeExtension';
import { useQueryClient } from '@tanstack/react-query';
import { ColorHighlighter } from '~/hooks/files/colorHighlighter';

const proseClasses = 'prose prose-sm sm:prose lg:prose-md prose-neutral';
const proseTableClasses =
    'prose-table:border-collapse prose-table:border prose-th:p-1 prose-td:p-1 prose-td:border-r prose-td:border-gray-300 prose-th:border-r prose-th:border-gray-300';

const tableBoilerplate = `
  <table style="width:100%" class="not-prose">
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
      <th>Column 3</th>
    </tr>
    <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
      <td>Cell 3</td>
    </tr>
    <tr>
      <td>Cell 4</td>
      <td>Cell 5</td>
      <td>Cell 6</td>
    </tr>
    <tr>
      <td>Cell 7</td>
      <td>Cell 8</td>
      <td>Cell 9</td>
    </tr>
  </table>
`;

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

    const queryClient = useQueryClient();

    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Code,
            Typography,
            ColorHighlighter,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Highlight,
            Typography,
            Bold,
            Italic,
            Strike,
            Heading,
            BulletList,
            OrderedList,
            ListItem,
        ],
        content: editorContent,
        editorProps: {
            attributes: {
                class: cn(
                    proseClasses,
                    proseTableClasses,
                    'prose-li:marker:text-zinc-600',
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
                if (data.data.revalidate === 'sidebar') {
                    console.log('test');
                    queryClient.invalidateQueries({ queryKey: ['sidebar'] });
                }
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
        isActiveEntity?: string,
        floating: boolean = false,
        attributes?: {},
    ) {
        return cn(
            isActiveEntity && editor.isActive(isActiveEntity, attributes)
                ? 'is-active'
                : '',
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
                    {/* <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                        Insert table
                        </button> */}
                    <button
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .insertContent(tableBoilerplate, {
                                    parseOptions: {
                                        preserveWhitespace: false,
                                    },
                                })
                                .run()
                        }
                        className={getButtonClasses(editor)}>
                        Insert HTML table
                    </button>
                    {editor.isActive('table') && (
                        <>
                            <button
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .addColumnBefore()
                                        .run()
                                }
                                disabled={!editor.can().addColumnBefore()}
                                className={getButtonClasses(editor)}>
                                Add column before
                            </button>
                            <button
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .addColumnAfter()
                                        .run()
                                }
                                disabled={!editor.can().addColumnAfter()}
                                className={getButtonClasses(editor)}>
                                Add column after
                            </button>
                            <button
                                onClick={() =>
                                    editor.chain().focus().deleteColumn().run()
                                }
                                disabled={!editor.can().deleteColumn()}
                                className={getButtonClasses(editor)}>
                                Delete column
                            </button>
                            <button
                                onClick={() =>
                                    editor.chain().focus().addRowBefore().run()
                                }
                                disabled={!editor.can().addRowBefore()}
                                className={getButtonClasses(editor)}>
                                Add row before
                            </button>
                            <button
                                onClick={() =>
                                    editor.chain().focus().addRowAfter().run()
                                }
                                disabled={!editor.can().addRowAfter()}
                                className={getButtonClasses(editor)}>
                                Add row after
                            </button>
                            <button
                                onClick={() =>
                                    editor.chain().focus().deleteRow().run()
                                }
                                disabled={!editor.can().deleteRow()}
                                className={getButtonClasses(editor)}>
                                Delete row
                            </button>
                            <button
                                onClick={() =>
                                    editor.chain().focus().deleteTable().run()
                                }
                                disabled={!editor.can().deleteTable()}
                                className={getButtonClasses(editor)}>
                                Delete table
                            </button>
                            <button
                                onClick={() =>
                                    editor.chain().focus().mergeCells().run()
                                }
                                disabled={!editor.can().mergeCells()}
                                className={getButtonClasses(editor)}>
                                Merge cells
                            </button>
                            <button
                                onClick={() =>
                                    editor.chain().focus().splitCell().run()
                                }
                                disabled={!editor.can().splitCell()}
                                className={getButtonClasses(editor)}>
                                Split cell
                            </button>
                            <button
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHeaderColumn()
                                        .run()
                                }
                                disabled={!editor.can().toggleHeaderColumn()}
                                className={getButtonClasses(editor)}>
                                ToggleHeaderColumn
                            </button>
                            <button
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHeaderRow()
                                        .run()
                                }
                                disabled={!editor.can().toggleHeaderRow()}
                                className={getButtonClasses(editor)}>
                                Toggle header row
                            </button>
                            <button
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHeaderCell()
                                        .run()
                                }
                                disabled={!editor.can().toggleHeaderCell()}
                                className={getButtonClasses(editor)}>
                                Toggle header cell
                            </button>
                            <button
                                onClick={() =>
                                    editor.chain().focus().mergeOrSplit().run()
                                }
                                disabled={!editor.can().mergeOrSplit()}
                                className={getButtonClasses(editor)}>
                                Merge or split
                            </button>
                            <button
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setCellAttribute(
                                            'backgroundColor',
                                            '#FAF594',
                                        )
                                        .run()
                                }
                                disabled={
                                    !editor
                                        .can()
                                        .setCellAttribute(
                                            'backgroundColor',
                                            '#FAF594',
                                        )
                                }
                                className={getButtonClasses(editor)}>
                                Set cell attribute
                            </button>
                            <button
                                onClick={() =>
                                    editor.chain().focus().fixTables().run()
                                }
                                disabled={!editor.can().fixTables()}
                                className={getButtonClasses(editor)}>
                                Fix tables
                            </button>
                            <button
                                onClick={() =>
                                    editor.chain().focus().goToNextCell().run()
                                }
                                disabled={!editor.can().goToNextCell()}
                                className={getButtonClasses(editor)}>
                                Go to next cell
                            </button>
                            <button
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .goToPreviousCell()
                                        .run()
                                }
                                disabled={!editor.can().goToPreviousCell()}
                                className={getButtonClasses(editor)}>
                                Go to previous cell
                            </button>
                        </>
                    )}
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
                    <button
                        onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                        }
                        className={getButtonClasses(
                            editor,
                            'orderedList',
                            true,
                        )}>
                        Numbered list
                    </button>
                </FloatingMenu>
            )}

            <EditorContent editor={editor} />
        </>
    );
};
