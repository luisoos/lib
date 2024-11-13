import '~/styles/globals.css';

import { Separator } from '@radix-ui/react-separator';
import { redirect } from 'next/navigation';
import { AppSidebar } from '~/components/navigation/app-sidebar';
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from '~/components/ui/sidebar';
import { mapToNavItems } from '~/hooks/files/map';
import { files } from '~/server/api/files';
import { getProfile } from '~/server/api/user';
import { getServerSideSession } from '~/server/auth';
import { NavMainItem, User } from '~/types/dashboard/sidebar';

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await getServerSideSession();
    // console.log(session)
    if (!session) redirect('auth/signin');

    const userQuery = await getProfile();
    if (!userQuery || !userQuery.email || !userQuery.name) return;
    const user: User = {
        name: userQuery.name,
        email: userQuery.email,
        avatar: userQuery.image ?? 'default',
    };

    const fsQuery = await files.getStructure();
    const fs: NavMainItem[] | undefined = fsQuery
        ? mapToNavItems(fsQuery)
        : undefined;

    return (
        <>
            <SidebarProvider>
                <AppSidebar
                    user={user}
                    navMain={fs}
                    projects={[
                        {
                            name: 'Design Engineering',
                            url: '#',
                            icon: 'Frame',
                        },
                        {
                            name: 'Sales & Marketing',
                            url: '#',
                            icon: 'PieChart',
                        },
                        {
                            name: 'Travel',
                            url: '#',
                            icon: 'Map',
                        },
                    ]}
                />
                <SidebarInset>
                    <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
                        <div className='flex items-center gap-2 px-4'>
                            <SidebarTrigger className='-ml-1' />
                            <Separator
                                orientation='vertical'
                                className='mr-2 h-4'
                            />
                            <p></p>
                        </div>
                    </header>
                    {children}
                    {/* <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
                        <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
                            <div className='aspect-video rounded-xl bg-muted/50' />
                            <div className='aspect-video rounded-xl bg-muted/50' />
                            <div className='aspect-video rounded-xl bg-muted/50' />
                        </div>
                        <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' />
                    </div> */}
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
