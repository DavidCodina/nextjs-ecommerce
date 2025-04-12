/* ======================
      docToObj()
====================== */
// This function is used to get around the Next.js serialization error that
// sometimes occurs when getting data from the database withing getServerSideProps.
// Pass a document directly to it, or if you're working with an array of documents,
// you can map over that array as follows: products.map(docToObj),
// As an alternate solution, I've also seen people do: JSON.parse(JSON.stringify(products))

export const docToObj = (doc: any) => {
  doc._id = doc._id.toString()

  if (doc.createdAt) {
    doc.createdAt = doc.createdAt.toString()
  }

  if (doc.updatedAt) {
    doc.updatedAt = doc.updatedAt.toString()
  }

  return doc
}
