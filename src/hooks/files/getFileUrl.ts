const FILE_PREFIX: string = 'dashboard';

const getFileUrl = (filename: string, withPrefix = false) =>
    withPrefix
        ? `${FILE_PREFIX.trim() !== '' ? FILE_PREFIX + '/' : ''}${filename}`
        : filename;

export default getFileUrl;
