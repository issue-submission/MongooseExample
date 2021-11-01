import { connect, connection, Connection, set } from 'mongoose';

set('debug', true);

const DATABASE_CONNECTION_STRING: string = process.env.DB_CONNECTION_STRING;

async function Connect(connection_string?: string): Promise<Connection> {
    if (!connection_string && !DATABASE_CONNECTION_STRING) throw new Error('Database connection configuration is missing');

    connection.on('open', () => console.log('Connection to database established'));
    connection.on('disconnected', () => console.log('Disconnected from database'));
    connection.on('error', () => {
        console.log('Error occurred during connection to database');
    });
    await connect(connection_string ?? DATABASE_CONNECTION_STRING).catch(() => Connect(connection_string));
    return connection;
}

export { DATABASE_CONNECTION_STRING, Connect as ConnectToMongoDB };