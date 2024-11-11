import type { NextApiRequest, NextApiResponse } from 'next';
import { getProfile, getUserByEmail } from '~/server/api/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            try {
                const profile = await getProfile();
                res.status(200).json(profile); // Return user profile
            } catch (error) {
                res.status(401).json({ error: "Unauthorized" }); // Handle unauthorized access
            }
            break;

        case 'POST':
            try {
                const parsedInput = req.body.parse({
                    email: req.body.get('email'),
                });
                const user = await getUserByEmail({ email: parsedInput });
                res.status(200).json(user); // Return user by email
            } catch (error) {
                res.status(400).json({ error: "Bad request" }); // Handle validation errors
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
