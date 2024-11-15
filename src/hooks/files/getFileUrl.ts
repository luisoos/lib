const FILE_PREFIX: string = '';

const getFileUrl = (filename: string) =>
    `${FILE_PREFIX.trim() !== '' ? FILE_PREFIX + '/' : ''}${filename}`;

export default getFileUrl;
