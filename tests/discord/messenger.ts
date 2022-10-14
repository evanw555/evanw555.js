import { expect } from 'chai';
import { Messenger } from '../../src/discord/messenger';

describe('Discord Messenger tests', () => {
    it('fails to resolve member with no member resolver', async () => {
        const messenger = new Messenger();
        let error: string = '';
        messenger.setLogger((text) => {
            error = text;
        });
        
        await messenger.dm('123456', 'Hello');

        expect(error).to.equal('Unable to send DM via `Messenger.dm`: `Error: No memberResolver set`');
    });
});
