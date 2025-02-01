import { list, pair} from "../lib/list";
import { People, Person, PersonTable, Relations, toHashtable, descendants} from "./person_table";
import { ph_lookup, hash_id } from "../lib/hashtables";


// TASK 1 TESTS

describe(toHashtable, (): void => {
    test('No people and no relations', (): void => {
        const people: People = null;
        const relations: Relations = null;
        const ht: PersonTable = toHashtable(people, relations);
        expect(ht).toStrictEqual({
            keys: [],
            values: [],
            hash: hash_id,
            entries: 0,
        });
    });

    test('People with no relations', (): void => {
        const people: People = list(pair(19550224, 'Steve Jobsworth'), pair(19631218, 'Brad Pitfall'));
        const relations: Relations = null;
        const ht: PersonTable = toHashtable(people, relations);
        const steve: Person | undefined = ph_lookup(ht, 19550224);
        const brad: Person | undefined = ph_lookup(ht, 19631218);
        expect(steve).toStrictEqual({
            id: 19550224,
            name: 'Steve Jobsworth',
            parents: [],
            children: []
        });
        expect(brad).toStrictEqual({
            id: 19631218,
            name: 'Brad Pitfall',
            parents: [],
            children: []
        });
    });

    test('Multiple parent child relations', (): void => {
        const people: People = list(
            pair(18540106, 'Sherlock Homeless'),
            pair(19790706, 'Kevin Hart'),
            pair(19550722, 'Willem Dafriend'),
            pair(19640902, 'Keanu Arrives'),
            pair(19850110, 'Alice Wonderland')
        );
        const relations: Relations = list(
            pair(18540106, 19790706),
            pair(19550722, 19640902),
            pair(19790706, 19850110),
            pair(19640902, 19850110)
        );
        const ht: PersonTable = toHashtable(people, relations);

        const sherlock: Person | undefined = ph_lookup(ht, 18540106);
        const kevin: Person | undefined = ph_lookup(ht, 19790706);
        const willem: Person | undefined = ph_lookup(ht, 19550722);
        const keanu: Person | undefined = ph_lookup(ht, 19640902);
        const alice: Person | undefined = ph_lookup(ht, 19850110);

        expect(sherlock).toStrictEqual({
            id: 18540106,
            name: 'Sherlock Homeless',
            parents: [],
            children: [19790706]
        });
        expect(kevin).toStrictEqual({
            id: 19790706,
            name: 'Kevin Hart',
            parents: [18540106],
            children: [19850110]
        });
        expect(willem).toStrictEqual({
            id: 19550722,
            name: 'Willem Dafriend',
            parents: [],
            children: [19640902]
        });
        expect(keanu).toStrictEqual({
            id: 19640902,
            name: 'Keanu Arrives',
            parents: [19550722],
            children: [19850110]
        });
        expect(alice).toStrictEqual({
            id: 19850110,
            name: 'Alice Wonderland',
            parents: [19790706, 19640902],
            children: []
        });
    });

    test('Handle duplicate people and relations', (): void => {
        const people: People = list(
            pair(19800731, 'Harry Potter'),
            pair(19800731, 'Harry Potter'), // Duplicate
            pair(19850110, 'Alice Wonderland'),
            pair(19850110, 'Alice Wonderland') // Duplicate
        );
        const relations: Relations = list(
            pair(19800731, 19850110),
            pair(19800731, 19850110) // Duplicate
        );

        const ht: PersonTable = toHashtable(people, relations);

        const harry: Person | undefined = ph_lookup(ht, 19800731);
        const alice: Person | undefined = ph_lookup(ht, 19850110);

        expect(harry).toStrictEqual({
            id: 19800731,
            name: 'Harry Potter',
            parents: [],
            children: [19850110] // Alice appears only once
        });

        expect(alice).toStrictEqual({
            id: 19850110,
            name: 'Alice Wonderland',
            parents: [19800731], // Keanu appears only once
            children: []
        });
    });

    test('Same name different IDs', (): void => {
        const people: People = list(pair(19830820, 'Andrew Garfield'), pair(20030228, 'Andrew Garfield'));
        const relations: Relations = list(pair(19830820, 20030228));

        const ht: PersonTable = toHashtable(people, relations);

        const andrew1: Person | undefined = ph_lookup(ht, 19830820);
        const andrew2: Person | undefined = ph_lookup(ht, 20030228);

        expect(andrew1?.id).not.toStrictEqual(andrew2?.id);
        expect(andrew1?.children).toContain(20030228);
        expect(andrew2?.parents).toContain(19830820);
    });
});


// TASK 2 TESTS

describe(descendants, (): void => {
    test('Person not in hashtable', (): void => {
        const people: People = list(pair(19550224, 'Steve Jobsworth'));
        const relations: Relations = null;
        const ht: PersonTable = toHashtable(people, relations);
        expect(descendants(ht, 18540106)).toBeUndefined();
    });

    test('No descendants', (): void => {
        const people: People = list(pair(18540106, 'Sherlock Homeless'));
        const relations: Relations = null;
        const ht: PersonTable = toHashtable(people, relations);
        expect(descendants(ht, 18540106)).toStrictEqual([]);
    });

    test('Find descendants', (): void => {
        const people: People = list(
            pair(18540106, 'Sherlock Homeless'),
            pair(19790706, 'Kevin Hart'),
            pair(19550722, 'Willem Dafriend'),
            pair(19640902, 'Keanu Arrives')
        );
        const relations: Relations = list(
            pair(18540106, 19790706),  // Sherlock Homeless – Kevin Hart
            pair(18540106, 19550722),  // Sherlock Homeless – Willem Dafriend
            pair(19790706, 19640902)   // Kevin Hart – Keanu Arrives
        );
        const ht: PersonTable = toHashtable(people, relations);

        expect(descendants(ht, 18540106)).toStrictEqual([19550722, 19790706, 19640902]);
    });

    test('Deep nested descendants', (): void => {
        const people: People = list(
            pair(18540106, 'Sherlock Homeless'),
            pair(19790706, 'Kevin Hart'),
            pair(19550722, 'Willem Dafriend'),
            pair(19640902, 'Keanu Arrives'),
            pair(19850110, 'Alice Wonderland')
        );
        let relations: Relations = list(
            pair(18540106, 19790706),  // Sherlock Homeless – Kevin Hart
            pair(19790706, 19550722),  // Kevin Hart – Willem Dafriend
            pair(19550722, 19640902),  // Willem Dafriend – Keanu Arrives
            pair(19640902, 19850110)   // Keanu Arrives – Alice Wonderland
        );
        const ht: PersonTable = toHashtable(people, relations);

        expect(descendants(ht, 18540106)).toStrictEqual([19790706, 19550722, 19640902, 19850110]);
    });

    test('Duplicate descendants', (): void => {
        const people: People = list(
            pair(18540106, 'Sherlock Homeless'),
            pair(19790706, 'Kevin Hart'),
            pair(19550722, 'Willem Dafriend')
        );
        const relations: Relations = list(
            pair(18540106, 19790706),  // Sherlock Homeless – Kevin Hart
            pair(18540106, 19790706),  // Sherlock Homeless – Kevin Hart (Duplicate entry for Kevin Hart)
            pair(18540106, 19550722)   // Sherlock Homeless – Willem Dafriend
        );
        const ht: PersonTable = toHashtable(people, relations);
        expect(descendants(ht, 18540106)).toStrictEqual([19550722, 19790706]);
    });
});
