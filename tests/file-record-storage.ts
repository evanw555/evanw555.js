import { assert, expect } from 'chai';
import { FileRecordStorage } from '../src/file-record-storage';
import { fail } from 'assert';

describe('File Record Storage Tests', () => {
    it('can read and write JSON records from a file', async () => {
        const storage = new FileRecordStorage<{ id: number, description: string }>('/tmp/evanw555.js/test1.jsonl');

        await storage.addRecord({ id: 1, description: 'First record' });
        const r1 = await storage.readRecords();
        expect(r1.length).equals(1);
        expect(r1[0].id).equals(1);

        await storage.addRecord({ id: 2, description: 'Second record' });
        const r2 = await storage.readRecords();
        expect(r2.length).equals(2);
        expect(r2[1].id).equals(2);

        await storage.addRecord({ id: 3, description: 'Third record' });
        const r3 = await storage.readRecords();
        expect(r3.length).equals(3);
        expect(r3[2].id).equals(3);
    });

    it('can purge records in an existing file', async () => {
        const storage = new FileRecordStorage<{ id: number, description: string }>('/tmp/evanw555.js/test2.jsonl');

        await storage.addRecord({ id: 11, description: 'A' });
        await storage.addRecord({ id: 12, description: 'B' });
        await storage.addRecord({ id: 13, description: 'C' });
        await storage.addRecord({ id: 14, description: 'D' });
        await storage.addRecord({ id: 15, description: 'E' });
        await storage.addRecord({ id: 16, description: 'F' });
        await storage.addRecord({ id: 17, description: 'G' });

        const r1 = await storage.readRecords();
        expect(r1.length).equals(7);

        const r2 = await storage.purge((r) => r.id % 2 === 1);
        expect(r2.numPurged).equals(3);
        expect(r2.numKept).equals(4);

        const r3 = await storage.readRecords();
        expect(r3.length).equals(4);
        expect(r3[0].description).equals('A');
        expect(r3[1].description).equals('C');
        expect(r3[2].description).equals('E');
        expect(r3[3].description).equals('G');

        const r4 = await storage.purge((r) => r.description === 'C');
        expect(r4.numPurged).equals(3);
        expect(r4.numKept).equals(1);
        await storage.addRecord({ id: 18, description: 'H' });
        await storage.addRecord({ id: 19, description: 'I' });

        const r5 = await storage.readRecords();
        expect(r5.length).equals(3);
        expect(r5[0].description).equals('C');
        expect(r5[1].description).equals('H');
        expect(r5[2].description).equals('I');
    });

    it('can edit records', async () => {
        const storage = new FileRecordStorage<{ id: number, description: string, original: boolean }>('/tmp/evanw555.js/test3.jsonl');

        await storage.addRecord({ id: 11, description: 'A', original: true });
        await storage.addRecord({ id: 12, description: 'B', original: true });
        await storage.addRecord({ id: 13, description: 'C', original: true });

        // First, edit none
        const e1 = await storage.editRecord({
            predicate: r => false,
            transformation: r => r.original = false
        });
        const r1 = await storage.readRecords();
        expect(e1).is.undefined;
        expect(r1.length).equals(3);
        expect(r1.every(r => r.original)).is.true;

        // Now, edit one
        const e2 = await storage.editRecord({
            predicate: r => r.id === 12,
            transformation: r => r.original = false
        });
        const r2 = await storage.readRecords();
        assert(e2 !== undefined, 'returns one edited record');
        expect(e2.id).equals(12);
        expect(e2.original).is.false;
        expect(r2.length).equals(3);
        expect(r2.filter(r => r.original).length).equals(2);

        // Try to edit all, but only edit one
        const e3 = await storage.editRecord({
            predicate: r => true,
            transformation: r => r.original = false
        });
        const r3 = await storage.readRecords();
        assert(e3 !== undefined, 'returns one edited record when matching against all');
        expect(e3.id).equals(11);
        expect(e3.original).is.false;
        expect(r3.length).equals(3);
        expect(r3.filter(r => r.original).length).equals(1);
    });

    it('can handle missing files', async () => {
        const storage = new FileRecordStorage<{ value: string }>('/tmp/evanw555.js/missing.jsonl');
        try {
            await storage.addRecord({ value: 'hello' });
        } catch (err) {
            expect((err as any).code).equals('ENOENT');
        }
    });
});
