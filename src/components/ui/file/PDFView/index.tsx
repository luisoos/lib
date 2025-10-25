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
import { useToast } from '~/hooks/use-toast';
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '../../resizable';

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () => {
    return document.location.hash.slice('#highlight-'.length);
};

const resetHash = () => {
    document.location.hash = '';
};

const PDFView = ({ fileId, pdfUrl }: { fileId: string; pdfUrl: string }) => {
    const [highlights, setHighlights] = useState<Array<CommentedHighlight>>();
    const [highlightsLoading, setHighlightsLoading] = useState<boolean>(true);
    const currentPdfIndexRef = useRef(0);
    const [contextMenu, setContextMenu] = useState<ContextMenuProps | null>(
        null,
    );
    const [pdfScaleValue, setPdfScaleValue] = useState<number | undefined>(
        undefined,
    );
    const [highlightPen, setHighlightPen] = useState<boolean>(false);
    const { toast } = useToast();

    // Refs for PdfHighlighter utilities
    const highlighterUtilsRef = useRef<PdfHighlighterUtils>();

    // Set Highlights on mount
    useEffect(() => {
        // Function to fetch data or perform actions on load
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `/api/routes/highlights?fileId=${fileId}`,
                ); // Replace with your API endpoint
                if (response.ok) {
                    const result = await response.json();
                    console.log(result);
                    setHighlights(result.highlights); // Set the fetched data
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Failed to retrieve highlights.',
                        description:
                            'We had an error getting your highlights for this document. Try again.',
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setHighlightsLoading(false); // Set loading to false after fetching
            }
        };

        fetchData(); // Call the function on component mount
    }, []); // Empty dependency array means this runs once on mount

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

    const addHighlight = async (highlight: GhostHighlight, comment: string) => {
        console.log('Saving highlight', highlight);
        try {
            const response = await fetch(`/api/routes/highlights`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ highlight, fileId, comment }),
            });
            if (response.ok) {
                const data = await response.json();
                setHighlights([
                    { ...highlight, comment, id: data.highlight.id },
                    ...(highlights || []),
                ]);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Failed to save highlight.',
                    description:
                        'We had an error saving your highlight. Try again.',
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const deleteHighlight = async (
        highlight: ViewportHighlight | Highlight,
    ) => {
        try {
            console.log('Deleting highlight', highlight);
            const response = await fetch(
                `/api/routes/highlights?id=${highlight.id}`,
                {
                    method: 'DELETE',
                },
            );
            if (response.ok) {
                setHighlights(
                    highlights
                        ? highlights.filter((h) => h.id != highlight.id)
                        : [],
                );
                toast({
                    description: 'Successfully deleted the highlight.',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Failed to delete highlight.',
                    description:
                        'We had an error deleting your highlight. Try again.',
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const editHighlight = async (
        idToUpdate: string,
        edit: Partial<CommentedHighlight>,
    ) => {
        if (!edit.comment) return;
        try {
            console.log(`Editing highlight ${idToUpdate} with `, edit);
            const response = await fetch(
                `/api/routes/highlights?id=${idToUpdate}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ description: edit.comment }),
                },
            );
            if (response.ok) {
                setHighlights(
                    highlights?.map((highlight) =>
                        highlight.id === idToUpdate
                            ? { ...highlight, ...edit }
                            : highlight,
                    ),
                );
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Failed to edit highlight.',
                    description:
                        'We had an error saving your revised highlight comment. Try again.',
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
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
            className='flex flex-col-reverse xl:flex-row xl:overflow-hidden'
            style={{ height: '99%' }}>
            <ResizablePanelGroup direction='horizontal'>
                <ResizablePanel
                    minSize={10}
                    defaultSize={25}
                    className='sidebar w-full max-xl:mt-2 xl:w-1/6 xl:max-w-[500px]'>
                    {highlightsLoading ? (
                        <p>Loading highlights...</p>
                    ) : (
                        <Sidebar
                            highlights={highlights}
                            resetHighlights={resetHighlights}
                        />
                    )}
                </ResizablePanel>
                <ResizableHandle withHandle className='mx-2' />
                <ResizablePanel
                    defaultSize={75}
                    className='max-xl:min-h-[700px] xl:overflow-hidden relative flex-grow border'>
                    <Toolbar
                        setPdfScaleValue={(value) => setPdfScaleValue(value)}
                        toggleHighlightPen={() =>
                            setHighlightPen(!highlightPen)
                        }
                    />
                    <PdfLoader document={pdfUrl}>
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
                                highlights={
                                    (highlightsLoading ? [] : highlights) || []
                                }
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
                </ResizablePanel>
            </ResizablePanelGroup>

            {contextMenu && <ContextMenu {...contextMenu} />}
        </div>
    );
};

export default PDFView;
