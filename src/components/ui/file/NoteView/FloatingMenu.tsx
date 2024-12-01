import { Editor } from '@tiptap/core';
import { FloatingMenu } from '@tiptap/react';
import getButtonClasses from '~/components/ui/file/NoteView/getButtonClasses';
import { HeadingDropdown } from '~/components/ui/file/NoteView/HeadingDropdown';

import {
    Bold,
    List,
    ListOrdered,
    Subscript,
    Superscript,
    Underline,
} from 'lucide-react';

export default function CompleteFloatingMenu({ editor }: { editor: Editor }) {
    return (
        <FloatingMenu
            className='text-sm flex'
            tippyOptions={{ duration: 100 }}
            editor={editor}>
            <HeadingDropdown editor={editor} />
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={getButtonClasses(editor, 'bulletList', true)}>
                <List size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={getButtonClasses(editor, 'orderedList', true)}>
                <ListOrdered size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={getButtonClasses(editor, 'bold', true)}>
                <Bold size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={getButtonClasses(editor, 'underline', true)}>
                <Underline size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                className={getButtonClasses(editor, 'subscript', true)}>
                <Subscript size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                className={getButtonClasses(editor, 'superscript', true)}>
                <Superscript size={16} />
            </button>
            {/* <HighlightDropdown editor={editor} /> */}
        </FloatingMenu>
    );
}
