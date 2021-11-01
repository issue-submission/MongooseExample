require('dotenv-expand')(require('dotenv').config());
import { ClientSession, connect, connection, Connection, Document, Model, Schema, set } from 'mongoose';

import { DATABASE_CONNECTION_STRING, ConnectToMongoDB } from 'mongoose-project-shared-library';

export interface IEntrySchema {
    'identifier': string,
    'name': string
}

const EntrySchema: Schema = new Schema({
    'identifier': {
        type: String,
        required: true,
        unique: true
    },
    'name': {
        type: String,
        required: true
    }
}, { collection: 'entries', minimize: false });
export interface IEntryModel extends Document, IEntrySchema { };
export let Entry: Model<IEntryModel>;

export async function AddEntry(connection: Connection, entry: IEntrySchema): Promise<void> {
    await connection.transaction(async (session: ClientSession) => {
        console.log(`Adding entry: ${entry.identifier}`);
        const entry_document: IEntryModel = await new Entry(entry).save({ session });
        console.log('Entry created');
        console.log(JSON.stringify(entry_document.toJSON()));
        entry_document.set('name', 'New entry name');
        await entry_document.save({ session });
        console.log('Entry modified');
        console.log(JSON.stringify(entry_document.toJSON()));
    });
}

// CONNECTION WITHOUT USING SHARED LIBRARY
async function Connect(): Promise<void> {
    connection.on('open', () => console.log('Connection to database established'));
    connection.on('disconnected', () => console.log('Connection to database ended'));
    connection.on('error', () => {
        console.log('Error during connection');
    });
    await connect('mongodb://user:password@localhost:27017/framework?replicaSet=rs').catch(() => Connect());
}

async function Start(): Promise<void> {
    set('debug', true);
    // CONNECTION WITHOUT USING SHARED LIBRARY
    // await Connect();
    const DATABASE_CONNECTION: Connection = await ConnectToMongoDB(DATABASE_CONNECTION_STRING);
    Entry = DATABASE_CONNECTION.model<IEntryModel>('Entry', EntrySchema);
    await AddEntry(DATABASE_CONNECTION, { identifier: 'entry', name: 'Entry name' });
}

Start();