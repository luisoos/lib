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
    SidebarMenuItem,
    SidebarMenuSub,
} from '~/components/ui/sidebar';
import { NavMainItem } from '~/types/dashboard/sidebar';
import { RecursiveMenuItem } from '~/components/ui/recursiveMenuItem';
import FileUpload from '~/components/controls/FileUpload';
import Dropzone from '~/components/controls/Dropzone';
import getFileUrl from '~/hooks/files/getFileUrl';
import { usePathname } from 'next/navigation';
import { DynamicIcon, LucideIconName } from '~/hooks/icons';
import { ChevronRight } from 'lucide-react';

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
                    // item.isActive = pathname === getFileUrl(item.url);
                    return !item.url ? (
                        <Collapsible
                            key={item.title + item.items?.length}
                            asChild
                            defaultOpen={item.isActive}
                            className='group/collapsible'>
                            <SidebarMenuItem>
                                {/* <Dropzone id={!item.url ? item.title : ''}> */}
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={item.title}>
                                            {item.icon && (
                                                <DynamicIcon
                                                    name={
                                                        item.icon as LucideIconName
                                                    }
                                                />
                                            )}
                                            <span className='truncate'>
                                                {item.title}
                                            </span>
                                            {item.items && (
                                                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                                            )}
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                {/* </Dropzone> */}
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
                            <Dropzone id={!item.url ? item.title : ''}>
                                <SidebarMenuButton tooltip={item.title}>
                                    {item.icon && (
                                        <DynamicIcon
                                            name={
                                                item.icon as LucideIconName
                                            }
                                        />
                                    )}
                                    <span className='truncate'>
                                        {item.title}
                                    </span>
                                    {item.items && (
                                        <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                                    )}
                                </SidebarMenuButton>
                            </Dropzone>
                        </a>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
