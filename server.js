import ws, {
    WebSocketServer
} from 'ws';
import {
    v4 as uuid
} from 'uuid';
import {
    writeFile,
    readFileSync,
    existsSync
} from 'fs';
const clients = {};
const log = existsSync('log') && readFileSync('log');
const messages = JSON.parse(log) || [];
const wss = new WebSocketServer({
    port: 8000
});

wss.on('connection', (ws) => {
    const id = uuid();
    clients[id] = ws;

    console.log(`New client ${id} connected`);
    ws.send(JSON.stringify(messages))
    ws.on('message', (rawMessage) => {
        const {
            name,
            message
        } = JSON.parse(rawMessage);
        messages.push({
            name,
            message
        })
        for (const keyId of Object.keys(clients)) {
            clients[keyId].send(JSON.stringify([{
                name,
                message
            }]))
        }
        console.log('name: ', name, 'message: ', message);
    })
    ws.on('close', () => {
        delete clients[id];
        console.log(`Client ${id} is closed`)
    })
});

process.on('SIGINT', () => {
    wss.close();
    writeFile('log', JSON.stringify(messages), (err) => {
        if (err) {
            console.log(err);
        }
        process.exit()
    })

})