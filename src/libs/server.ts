import express, {Express} from 'express';
import routes from '../routes/routes';
import { serverOptions } from '../types/serverOptions';
import sqlite3 from 'sqlite3';
import Database from './database'
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { deployCommands } from '../libs/deploy';
import { commands } from '../commands';
import { token, guildId } from '../config.json';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
    ]
});

client.once(Events.ClientReady, async (c) => {
	console.log('[QUICKURL]: Discord bot is ready!');
    await deployCommands({
        guildId: guildId
    })
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;
    if (commands[interaction.commandName as keyof typeof commands]) {
        commands[interaction.commandName as keyof typeof commands].execute(interaction);
    }
})


export default class Server {
    private readonly port: number;
    private readonly app: Express;
    private readonly db: sqlite3.Database;
    
    /**
     * Constructor function for server
     * 
     * @param options - The server options
     */
    public constructor(options: serverOptions) {
        this.app = express();
        this.app.use(express.json());
        this.port = options.port;
        this.db = Database.getDatabase(options.db);
        this.configureRoutes();
    }

    /**
     * Function that enables routes
     */
    private configureRoutes(): void {
        this.app.use('/', routes)
    }

    /**
     * Starts the server and listens on the specified port.
     *
     * @return {boolean|string} Returns true if the server started successfully,
     * or an error message if there was an exception.
     */
    public startServer(): boolean | string {
        try {
            this.app.listen(this.port)
            return true
        } catch (e: any) {
            return e
        }
    }

    public startBot(): void {
        client.login(token);
    }
}