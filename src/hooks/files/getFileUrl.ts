const FILE_PREFIX: string = 'dashboard';

const getFileUrl = (filename: string) =>
    `${FILE_PREFIX.trim() !== '' ? FILE_PREFIX + '/' : ''}${filename}`;

export default getFileUrl;
