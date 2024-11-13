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
import { mapToNavItems } from '~/hooks/files/map';

export default async function Page() {
    return <>test</>;
}
