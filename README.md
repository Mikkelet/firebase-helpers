# firebase-helpers
a list of small tools for managing a firebase backend

batch_bulk.ts:

``
const snap = await collection("mycollection").get();

const docs = snap.docs

const batch = new BatchBulk()

for(const doc of docs){

  const newData = {}
  
  await batch.set(doc.ref, newData)
  
  await batch.update(doc.ref, newData)
  
  // etc...
  
}

await batch.commit()

``
