'use client';

import * as React from 'react';

import { NavMain } from '~/components/navigation/nav-main';
import { NavUser } from '~/components/navigation/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '~/components/ui/sidebar';
import { NavMainItem, Project, User } from '~/types/dashboard/sidebar';
import { env } from '~/env';
import Dropzone from '../controls/Dropzone';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navMain?: NavMainItem[];
    projects: Project[];
    user: User;
}

export function AppSidebar({
    navMain,
    projects,
    user,
    ...props
}: AppSidebarProps) {
    return (
        <Sidebar collapsible='icon' {...props}>
            <SidebarHeader>
                <p className='font-extrabold text-2xl px-2 pt-2'>
                    {env.NEXT_PUBLIC_PROJECT_NAME}
                </p>
            </SidebarHeader>
            <SidebarContent>
                {navMain ? (
                    <NavMain items={navMain} />
                ) : (
                    'Start by uploading a file or creating a file.'
                )}
                <Dropzone id={''} className='h-full' />
                {/* <NavProjects projects={projects} /> */}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
