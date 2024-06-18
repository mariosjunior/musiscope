import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const audioDirectory = path.join(process.cwd(), 'public', 'audio');

    fs.readdir(audioDirectory, (err, files) => {
        if (err) {
            console.error('Failed to read audio directory:', err);
            return res.status(500).json({ error: 'Failed to read audio directory' });
        }

        const audioFiles = files.map((file) => `/audio/${file}`);
        console.log('Audio files:', audioFiles);
        res.status(200).json(audioFiles);
    });
}