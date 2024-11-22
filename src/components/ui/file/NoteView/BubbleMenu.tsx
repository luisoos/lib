import { Editor } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react';
import {
    Bold,
    Italic,
    LinkIcon,
    Strikethrough,
    Subscript,
    Superscript,
    Table,
    Underline,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import getButtonClasses from '~/components/ui/file/NoteView/getButtonClasses';
import { cn } from '~/hooks/utils';

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

export default function CompleteBubbleMenu({ editor }: { editor: Editor }) {
    const [isHovered, setIsHovered] = useState(false);

    const setLink = useCallback(() => {
        if (!editor) {
            return null;
        }

        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();

            return;
        }

        // update link
        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url })
            .run();
    }, [editor]);
    return (
        <BubbleMenu
            className={cn(
                'divide-x rounded border shadow-inner bg-white',
                editor.isActive('table') ? 'w-[19rem] px-auto' : '',
            )}
            tippyOptions={{ duration: 100 }}
            editor={editor}>
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    getButtonClasses(editor),
                    'bold',
                    'bg-transparent border-none cursor-pointer',
                )}>
                <Bold
                    size={20}
                    strokeWidth={isHovered ? '3' : '2'} // Change strokeWidth based on hover state
                    className={`transition-all duration-300`} // Tailwind for smooth transition
                />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={getButtonClasses(editor, 'italic')}>
                <Italic size={20} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={getButtonClasses(editor, 'strike')}>
                <Strikethrough size={20} />
            </button>
            {/* <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                        Insert table
                        </button> */}
            <button
                onClick={() =>
                    editor.isActive('subscript')
                        ? editor.chain().focus().unsetSubscript().run()
                        : editor.chain().focus().setSubscript().run()
                }
                className={cn(
                    getButtonClasses(editor),
                    editor.isActive('subscript') ? 'opacity-80' : '',
                    'mt-0.5',
                )}>
                <Subscript size={20} />
            </button>
            <button
                onClick={() =>
                    editor.isActive('superscript')
                        ? editor.chain().focus().setSuperscript().run()
                        : editor.chain().focus().setSuperscript().run()
                }
                className={cn(
                    getButtonClasses(editor),
                    editor.isActive('superscript') ? 'opacity-80' : '',
                    'mt-0.5',
                )}>
                <Superscript size={20} />
            </button>
            <button
                onClick={() =>
                    editor.isActive('underline')
                        ? editor.chain().focus().setUnderline().run()
                        : editor.chain().focus().setUnderline().run()
                }
                className={cn(
                    getButtonClasses(editor),
                    editor.isActive('underline') ? 'opacity-80' : '',
                    'mt-0.5',
                )}>
                <Underline size={20} />
            </button>
            <button
                onClick={() =>
                    editor.isActive('link')
                        ? editor.chain().focus().unsetLink().run()
                        : setLink
                }
                className={cn(
                    getButtonClasses(editor),
                    editor.isActive('link') ? 'opacity-80' : '',
                    'mt-0.5',
                )}>
                <LinkIcon size={20} />
            </button>
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
                <Table size={20} />
            </button>
            {editor.isActive('table') && (
                <>
                    <button
                        onClick={() =>
                            editor.chain().focus().addColumnBefore().run()
                        }
                        disabled={!editor.can().addColumnBefore()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Add column before
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().addColumnAfter().run()
                        }
                        disabled={!editor.can().addColumnAfter()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Add column after
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().deleteColumn().run()
                        }
                        disabled={!editor.can().deleteColumn()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Delete column
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().addRowBefore().run()
                        }
                        disabled={!editor.can().addRowBefore()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Add row before
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().addRowAfter().run()
                        }
                        disabled={!editor.can().addRowAfter()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Add row after
                    </button>
                    <button
                        onClick={() => editor.chain().focus().deleteRow().run()}
                        disabled={!editor.can().deleteRow()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Delete row
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().deleteTable().run()
                        }
                        disabled={!editor.can().deleteTable()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Delete table
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().mergeCells().run()
                        }
                        disabled={!editor.can().mergeCells()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Merge cells
                    </button>
                    <button
                        onClick={() => editor.chain().focus().splitCell().run()}
                        disabled={!editor.can().splitCell()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Split cell
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().toggleHeaderColumn().run()
                        }
                        disabled={!editor.can().toggleHeaderColumn()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Toggle Header Column
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().toggleHeaderRow().run()
                        }
                        disabled={!editor.can().toggleHeaderRow()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Toggle Header Row
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().toggleHeaderCell().run()
                        }
                        disabled={!editor.can().toggleHeaderCell()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Toggle Header Cell
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().mergeOrSplit().run()
                        }
                        disabled={!editor.can().mergeOrSplit()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Merge or split
                    </button>
                    <button
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .setCellAttribute('backgroundColor', '#FAF594')
                                .run()
                        }
                        disabled={
                            !editor
                                .can()
                                .setCellAttribute('backgroundColor', '#FAF594')
                        }
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Set cell attribute
                    </button>
                    <button
                        onClick={() => editor.chain().focus().fixTables().run()}
                        disabled={!editor.can().fixTables()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Fix tables
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().goToNextCell().run()
                        }
                        disabled={!editor.can().goToNextCell()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Go to next cell
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().goToPreviousCell().run()
                        }
                        disabled={!editor.can().goToPreviousCell()}
                        className={cn(
                            getButtonClasses(editor),
                            'h-6 border-none w-72 text-left text-sm',
                        )}>
                        Go to previous cell
                    </button>
                </>
            )}
        </BubbleMenu>
    );
}
