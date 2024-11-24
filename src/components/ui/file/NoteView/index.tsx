'use client';

import '~/styles/tiptap.css';

import { EditorContent, useEditor } from '@tiptap/react';
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
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Text from '@tiptap/extension-text';
import Typography from '@tiptap/extension-typography';
import React, { useEffect, useState } from 'react';
import { cn } from '~/hooks/utils';
import useDebounce from '~/hooks/use-debounce';
import removeExtension from '~/hooks/files/removeExtension';
import { useQueryClient } from '@tanstack/react-query';
import { ColorHighlighter } from '~/hooks/files/colorHighlighter';
import CompleteBubbleMenu from '~/components/ui/file/NoteView/BubbleMenu';
import CompleteFloatingMenu from '~/components/ui/file/NoteView/FloatingMenu';
import { useToast } from '~/hooks/use-toast';
import { ToastAction } from '../../toast';
import { useRouter } from 'next/navigation';
import getFileUrl from '~/hooks/files/getFileUrl';

const proseClasses = 'prose prose-sm sm:prose lg:prose-md prose-neutral';
const proseTableClasses =
    'prose-table:border-collapse prose-table:border prose-th:p-1 prose-td:p-1 prose-td:border-r prose-td:border-gray-300 prose-th:border-r prose-th:border-gray-300';

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
    const [updatedContent, setUpdatedContent] = useState<string | undefined>(
        content,
    );
    const [editorContent, setEditorContent] = useState(content);
    const [isFocused, setIsFocused] = useState<boolean>();
    const debouncedContent = useDebounce([editorContent, title], 2000);

    const { toast } = useToast();
    const queryClient = useQueryClient();
    const router = useRouter();

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
            Highlight.configure({ multicolor: true }),
            Superscript,
            Subscript,
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
                protocols: ['http', 'https'],
                isAllowedUri: (url, ctx) => {
                    try {
                        // construct URL
                        const parsedUrl = url.includes(':')
                            ? new URL(url)
                            : new URL(`${ctx.defaultProtocol}://${url}`);

                        // use default validation
                        if (!ctx.defaultValidate(parsedUrl.href)) {
                            return false;
                        }

                        // disallowed protocols
                        const disallowedProtocols = ['ftp', 'file', 'mailto'];
                        const protocol = parsedUrl.protocol.replace(':', '');

                        if (disallowedProtocols.includes(protocol)) {
                            return false;
                        }

                        // only allow protocols specified in ctx.protocols
                        const allowedProtocols = ctx.protocols.map((p) =>
                            typeof p === 'string' ? p : p.scheme,
                        );

                        if (!allowedProtocols.includes(protocol)) {
                            return false;
                        }

                        // disallowed domains
                        const disallowedDomains = [
                            'example-phishing.com',
                            'malicious-site.net',
                        ];
                        const domain = parsedUrl.hostname;

                        if (disallowedDomains.includes(domain)) {
                            return false;
                        }

                        // all checks have passed
                        return true;
                    } catch (error) {
                        return false;
                    }
                },
                shouldAutoLink: (url) => {
                    try {
                        // construct URL
                        const parsedUrl = url.includes(':')
                            ? new URL(url)
                            : new URL(`https://${url}`);

                        // only auto-link if the domain is not in the disallowed list
                        const disallowedDomains = [
                            'example-no-autolink.com',
                            'another-no-autolink.com',
                        ];
                        const domain = parsedUrl.hostname;

                        return !disallowedDomains.includes(domain);
                    } catch (error) {
                        return false;
                    }
                },
            }),
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
            try {
                if (editorContent === updatedContent) return;
                const response = await fetch(`/api/routes/files/${fileId}?upsert=${title === removeExtension(fileName)}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fileName: title,
                        fileData: editorContent,
                    }),
                });

                if (!response.ok) {
                    console.error('Failed to fetch file');
                }

                setUpdatedContent(editorContent);

                const json = await response.json();

                if (response.status === 409) {
                    toast({
                        variant: 'destructive',
                        title: 'Conflict',
                        description:
                            'There already is a file with this name at the given location.',
                        action: (
                            <ToastAction
                                altText='Replace'
                                onClick={async () => {
                                    const toastResponse = await fetch(
                                        `/api/routes/files/${fileId}?upsert=true`,
                                        {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type':
                                                    'application/json',
                                            },
                                            body: JSON.stringify({
                                                fileName: title,
                                                fileData: editorContent,
                                            }),
                                        },
                                    );
                                    const toastJson =
                                        await toastResponse.json();
                                    router.push(
                                        getFileUrl(
                                            toastJson.data.data.id,
                                            false,
                                        ),
                                    );
                                }}>
                                Replace
                            </ToastAction>
                        ),
                    });
                }

                console.log(json);

                if (json.data) {
                    if (json.data.revalidate === 'sidebar') {
                        console.log('test');
                        queryClient.invalidateQueries({
                            queryKey: ['sidebar'],
                        });
                    } else if (json.data.revalidate === 'redirect') {
                        router.push(getFileUrl(json.data.data.id, false));
                    }
                }
            } catch (error: any) {
                console.error(error.message);
            }
        };

        if (editor && debouncedContent) {
            updateFile();
        }
    }, [debouncedContent, isFocused]); // Only depend on debounced values

    return (
        <>
            <div className={cn(proseClasses, 'mx-auto')}>
                <input
                    className='text-xl font-medium rounded focus:outline-none focus-visible:outline-none focus-visible:opacity-80 transition-all delay-75'
                    type='text'
                    value={title}
                    onChange={handleTitleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </div>
            {editor && <CompleteBubbleMenu editor={editor} />}

            {editor && <CompleteFloatingMenu editor={editor} />}

            <EditorContent editor={editor} />
        </>
    );
};
