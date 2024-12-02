import { Editor } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react';
import {
    BetweenHorizonalEnd,
    BetweenHorizonalStart,
    BetweenVerticalEnd,
    BetweenVerticalStart,
    Bold,
    Grid2x2X,
    Heading,
    Italic,
    LinkIcon,
    SquareSplitHorizontal,
    Strikethrough,
    Subscript,
    Superscript,
    Table,
    TableColumnsSplit,
    Trash,
    Underline,
    WandSparkles,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import getButtonClasses from '~/components/ui/file/NoteView/getButtonClasses';
import { cn } from '~/hooks/utils';
import { HighlightDropdown } from './HighlightDropdown';
import { motion } from 'framer-motion';

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

const tableClasses = 'flex h-6 border-none w-full text-left text-sm';

export default function CompleteBubbleMenu({ editor }: { editor: Editor }) {
    const [isHovered, setIsHovered] = useState(false);
    const [showTableMenu, setShowTableMenu] = useState(true);

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
                'h-7 pt-auto z-50 divide-x rounded border shadow-inner bg-white',
            )}
            tippyOptions={{ duration: 100 }}
            editor={editor}>
            <button
                title='Bold'
                onClick={() => editor.chain().focus().toggleBold().run()}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    getButtonClasses(editor),
                    'bold',
                    'bg-transparent border-none cursor-pointer',
                )}>
                <Bold
                    size={16}
                    strokeWidth={isHovered ? '3' : '2'} // Change strokeWidth based on hover state
                    className={`transition-all duration-300`} // Tailwind for smooth transition
                />
            </button>
            <button
                title='Italic'
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={getButtonClasses(editor, 'italic')}>
                <Italic size={16} />
            </button>
            <button
                title='Strikethrough'
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={getButtonClasses(editor, 'strike')}>
                <Strikethrough size={16} />
            </button>
            <button
                title='Underline'
                onClick={() =>
                    editor.isActive('underline')
                        ? editor.chain().focus().setUnderline().run()
                        : editor.chain().focus().setUnderline().run()
                }
                className={cn(
                    getButtonClasses(editor),
                    editor.isActive('underline') ? 'opacity-80' : '',
                )}>
                <Underline size={16} />
            </button>
            <HighlightDropdown editor={editor} requirements={showTableMenu} />
            <button
                title='Subscript'
                onClick={() =>
                    editor.isActive('subscript')
                        ? editor.chain().focus().unsetSubscript().run()
                        : editor.chain().focus().setSubscript().run()
                }
                className={cn(
                    getButtonClasses(editor),
                    editor.isActive('subscript') ? 'opacity-80' : '',
                )}>
                <Subscript size={16} />
            </button>
            <button
                title='Superscript'
                onClick={() =>
                    editor.isActive('superscript')
                        ? editor.chain().focus().setSuperscript().run()
                        : editor.chain().focus().setSuperscript().run()
                }
                className={cn(
                    getButtonClasses(editor),
                    editor.isActive('superscript') ? 'opacity-80' : '',
                )}>
                <Superscript size={16} />
            </button>
            <button
                title='Add link'
                onClick={() =>
                    editor.isActive('link')
                        ? editor.chain().focus().unsetLink().run()
                        : setLink
                }
                className={cn(
                    getButtonClasses(editor),
                    editor.isActive('link') ? 'opacity-80' : '',
                )}>
                <LinkIcon size={16} />
            </button>
            <button
                title='Insert table'
                onClick={() =>
                    editor.isActive('table')
                        ? setShowTableMenu(!showTableMenu)
                        : editor
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
                <Table size={16} strokeWidth={1.8} />
            </button>
            {editor.isActive('table') && showTableMenu && (
                <motion.div
                    className={cn(
                        'absolute mt-2 px-1 py-0.5 z-10 bg-white rounded border shadow-inner',
                    )}
                    initial={{ opacity: 0, x: 0, y: -50 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 0, y: -50 }}
                    transition={{
                        duration: 0.3,
                        delay: 0,
                        type: 'spring',
                    }}>
                    <button
                        onClick={() =>
                            editor.chain().focus().addColumnBefore().run()
                        }
                        disabled={!editor.can().addColumnBefore()}
                        className={cn(getButtonClasses(editor), tableClasses)}>
                        <BetweenVerticalStart size={16} className='mr-1' /> Add
                        column before
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().addColumnAfter().run()
                        }
                        disabled={!editor.can().addColumnAfter()}
                        className={cn(getButtonClasses(editor), tableClasses)}>
                        <BetweenVerticalEnd size={16} className='mr-1' /> Add
                        column after
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().deleteColumn().run()
                        }
                        disabled={!editor.can().deleteColumn()}
                        className={cn(getButtonClasses(editor), tableClasses)}>
                        <Grid2x2X size={16} className='mr-1' /> Delete column
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().addRowBefore().run()
                        }
                        disabled={!editor.can().addRowBefore()}
                        className={cn(getButtonClasses(editor), tableClasses)}>
                        <BetweenHorizonalStart size={16} className='mr-1' /> Add
                        row before
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().addRowAfter().run()
                        }
                        disabled={!editor.can().addRowAfter()}
                        className={cn(getButtonClasses(editor), tableClasses)}>
                        <BetweenHorizonalEnd size={16} className='mr-1' /> Add
                        row after
                    </button>
                    <button
                        onClick={() => editor.chain().focus().deleteRow().run()}
                        disabled={!editor.can().deleteRow()}
                        className={cn(getButtonClasses(editor), tableClasses)}>
                        <Grid2x2X size={16} className='mr-1' /> Delete row
                    </button>
                    {/* <button
                        onClick={() =>
                            editor.chain().focus().mergeCells().run()
                        }
                        disabled={!editor.can().mergeCells()}
                        className={cn(
                            getButtonClasses(editor),
                            tableClasses,
                        )}>
                        Merge cells
                    </button>
                    <button
                        onClick={() => editor.chain().focus().splitCell().run()}
                        disabled={!editor.can().splitCell()}
                        className={cn(
                            getButtonClasses(editor),
                            tableClasses,
                        )}>
                        <SquareSplitHorizontal size={16} className="mr-1" /> Split cell
                    </button> */}
                    {/* <button
                        onClick={() =>
                            editor.chain().focus().toggleHeaderColumn().run()
                        }
                        disabled={!editor.can().toggleHeaderColumn()}
                        className={cn(
                            getButtonClasses(editor),
                            tableClasses,
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
                            tableClasses,
                        )}>
                        Toggle Header Row
                    </button> */}
                    <button
                        onClick={() =>
                            editor.chain().focus().toggleHeaderCell().run()
                        }
                        disabled={!editor.can().toggleHeaderCell()}
                        className={cn(getButtonClasses(editor), tableClasses)}>
                        <Heading size={16} className='mr-1' />
                        Toggle Header Cell
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().mergeOrSplit().run()
                        }
                        disabled={!editor.can().mergeOrSplit()}
                        className={cn(getButtonClasses(editor), tableClasses)}>
                        <TableColumnsSplit size={16} className='mr-1' /> Merge
                        or split
                    </button>
                    {/* <button
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
                            tableClasses,
                        )}>
                        Set cell attribute
                    </button> */}
                    <button
                        onClick={() => editor.chain().focus().fixTables().run()}
                        disabled={!editor.can().fixTables()}
                        className={cn(getButtonClasses(editor), tableClasses)}>
                        <WandSparkles size={16} className='mr-1' /> Fix tables
                    </button>
                    {/* <button
                        onClick={() =>
                            editor.chain().focus().goToNextCell().run()
                        }
                        disabled={!editor.can().goToNextCell()}
                        className={cn(
                            getButtonClasses(editor),
                            tableClasses,
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
                            tableClasses,
                        )}>
                        Go to previous cell
                    </button> */}
                    <button
                        onClick={() =>
                            editor.chain().focus().deleteTable().run()
                        }
                        disabled={!editor.can().deleteTable()}
                        className={cn(
                            getButtonClasses(editor),
                            tableClasses,
                            'text-red-600',
                        )}>
                        <Trash size={16} className='mr-1' /> Delete table
                    </button>
                </motion.div>
            )}
        </BubbleMenu>
    );
}
