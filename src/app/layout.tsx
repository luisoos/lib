import '~/styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';

import { env } from '~/env';

export const metadata: Metadata = {
    title: env.NEXT_PUBLIC_PROJECT_NAME,
    description: 'Chat with your files & notes',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang='en' className={`${GeistSans.variable}`}>
            <body className='h-screen'>{children}</body>
        </html>
    );
}
