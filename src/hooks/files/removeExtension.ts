import { NavMainItem } from '~/types/dashboard/sidebar';

const removeFileExtension = (filename: string) =>
    filename.replace(/\.[^/.]+$/, '');

export const addFileExtension = (item: NavMainItem, filename: string) => {
    const lastDotIndex = item.title.lastIndexOf('.');
    return (
        filename + (lastDotIndex !== -1 ? item.title.slice(lastDotIndex) : '')
    ); // Returns '' if no dot is found
};

export default removeFileExtension;
