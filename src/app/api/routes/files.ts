import type { NextApiRequest, NextApiResponse } from 'next';
import { getStructure, uploadFile } from '~/server/api/files';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            const structure = await getStructure();
            return res.status(200).json(structure);

        case 'POST':
            try {
                const body = req.body;
                const data = await uploadFile(body);

                return res.status(200).json({ success: true, data });
            } catch (error) {
                console.error('Error uploading file:', error);
                return res.status(500).json({ success: false, error: 'Failed to upload file' });
            }

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}