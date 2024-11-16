/* This project uses [react-pdf-highlighter-extended](https://github.com/DanielArnould/react-pdf-highlighter-extended) 
by Daniel Arnould, licensed under the MIT License. */

import React, { MouseEvent, useEffect, useRef, useState } from 'react';
import CommentForm from './CommentForm';
import ContextMenu, { ContextMenuProps } from './ContextMenu';
import ExpandableTip from './ExpandableTip';
import HighlightContainer from './HighlightContainer';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import {
    GhostHighlight,
    Highlight,
    PdfHighlighter,
    PdfHighlighterUtils,
    PdfLoader,
    Tip,
    ViewportHighlight,
} from 'react-pdf-highlighter-extended';
import { CommentedHighlight } from '~/types/files/pdf';

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () => {
    return document.location.hash.slice('#highlight-'.length);
};

const resetHash = () => {
    document.location.hash = '';
};

const PDFView = ({ content }: { content: string }) => {
    const [url, setUrl] = useState('https://arxiv.org/pdf/2203.11115');
    const [highlights, setHighlights] = useState<Array<CommentedHighlight>>();
    const currentPdfIndexRef = useRef(0);
    const [contextMenu, setContextMenu] = useState<ContextMenuProps | null>(
        null,
    );
    const [pdfScaleValue, setPdfScaleValue] = useState<number | undefined>(
        undefined,
    );
    const [highlightPen, setHighlightPen] = useState<boolean>(false);

    // Refs for PdfHighlighter utilities
    const highlighterUtilsRef = useRef<PdfHighlighterUtils>();

    // Click listeners for context menu
    useEffect(() => {
        const handleClick = () => {
            if (contextMenu) {
                setContextMenu(null);
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [contextMenu]);

    const handleContextMenu = (
        event: MouseEvent<HTMLDivElement>,
        highlight: ViewportHighlight<CommentedHighlight>,
    ) => {
        event.preventDefault();

        setContextMenu({
            xPos: event.clientX,
            yPos: event.clientY,
            deleteHighlight: () => deleteHighlight(highlight),
            editComment: () => editComment(highlight),
        });
    };

    const addHighlight = (highlight: GhostHighlight, comment: string) => {
        console.log('Saving highlight', highlight);
        setHighlights([
            { ...highlight, comment, id: getNextId() },
            ...(highlights || []),
        ]);
    };

    const deleteHighlight = (highlight: ViewportHighlight | Highlight) => {
        console.log('Deleting highlight', highlight);
        setHighlights(
            highlights ? highlights.filter((h) => h.id != highlight.id) : [],
        );
    };

    const editHighlight = (
        idToUpdate: string,
        edit: Partial<CommentedHighlight>,
    ) => {
        console.log(`Editing highlight ${idToUpdate} with `, edit);
        setHighlights(
            highlights?.map((highlight) =>
                highlight.id === idToUpdate
                    ? { ...highlight, ...edit }
                    : highlight,
            ),
        );
    };

    const resetHighlights = () => {
        setHighlights([]);
    };

    const getHighlightById = (id: string) => {
        return highlights?.find((highlight) => highlight.id === id);
    };

    // Open comment tip and update highlight with new user input
    const editComment = (highlight: ViewportHighlight<CommentedHighlight>) => {
        if (!highlighterUtilsRef.current) return;

        const editCommentTip: Tip = {
            position: highlight.position,
            content: (
                <div className='border rounded bg-white shadow-inner px-2 py-1'>
                    <CommentForm
                        placeHolder={highlight.comment}
                        onSubmit={(input) => {
                            editHighlight(highlight.id, { comment: input });
                            highlighterUtilsRef.current!.setTip(null);
                            highlighterUtilsRef.current!.toggleEditInProgress(
                                false,
                            );
                        }}></CommentForm>
                </div>
            ),
        };

        highlighterUtilsRef.current.setTip(editCommentTip);
        highlighterUtilsRef.current.toggleEditInProgress(true);
    };

    // Scroll to highlight based on hash in the URL
    const scrollToHighlightFromHash = () => {
        const highlight = getHighlightById(parseIdFromHash());

        if (highlight && highlighterUtilsRef.current) {
            highlighterUtilsRef.current.scrollToHighlight(highlight);
        }
    };

    // Hash listeners for autoscrolling to highlights
    useEffect(() => {
        window.addEventListener('hashchange', scrollToHighlightFromHash);

        return () => {
            window.removeEventListener('hashchange', scrollToHighlightFromHash);
        };
    }, [scrollToHighlightFromHash]);

    return (
        <div
            className='flex flex-col xl:flex-row xl:overflow-hidden'
            style={{ height: '99%' }}>
            <Sidebar
                highlights={highlights}
                resetHighlights={resetHighlights}
            />
            <div className='max-xl:min-h-screen xl:overflow-hidden relative flex-grow border'>
                <Toolbar
                    setPdfScaleValue={(value) => setPdfScaleValue(value)}
                    toggleHighlightPen={() => setHighlightPen(!highlightPen)}
                />
                <PdfLoader document={url}>
                    {(pdfDocument: any) => (
                        <PdfHighlighter
                            enableAreaSelection={(event: { altKey: any }) =>
                                event.altKey
                            }
                            pdfDocument={pdfDocument}
                            onScrollAway={resetHash}
                            utilsRef={(_pdfHighlighterUtils: any) => {
                                highlighterUtilsRef.current =
                                    _pdfHighlighterUtils;
                            }}
                            pdfScaleValue={pdfScaleValue}
                            textSelectionColor={
                                highlightPen
                                    ? 'rgba(255, 226, 143, 1)'
                                    : undefined
                            }
                            onSelection={
                                highlightPen
                                    ? (selection: {
                                          makeGhostHighlight: () => any;
                                      }) =>
                                          addHighlight(
                                              selection.makeGhostHighlight(),
                                              '',
                                          )
                                    : undefined
                            }
                            selectionTip={
                                highlightPen ? undefined : (
                                    <ExpandableTip
                                        addHighlight={addHighlight}
                                    />
                                )
                            }
                            highlights={highlights || []}
                            style={{
                                height: 'calc(100% - 41px)',
                                background: '#fff',
                            }}>
                            <HighlightContainer
                                editHighlight={editHighlight}
                                onContextMenu={handleContextMenu}
                            />
                        </PdfHighlighter>
                    )}
                </PdfLoader>
            </div>

            {contextMenu && <ContextMenu {...contextMenu} />}
        </div>
    );
};

export default PDFView;
