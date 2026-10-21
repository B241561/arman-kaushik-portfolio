import assert from 'node:assert/strict'
import { applyVersionedContentSave } from '../server/content-document.mjs'

let document = {
  person: { name: 'Armaan' },
  about: { heading: 'Original' },
  certificates: [{ id: 'cert-1', title: 'Certificate', issuer: 'Issuer', type: 'image', file: '/media/cert.png' }],
}
let version = 0

const certificateSave = applyVersionedContentSave(
  document,
  version,
  { certificates: [{ id: 'cert-2', title: 'New certificate', issuer: 'Issuer', type: 'pdf', file: '/media/cert.pdf' }] },
  version,
)
assert.equal(certificateSave.status, 200)
document = certificateSave.content
version = certificateSave.version

const staleSave = applyVersionedContentSave(
  document,
  version,
  { about: { heading: 'Edited from an old copy' } },
  0,
)
assert.equal(staleSave.status, 409)
assert.equal(document.certificates[0].id, 'cert-2')

const partialSave = applyVersionedContentSave(document, version, { about: { heading: 'Updated' } }, version)
assert.equal(partialSave.status, 200)
assert.equal(partialSave.content.certificates[0].id, 'cert-2')
assert.equal(partialSave.content.person.name, 'Armaan')

console.log('Content-save regression checks passed.')
