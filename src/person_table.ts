// extend imports as needed
import { Pair, List, head, tail, is_null, length } from '../lib/list';
import { ProbingHashtable, ph_empty, ph_lookup, ph_insert, hash_id } from '../lib/hashtables';

/* DO NOT MODIFY these type declarations */
export type People = List<Pair<number,string>>;
export type Relations = List<Pair<number,number>>;
export type Person = {
    id: number, // the identifier as described above
    name: string,
    parents: Array<number>,
    children: Array<number>
};
export type PersonTable = ProbingHashtable<number,Person>;
/* End of type declarations */


/**
 * Create a hash table of Person records based on given relations.
 * @precondition All ids appearing in relations are in the people list.
 * @param people peoples ids and names
 * @param relations parent-child relations
 * @return Returns a hash table with a Person record for each person from people
 *     that includes all relationships according relations.
 */
export function toHashtable(people: People, relations: Relations): PersonTable {
    const ht: PersonTable = ph_empty(length(people), hash_id);

    while (!is_null(people)) {
        const id: number = head(head(people));
        const name: string = tail(head(people));
        if (!ph_lookup(ht, id)) {
            const person: Person = {
                id: id,
                name: name,
                parents: [],
                children: []
            }
            ph_insert(ht, id, person);
        }
        people = tail(people);
    }

    while (!is_null(relations)) {
        const parentId: number = head(head(relations));
        const childId: number = tail(head(relations));

        const parent: Person | undefined = ph_lookup(ht, parentId);
        const child: Person | undefined = ph_lookup(ht, childId);

        if (parent && child) {
            if (!parent.children.includes(childId)) {
                parent.children.push(childId);
            }
            if (!child.parents.includes(parentId)) {
                child.parents.push(parentId);
            }
        }
        relations = tail(relations);
    }
    return ht;
}


/**
 * Computes the descendants of a person.
 * @param ht Relationships of people
 * @param id Identification number of the person to compute the descendants for
 * @returns Returns all the descendants of the person with ID id, according to
 *     the relationships in ht, or undefined if the person with ID is is not
 *     found in ht.
 */
export function descendants(ht: PersonTable, id: number): Array<number> | undefined {
    const ancestor: Person | undefined = ph_lookup(ht, id);
    if (!ancestor) {
        return undefined;
    }

    const result: Array<number> = [];
    const stack: Array<number> = [...ancestor.children];

    while (stack.length) {
        const current: number | undefined = stack.pop();
        if (current !== undefined) {
            if (!result.includes(current)) {
                result.push(current);
            }
            const child: Person | undefined = ph_lookup(ht, current);
            if (child?.children) {
                stack.push(...child.children);
            }
        }
    }
    return result;
}
