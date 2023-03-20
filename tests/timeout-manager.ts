import { expect } from 'chai';
import { AsyncStorageInterface } from '../src/file-storage';
import { PastTimeoutStrategy, TimeoutManager } from '../src/timeout-manager';

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
    let recentError: string = '';
    const manager = new TimeoutManager<string>(dummyStorage, {
        'fail': async () => {
            throw new Error('FAILED!');
        }
    }, {
        onError: async (id: string, type: string, err: any) => {
            recentError = `Timeout ${id} with type ${type} failed: ${err}`;
        }
    });

    // Sample dates
    const in10Minutes = new Date();
    in10Minutes.setMinutes(in10Minutes.getMinutes() + 10);
    const oneSecondAgo = new Date();
    oneSecondAgo.setSeconds(oneSecondAgo.getSeconds() - 1);

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


    it('can cancel timeouts by type', async () => {
        expect(manager.hasTimeoutWithType('cancelA')).false;
        expect(manager.hasTimeoutWithType('cancelB')).false;
        expect(manager.hasTimeoutWithType('cancelC')).false;

        const id1 = await manager.registerTimeout('cancelA', in10Minutes);
        const id2 = await manager.registerTimeout('cancelB', in10Minutes);
        const id3 = await manager.registerTimeout('cancelA', in10Minutes);
        const id4 = await manager.registerTimeout('cancelB', in10Minutes);
        const id5 = await manager.registerTimeout('cancelC', in10Minutes);

        expect(manager.hasTimeoutWithType('cancelA')).true;
        expect(manager.hasTimeoutWithType('cancelB')).true;
        expect(manager.hasTimeoutWithType('cancelC')).true;
        expect(manager.hasTimeoutWithId(id1)).true;
        expect(manager.hasTimeoutWithId(id2)).true;
        expect(manager.hasTimeoutWithId(id3)).true;
        expect(manager.hasTimeoutWithId(id4)).true;
        expect(manager.hasTimeoutWithId(id5)).true;

        const canceledIdsB = await manager.cancelTimeoutsWithType('cancelB');
        expect(canceledIdsB.length).equals(2);
        expect(canceledIdsB).includes(id2);
        expect(canceledIdsB).includes(id4);

        expect(manager.hasTimeoutWithType('cancelA')).true;
        expect(manager.hasTimeoutWithType('cancelB')).false;
        expect(manager.hasTimeoutWithType('cancelC')).true;
        expect(manager.hasTimeoutWithId(id1)).true;
        expect(manager.hasTimeoutWithId(id2)).false;
        expect(manager.hasTimeoutWithId(id3)).true;
        expect(manager.hasTimeoutWithId(id4)).false;
        expect(manager.hasTimeoutWithId(id5)).true;

        const canceledIdsC = await manager.cancelTimeoutsWithType('cancelC');
        expect(canceledIdsC.length).equals(1);
        expect(canceledIdsC).includes(id5);

        expect(manager.hasTimeoutWithType('cancelA')).true;
        expect(manager.hasTimeoutWithType('cancelB')).false;
        expect(manager.hasTimeoutWithType('cancelC')).false;
        expect(manager.hasTimeoutWithId(id1)).true;
        expect(manager.hasTimeoutWithId(id2)).false;
        expect(manager.hasTimeoutWithId(id3)).true;
        expect(manager.hasTimeoutWithId(id4)).false;
        expect(manager.hasTimeoutWithId(id5)).false;

        const canceledIdsA = await manager.cancelTimeoutsWithType('cancelA');
        expect(canceledIdsA.length).equals(2);
        expect(canceledIdsA).includes(id1);
        expect(canceledIdsA).includes(id3);

        expect(manager.hasTimeoutWithType('cancelA')).false;
        expect(manager.hasTimeoutWithType('cancelB')).false;
        expect(manager.hasTimeoutWithType('cancelC')).false;
        expect(manager.hasTimeoutWithId(id1)).false;
        expect(manager.hasTimeoutWithId(id2)).false;
        expect(manager.hasTimeoutWithId(id3)).false;
        expect(manager.hasTimeoutWithId(id4)).false;
        expect(manager.hasTimeoutWithId(id5)).false;
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

    it('can handle errors gracefully', async () => {
        expect(manager.hasTimeoutWithType('fail')).false;
        expect(recentError).equals('');

        // The timeout is in the past, so it should be invoked in the same thread
        const id = await manager.registerTimeout('fail', oneSecondAgo, { pastStrategy: PastTimeoutStrategy.Invoke });
        expect(recentError).equals('Timeout 10 with type fail failed: Error: FAILED!');

        // Since it was in the past, it should've been invoked without saving
        expect(manager.hasTimeoutWithId(id)).false;
        expect(manager.hasTimeoutWithType('fail')).false;
    });
});
