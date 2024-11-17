import { NavMainItem } from '~/types/dashboard/sidebar';
import {
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarMenuSub,
} from './sidebar';
import { DynamicIcon } from '~/hooks/icons';
import Dropzone from '~/components/controls/Dropzone';
import FileTreeContextMenu from '../controls/FileTreeContextMenu';
import removeExtension from '~/hooks/files/removeExtension';
import getFileUrl from '~/hooks/files/getFileUrl';
import { usePathname } from 'next/navigation';

const RecursiveMenuItem: React.FC<{ item: NavMainItem; path: string }> = ({
    item,
    path,
}) => {
    const pathname = usePathname();
    const isDashboard = pathname.startsWith('/dashboard');
    const id: string = `${path}/${item.url ?? item.title}`;
    return (
        <FileTreeContextMenu id={id}>
            <SidebarMenuSubItem key={item.title}>
                <FileTreeContextMenu id={item.items ? id : path}>
                    <SidebarMenuSubButton asChild>
                        <a
                            id={item.items ? id : path}
                            href={getFileUrl(item.url, isDashboard)}>
                            <DynamicIcon name={item.icon ?? 'File'} />
                            <span>{removeExtension(item.title)}</span>
                        </a>
                    </SidebarMenuSubButton>
                </FileTreeContextMenu>
                {item.items && item.items.length > 0 && (
                    <SidebarMenuSub>
                        {item.items.map((subItem) => (
                            <RecursiveMenuItem
                                key={subItem.title}
                                item={subItem}
                                path={id}
                            />
                        ))}
                    </SidebarMenuSub>
                )}
            </SidebarMenuSubItem>
        </FileTreeContextMenu>
    );
};

export { RecursiveMenuItem };
