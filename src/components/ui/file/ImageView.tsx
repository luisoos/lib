import React from 'react';
import { Image, Calendar, Dot } from 'lucide-react';
import { Heading } from '~/components/dashboard/heading';

const ImageView: React.FC<{
    content: string;
    fileType: string;
    fileName: string;
    lastModified: Date;
}> = ({ content, fileType, fileName, lastModified }) => {
    return (
        <figure className='max-h-[90vh] max-w-[90vw]'>
            <Heading>{fileName}</Heading>
            <img src={content} className='mt-2 rounded border shadow' />
            <figcaption className='cursor-default flex font-mono text-zinc-700'>
                <Image size={16} className='my-auto mr-1' />{' '}
                {fileType.replace('image/', '').toUpperCase()}
                <Dot size={20} className='my-auto mx-1' />
                <Calendar size={16} className='my-auto mr-1' />{' '}
                {lastModified.toLocaleDateString()}
            </figcaption>
        </figure>
    );
};

export default ImageView;
