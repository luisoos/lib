import { NavMainItem } from '~/types/dashboard/sidebar';
import { ExtendedFileObject } from '~/types/files/structure';

export function mapToNavItems(fsQuery: ExtendedFileObject[]): NavMainItem[] {
    return fsQuery.map((item) => ({
        title: item.name,
        url: item.id,
        icon:
            item.sub && item.sub.length > 0
                ? 'FolderClosed'
                : item.id
                  ? getIconByType(item.name)
                  : 'Folder',
        isActive: false,
        items: item.sub ? mapToNavItems(item.sub) : undefined,
    }));
}

function getIconByType(fileName: string): string {
    // Extract the file extension from the filename
    const extension = fileName.split('.').pop()?.toLowerCase(); // Get the last part after the dot

    switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'tiff':
            return 'Image'; // Return the icon for image files

        case 'pdf':
            return 'BookMarked'; // Return the icon for PDF files

        case 'doc':
        case 'docx':
        case 'txt':
            return 'FileText'; // Return the icon for text files

        default:
            return 'File'; // Default icon for unknown file types
    }
}
