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
        <div className='sidebar w-full xl:w-1/6 xl:max-w-[500px]'>
            {/* Description section */}
            <div className='description py-4'>
                <p>
                    <small>
                        To create an area highlight hold ⌥ Option key (Alt),
                        then click and drag.
                    </small>
                </p>
            </div>

            {/* Highlights list */}
            {highlights && (
                <ul className='h-max list-none p-0 cursor-pointer hover:opacity-80'>
                    {highlights.map((highlight, index) => (
                        <li
                            key={index}
                            onClick={() => {
                                updateHash(highlight);
                            }}>
                            <div>
                                {/* Highlight comment and text */}
                                <strong>{highlight.comment}</strong>
                                {highlight.content.text && (
                                    <blockquote
                                        style={{ marginTop: '0.5rem' }}
                                        className='p-0 quotes'>
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
                            </div>

                            {/* Highlight page number */}
                            <div className='text-right text-sm '>
                                Page{' '}
                                {highlight.position.boundingRect.pageNumber}
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
