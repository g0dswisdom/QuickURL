import Server from './libs/server'

const server: Server = new Server({
    port: 3000,
    db: 'quickurl.db'
});

server.startBot();
server.startServer();