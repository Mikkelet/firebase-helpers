# firebase-helpers
a list of small tools for managing a firebase backend

batch_bulk.ts:

```javascript
const snap = await collection("mycollection").get();
const docs = snap.docs
const batch = new BatchBulk()
for(const doc of docs){
  const newData = {}
  batch.set(doc.ref, newData)
  batch.update(doc.ref, newData)
  // etc...
}

await batch.commit()```
