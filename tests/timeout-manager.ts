import { expect } from 'chai';
import { AsyncStorageInterface } from '../src/file-storage';
import { TimeoutManager } from '../src/timeout-manager';

// TODO: Needs to actually test that the timeout will be invoked!

describe('TimeoutManager Tests', () => {
    const dummyStorage: AsyncStorageInterface = {
        read: async (id: string): Promise<string> => {
            return '';
        },
        readJson: async (id: string): Promise<any> => {
            return '';
        },
        write: async (id: string, value: any): Promise<void> => {}
    };
    const manager: TimeoutManager<string> = new TimeoutManager(dummyStorage, {});

    // Sample date
    const in10Minutes = new Date();
    in10Minutes.setMinutes(in10Minutes.getMinutes() + 10);

    it('can schedule a timeout', async () => {
        expect(manager.hasTimeoutWithType('foo')).false;

        const id = await manager.registerTimeout('foo', in10Minutes);

        expect(manager.hasTimeoutWithType('foo')).true;
        expect(manager.hasTimeoutWithId(id)).true;
        expect(manager.getDateForTimeoutWithId(id)?.toJSON()).to.equal(in10Minutes.toJSON());
    });

    it('can cancel a timeout', async () => {
        expect(manager.hasTimeoutWithType('bar')).false;

        const id = await manager.registerTimeout('bar', in10Minutes);

        expect(manager.hasTimeoutWithType('bar')).true;
        expect(manager.hasTimeoutWithId(id)).true;
        expect(manager.getDateForTimeoutWithId(id)?.toJSON()).to.equal(in10Minutes.toJSON());

        await manager.cancelTimeout(id);

        expect(manager.hasTimeoutWithType('bar')).false;
        expect(manager.hasTimeoutWithId(id)).false;
    });

    it('can postpone a timeout by date', async () => {
        const id = await manager.registerTimeout('bar', in10Minutes);

        expect(manager.hasTimeoutWithId(id)).true;
        expect(manager.getDateForTimeoutWithId(id)?.toJSON()).to.equal(in10Minutes.toJSON());

        const newDate = new Date();
        newDate.setHours(newDate.getHours() + 3);

        await manager.postponeTimeout(id, newDate);

        expect(manager.hasTimeoutWithId(id)).true;
        expect(manager.getDateForTimeoutWithId(id)?.toJSON()).to.not.equal(in10Minutes.toJSON());
        expect(manager.getDateForTimeoutWithId(id)?.toJSON()).to.equal(newDate.toJSON());
    });

    it('can postpone a timeout by delta', async () => {
        const id = await manager.registerTimeout('bar', in10Minutes);

        expect(manager.hasTimeoutWithId(id)).true;
        expect(manager.getDateForTimeoutWithId(id)?.toJSON()).to.equal(in10Minutes.toJSON());

        const milliDelta = 123456;
        await manager.postponeTimeout(id, milliDelta);

        expect(manager.hasTimeoutWithId(id)).true;
        expect(manager.getDateForTimeoutWithId(id)?.toJSON()).to.not.equal(in10Minutes.toJSON());

        const expectedDate = new Date(in10Minutes.getTime() + milliDelta)
        expect(manager.getDateForTimeoutWithId(id)?.toJSON()).to.equal(expectedDate.toJSON());
    });
});
