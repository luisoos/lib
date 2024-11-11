'use server';

import { AppSidebar } from '~/components/navigation/app-sidebar';
import { Separator } from '~/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '~/components/ui/sidebar';
import { NavMainItem, User } from '~/types/dashboard/sidebar';
import { redirect } from 'next/navigation';
import { getProfile } from '~/server/api/user';
import { files } from '~/server/api/files';
import { getServerSideSession } from '~/server/auth';

export default async function Page() {
    const session = await getServerSideSession();
    console.log(session)
    if (!session) redirect('auth/signin');

    const userQuery = await getProfile();
    if (!userQuery || !userQuery.email || !userQuery.name) return;
    const user: User = {
        name: userQuery.name,
        email: userQuery.email,
        avatar: userQuery.image ?? 'default',
    };

    const fsQuery = await files.getStructure();
    const fs: NavMainItem[] = fsQuery;

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
                    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
                        <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
                            <div className='aspect-video rounded-xl bg-muted/50' />
                            <div className='aspect-video rounded-xl bg-muted/50' />
                            <div className='aspect-video rounded-xl bg-muted/50' />
                        </div>
                        <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
