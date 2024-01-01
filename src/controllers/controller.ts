import asyncHandler from 'express-async-handler'
import { NextFunction, Request, Response } from 'express';
import Database from '../libs/database';
import crypto from 'crypto';
import axios from 'axios';

function randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charsLength = chars.length;

    let result = '';
    const bytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
        const index = bytes[i] % charsLength;
        result += chars.charAt(index);
    }

    return result;
}

/**
 * Checks if the URL is valid
 * 
 * @param url The URL
 * @returns A boolean
 */
async function validate(url: string): Promise<boolean> {
    try {
        const response = await axios.get(url);
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

// -- Controllers -- \\

class mainController {
    static createController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        let url = req.body.url as string;
        let owner = req.body.owner as string;
        let hash: string
        let length = 4;
        
        if (!owner) {
            res.status(400).send('??');
            return;
        }

        if (!(await validate(url))) {
            res.status(404).send('Invalid URL');
            return;
        }

        do {
            hash = randomString(length);
            if (await Database.hashExists(hash)) {
                length++;
            }

            if (length > 10) {
                throw new Error('Hash too long');
            }
        } while (await Database.hashExists(hash));

        await Database.addUrl(owner, hash, url);
        return res.status(200).json({ hash });
    });

    static getController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        let hash = req.query.link as string;

        if (!hash) {
            res.status(404).send('??');
            return;
        }

        const url = await Database.getUrl(hash);

        if (url) {
            res.redirect(url);
        } else {
            res.status(404).send('Could not find URL!');
        }
    });

    static countController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        let count = await Database.getTotalCount();

        res.status(200).json({ count });
    });

    static userUrlController = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        let user = req.body.user;
        
        if (!user) {
            res.status(400).send('??');
            return;
        }

        let urls = await Database.getUrlsForUser(user);
        
        res.status(200).json(urls);
    });
}

export default mainController;