import assert from 'node:assert/strict'
import { applyVersionedContentSave, parseContentRevision } from '../server/content-document.mjs'

let document = {
  person: { name: 'Armaan' },
  about: { heading: 'Original' },
  certificates: [{ id: 'cert-1', title: 'Certificate', issuer: 'Issuer', type: 'image', file: '/media/cert.png' }],
}
let version = undefined

const legacyRevision = parseContentRevision(version)
assert.deepEqual(legacyRevision, { valid: true, revision: 0 })
const legacySave = applyVersionedContentSave(
  document,
  0,
  { certificates: [{ id: 'cert-2', title: 'New certificate', issuer: 'Issuer', type: 'pdf', file: '/media/cert.pdf' }] },
  legacyRevision.revision,
)
assert.equal(legacySave.status, 200)
document = legacySave.content
version = legacySave.version
assert.equal(version, 1)

const secondRevision = parseContentRevision(` ${version} `)
assert.deepEqual(secondRevision, { valid: true, revision: 1 })
const secondSave = applyVersionedContentSave(
  document,
  version,
  { about: { heading: 'Saved twice' } },
  secondRevision.revision,
)
assert.equal(secondSave.status, 200)
document = secondSave.content
version = secondSave.version
assert.equal(version, 2)

const staleSave = applyVersionedContentSave(
  document,
  version,
  { about: { heading: 'Edited from an old copy' } },
  1,
)
assert.equal(staleSave.status, 409)
assert.equal(document.certificates[0].id, 'cert-2')

const futureRevisionSave = applyVersionedContentSave(document, version, { about: { heading: 'Future client revision' } }, 99)
assert.equal(futureRevisionSave.status, 200)
document = futureRevisionSave.content
version = futureRevisionSave.version
assert.equal(version, 3)

const partialSave = applyVersionedContentSave(document, version, { about: { heading: 'Updated' } }, version)
assert.equal(partialSave.status, 200)
assert.equal(partialSave.content.certificates[0].id, 'cert-2')
assert.equal(partialSave.content.person.name, 'Armaan')
assert.deepEqual(parseContentRevision({ version: 3 }), { valid: false, receivedType: 'object' })

console.log('Content-save regression checks passed.')
