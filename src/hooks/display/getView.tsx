'use server';

export default async function getView(file: Blob) {
    return <>{file}</>;
}
