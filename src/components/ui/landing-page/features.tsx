import React from 'react';
import { BentoGrid, BentoGridItem } from './bento-grid';
import { Brain, Feather, HeartHandshake, LockKeyhole } from 'lucide-react';
import { env } from '~/env';

export function Features() {
    return (
        <>
            <h2 className='text-center text-2xl font-semibold mb-2'>
                Why people ❤ {env.NEXT_PUBLIC_PROJECT_NAME} ...
            </h2>
            <BentoGrid className='max-w-4xl mx-auto md:auto-rows-[20rem] cursor-crosshair'>
                {items.map((item, i) => (
                    <BentoGridItem
                        key={i}
                        title={item.title}
                        description={item.description}
                        header={item.header}
                        className={item.className}
                        icon={item.icon}
                    />
                ))}
            </BentoGrid>
        </>
    );
}

const Skeleton = () => (
    <div className='flex flex-1 w-full h-full min-h-[6rem] rounded-xl dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]  border border-transparent dark:border-white/[0.2] bg-neutral-100 dark:bg-black'></div>
);

const items = [
    {
        title: 'Your notes with AI',
        description:
            'Chat with ChatGPT and other LLMs that have access to all of your notes from school, university etc. at a fingertip.',
        header: <Skeleton />,
        className: 'md:col-span-2',
        icon: (
            <Brain className='h-4 w-4 text-neutral-500 hover:text-orange-300 transition-all' />
        ),
    },
    {
        title: 'Fair',
        description:
            'Your documents should be yours. Thats why you can export all of your documents at any time, if you want to use something else.',
        header: <Skeleton />,
        className: 'md:col-span-1',
        icon: (
            <HeartHandshake className='h-4 w-4 text-neutral-500 hover:text-red-600 transition-all' />
        ),
    },
    {
        title: 'Privacy-centered',
        description:
            'All of your data is encrypted and only decrypted on your machine.', // (WIP)
        header: <Skeleton />,
        className: 'md:col-span-1',
        icon: (
            <LockKeyhole className='h-4 w-4 text-neutral-500 hover:text-zinc-900 transition-all' />
        ),
    },
    {
        title: 'Tools that make school & university easier',
        description:
            'Designed for maximum productivity and with unique tools: highlight in PDFs, shortcuts and more.',
        header: <Skeleton />,
        className: 'md:col-span-2',
        icon: (
            <Feather className='h-4 w-4 text-neutral-500 hover:text-blue-500 transition-all' />
        ),
    },
];
