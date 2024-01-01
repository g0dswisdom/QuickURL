import sqlite3 from 'sqlite3';
import { url } from '../config.json';

function sanitize(input: string): string {
    const sanitizedInput = input.replace(/[\';"]/g, '');
    return sanitizedInput;
  }

export default class Database {
    private static instance: sqlite3.Database | null = null;
    private constructor() {};

    /**
     * Helper function for creating/getting a database for QuickURL
     * 
     * @param dbName -  The database's name
     * @returns A database instance
     */
    static getDatabase(dbName: string): sqlite3.Database {
        if (!Database.instance) {
            Database.instance = new sqlite3.Database(dbName, (e: Error | null) => {
                if (e) {
                    console.error('[QUICKURL]: Encountered an error while trying to connect to the database!' + e.message);
                } else {
                    console.log('[QUICKURL]: Connected to the database!');
                }
                Database.instance?.run(`CREATE TABLE IF NOT EXISTS users (user TEXT, hash TEXT PRIMARY KEY, url TEXT)`, (e: Error | null) => {
                    if (e) {
                        console.error('[QUICKURL]: Could not create table!' + e.message);
                    } else {
                        console.log('[QUICKURL]: Table has been created! (or already exists)');
                    }
                })
            });
        }
        return Database.instance;
    }
    
    /**
     * Check if a hash exists in the database
     * 
     * @param hash - The hash to check
     * @returns Promise<boolean> - True if the hash exists, false otherwise
     */
    static async hashExists(hash: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!Database.instance) {
                console.error('[QUICKURL]: Tried finding hash in database but it is closed!');
                reject(new Error('[QUICKURL]: Database is closed'));
            }

            try {
                hash = sanitize(hash);
                Database.instance?.get('SELECT hash FROM users WHERE hash = ?', [hash], (e: Error | null, row: any) => {
                    resolve(!!row);
                })
            } catch (e: any) {
                reject(e);
            }
        });
    }

    /**
     * Adds data into the database
     * 
     * @param user - The Discord ID of the user who created the URL
     * @param hash - The hash
     * @param url - The URL
     */
    static async addUrl(user: string, hash: string, url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!Database.instance) {
                console.error('[QUICKURL]: Tried adding data to the database but it is closed!');
                reject(new Error('[QUICKURL]: Database is closed'));
            }
            
            try {
                user = sanitize(user);
                hash = sanitize(hash);
                url = sanitize(url);
                Database.instance?.run('INSERT INTO users (user, hash, url) VALUES (?, ?, ?)', [user, hash, url], (e: Error | null) => {
                    resolve();
                });
            } catch(e: any) {
                reject(e);
            }
        });
    }

    /**
     * Helper function for getting an URL from the database using its hash
     * 
     * @param hash - The hash
     * @returns The URL
     */
    static async getUrl(hash: string): Promise<string | null> {
        return new Promise((resolve, reject) => {
            if (!Database.instance) {
                console.error('[QUICKURL]: Tried retrieving data from the database but it is closed!');
                reject(new Error('[QUICKURL]: Database is closed'));
            }

            try {
                hash = sanitize(hash);
                Database.instance?.get('SELECT url FROM users WHERE hash = ?', [hash], (e: Error | null, row: any) => {
                    if (row) {
                        resolve(row.url);
                    } else {
                        resolve(null);
                    }
                })
            } catch (e: any) {
                reject(e);
            }
        });
    }

    /**
     * Helper function to get the total count of URLs
     * 
     * @returns The total count of URLs
     */
    static async getTotalCount(): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!Database.instance) {
                console.error('[QUICKURL]: Tried counting data from the database but it is closed!');
                reject(new Error('[QUICKURL]: Database is closed'));
            }

            try {
                Database.instance?.get('SELECT COUNT(*) AS count FROM users', (e: Error | null, row: { count: number }) => {
                    resolve(row.count);
                });
            } catch (e: any) {
                reject(e);
            }
        });
    }
    
    /**
     * Helper function to get URLs from user
     * 
     * @param user The user
     * @returns Array of URLs
     */
    static async getUrlsForUser(user: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            if (!Database.instance) {
                console.error('[QUICKURL]: Tried getting data from the database but it is closed!');
                reject(new Error('[QUICKURL]: Database is closed'));
            }
            
            try {
                user = sanitize(user);
                Database.instance?.all('SELECT url, hash FROM users WHERE user = ?', [user], (e: Error | null, rows: any[]) => {
                    if (rows && rows.length > 0) {
                        const urls = rows.map((row, index) => ({
                            id: index + 1,
                            original_url: row.url,
                            shortened_url: `${url}/url?link=${row.hash}`
                        }));
                        resolve(urls);
                    } else {
                        resolve([]);
                    }
                });
            } catch (e: any) {
                reject(e);
            }
        });
    }

    /**
     * Helper function used to get a link's owner
     * 
     * @param hash The link's hash
     * @returns The link's owner
     */
    static async getOwner(hash: string): Promise<string | null> {
        return new Promise((resolve, reject) => {
            if (!Database.instance) {
                console.error('[QUICKURL]: Tried getting data from the database but it is closed!');
                reject(new Error('[QUICKURL]: Database is closed'));
            }

            try {
                hash = sanitize(hash);
                Database.instance?.get('SELECT user FROM users WHERE hash = ?', [hash], (e: Error | null, row: { user: string } | undefined) => {
                    if (e) {
                        console.error(e);
                        reject(e);
                    } else {
                        if (row) {
                            resolve(row.user);
                        } else {
                            resolve(null);
                        }
                    }
                });
            } catch (e: any) {
                console.error(e);
                reject(e);
            }
        });
    }

    /**
     * Helper function to delete an URL from the database
     * 
     * @param user The user
     * @param hash The link's hash
     * @returns 
     */
    static async deleteUrl(user: string, hash: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!Database.instance) {
                console.error('[QUICKURL]: Tried deleting data from the database but it is closed!');
                reject(new Error('[QUICKURL]: Database is closed'));
            }

            try {
                user = sanitize(user);
                hash = sanitize(hash);
                Database.instance?.run('DELETE FROM users WHERE user = ? AND hash = ?', [user, hash], (e: Error | null) => {
                    if (e) {
                        console.error(e);
                        reject(e);
                    } else {
                        resolve();
                    }
                })
            } catch (e: any) {
                console.error(e);
                reject(e);
            }
        });
    }

    /**
     * Helper function for closing a database.
     */
    static closeDatabase(): void {
        if (Database.instance) {
            Database.instance.close((e: Error | null) => {
                if (e) {
                    console.log('[QUICKURL]: Encountered an error while trying to close the database!' + e);
                } else {
                    console.log('[QUICKURL]: Closed database!');
                }
            });
        }
    }
}