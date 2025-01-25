import React from 'react';
import type { Highlight } from 'react-pdf-highlighter-extended';
import { CommentedHighlight } from '~/types/files/pdf';
import { Button } from '../../button';

interface SidebarProps {
    highlights: Array<CommentedHighlight> | undefined;
    resetHighlights: () => void;
}

const updateHash = (highlight: Highlight) => {
    document.location.hash = `highlight-${highlight.id}`;
};

const Sidebar = ({ highlights, resetHighlights }: SidebarProps) => {
    return (
        <div>
            {/* Description section */}
            <h2 className='text-xl font-medium'>Highlights</h2>
            <div className='description mb-2'>
                <p>
                    <small>
                        To create an area highlight hold ⌥ Option key (Alt),
                        then click and drag.
                    </small>
                </p>
            </div>

            {/* Highlights list */}
            {highlights && highlights.length > 0 && (
                <ul className='h-max list-none p-0 cursor-pointer hover:opacity-80'>
                    {highlights.map((highlight, index) => (
                        <li
                            key={index}
                            onClick={() => {
                                updateHash(highlight);
                            }}>
                            <div className='my-2 border rounded px-2 py-1 mr-1'>
                                {/* Highlight comment and text */}
                                <p className='font-medium'>
                                    {highlight.comment}
                                </p>
                                {highlight.content.text && (
                                    <blockquote className='my-1 p-0.5 border-l border-zinc-400 pl-1.5 quotes break-words'>
                                        {`${highlight.content.text.slice(0, 90).trim()}…`}
                                    </blockquote>
                                )}

                                {/* Highlight image */}
                                {highlight.content.image && (
                                    <div
                                        className='overflow-auto max-w-full'
                                        style={{ marginTop: '0.5rem' }}>
                                        <img
                                            src={highlight.content.image}
                                            alt={'Screenshot'}
                                            className='border rounded'
                                        />
                                    </div>
                                )}

                                {/* Highlight page number */}
                                <div className='text-right opacity-80 text-sm'>
                                    Page{' '}
                                    {highlight.position.boundingRect.pageNumber}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* {highlights && highlights.length > 0 && (
        <div>
          <Button onClick={resetHighlights}>Reset highlights</Button>
        </div>
      )} */}
        </div>
    );
};

export default Sidebar;
