import { NavMainItem } from '~/types/dashboard/sidebar';
import {
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarMenuSub,
} from './sidebar';
import { DynamicIcon } from '~/hooks/icons';
import Dropzone from '~/components/controls/Dropzone';

const RecursiveMenuItem: React.FC<{ item: NavMainItem; path: string }> = ({
    item,
    path,
}) => {
    const id: string = `${path}/${item.url ?? item.title}`;
    return (
        <>
            <SidebarMenuSubItem key={item.title}>
                <Dropzone id={item.items ? id : path}>
                    <SidebarMenuSubButton asChild>
                        <a id={item.items ? id : path} href={item.url}>
                            <DynamicIcon name={item.icon ?? 'File'} />
                            <span>{item.title}</span>
                        </a>
                    </SidebarMenuSubButton>
                </Dropzone>
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
        </>
    );
};

export { RecursiveMenuItem };
