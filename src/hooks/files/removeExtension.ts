const removeFileExtension = (filename: string) =>
    filename.replace(/\.[^/.]+$/, '');

export default removeFileExtension;
