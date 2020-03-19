import * as firebase from 'firebase-admin'
const fs = firebase.firestore();

// https://github.com/Mikkelet/firebase-helpers/blob/master/batch_bulk.ts


export default class BatchInstance {
    private _batch: firebase.firestore.WriteBatch;
    private _size = 0;
    private _batches: firebase.firestore.WriteBatch[];

    /**
     * initiate batch
     */
    public constructor() {
        this._batch = fs.batch();
        this._batches = [];
    }
    /**
     * Set or overwrite data to new or existing document
     * @param doc Docuement to be set
     * @param data Data to be applied
     */
    async set(doc: firebase.firestore.DocumentReference, data: any) {
        this._batch.set(doc, data);
        this._size++;
        this.addBatchIfFull()
    }
    /**
     * Delete a document
     * @param doc document to be deleted
     */
    async delete(doc: firebase.firestore.DocumentReference) {
        this._batch.delete(doc)
        this._size++;
        this.addBatchIfFull()
    }
    /**
     * Apply an update to a document. The document MUST exist or the entire batch fails.
     * @param doc what doc to update
     * @param data the data that needs updating
     */
    async update(doc: firebase.firestore.DocumentReference, data: any) {
        this._batch.update(doc, data);
        this._size++;
        this.addBatchIfFull();
    }
    private addBatchIfFull() {
        if (this._size < 500) return;
        this._batches.push(this._batch);
        this.resetBatch()
    }

    async commit(commitInOrder: boolean = false) {
        // if any docs left in current batch, push to batch list
        if (this._size > 0)
            this._batches.push(this._batch);

        // if batch list has any batches
        if (this._batches.length > 0) {
            console.log("Committing " + (this._batches.length * 500 + this._size) + " changes")
            // if they have to be commited in order:
            if (commitInOrder)
                for (const b of this._batches) {
                    await b.commit()
                }
            // else commit them to a new list of promises
            else {
                const asyncCommits: Promise<firebase.firestore.WriteResult[]>[] = []
                this._batches.forEach((b) => asyncCommits.push(b.commit()))
                await Promise.all(asyncCommits);
            }
        }
        // resolve promises;
        await Promise.all(this._batches).catch(console.error);
        this._batches = [];
        this.resetBatch()
    }
    
    private resetBatch() {
        this._size = 0;
        this._batch = fs.batch();
    }
}
