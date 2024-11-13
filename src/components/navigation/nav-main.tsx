'use client';

import React from 'react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '~/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuDisplay,
    SidebarMenuItem,
    SidebarMenuSub,
} from '~/components/ui/sidebar';
import { NavMainItem } from '~/types/dashboard/sidebar';
import { RecursiveMenuItem } from '~/components/ui/recursiveMenuItem';
import FileUpload from '~/components/controls/FileUpload';
import Dropzone from '~/components/controls/Dropzone';
import getFileUrl from '~/hooks/files/getFileUrl';
import { usePathname } from 'next/navigation';

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: string;
        isActive?: boolean;
        items?: NavMainItem[];
    }[];
}) {
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <div className='flex'>
                <SidebarGroupLabel>Notebooks</SidebarGroupLabel>
                <FileUpload />
            </div>
            <SidebarMenu>
                {items.map((item) => {
                    item.isActive = pathname === getFileUrl(item.url);
                    return !item.url ? (
                        <Collapsible
                            key={item.url}
                            asChild
                            defaultOpen={item.isActive}
                            className='group/collapsible'>
                            <SidebarMenuItem>
                                <Dropzone id={!item.url ? item.title : ''}>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuDisplay item={item} />
                                    </CollapsibleTrigger>
                                </Dropzone>
                                {item.items && (
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items.map((subItem) => (
                                                <RecursiveMenuItem
                                                    key={
                                                        subItem.url ??
                                                        subItem.title
                                                    }
                                                    item={subItem}
                                                    path={
                                                        item.url ?? item.title
                                                    }
                                                />
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                )}
                            </SidebarMenuItem>
                        </Collapsible>
                    ) : (
                        <a href={getFileUrl(item.url)} key={item.url}>
                            <SidebarMenuDisplay item={item} />
                        </a>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
