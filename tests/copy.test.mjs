import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const source = new URL('../src/demo-walkthrough/', import.meta.url);
const sync = fileURLToPath(new URL('sync.mjs', source));
const run = (...args) => spawnSync(process.execPath, [sync, ...args], {encoding: 'utf8'});
test('fresh copy is complete, repeatable and refuses local edits', async () => {
  const destination = await mkdtemp(join(tmpdir(), 'demo-walkthrough-'));
  try {
    assert.equal(run(destination).status, 0);
    assert.equal(run(destination, '--check').status, 0);
    const manifest = JSON.parse(await readFile(new URL('version.json', source), 'utf8'));
    for (const name of [...Object.keys(manifest.files), 'version.json']) {
      assert.deepEqual(await readFile(join(destination, name)), await readFile(new URL(name, source)));
    }
    assert.equal(run(destination).status, 0);
    const edited = (await readFile(join(destination, 'model.ts'), 'utf8')) + '\n// Local customization\n';
    await writeFile(join(destination, 'model.ts'), edited);
    assert.notEqual(run(destination, '--check').status, 0);
    const rejected = run(destination);
    assert.notEqual(rejected.status, 0);
    assert.match(rejected.stderr, /Local edits detected/);
    assert.equal(await readFile(join(destination, 'model.ts'), 'utf8'), edited);
  } finally { await rm(destination, {recursive:true, force:true}); }
});
