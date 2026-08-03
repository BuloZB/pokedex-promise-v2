import assert from 'assert';

import Pokedex from '../src/index.js';

// cacheLimit is documented (and defaulted) in milliseconds, e.g. the README
// example `cacheLimit: 100 * 1000 // 100s`. node-cache's own `ttl` option is
// in seconds, so without a ms -> s conversion a cacheLimit of 100 * 1000 ends
// up living for 100 * 1000 seconds instead of 100 seconds (1000x too long).
describe('cacheLimit', function () {
  this.timeout(10000);

  it('applies cacheLimit as milliseconds, not seconds', async () => {
    const cacheLimit = 100 * 1000; // 100 seconds, expressed in ms
    const P = new Pokedex({ cacheLimit });

    const before = Date.now();
    const { name } = await P.getPokemonByName('eevee');
    assert.strictEqual(name, 'eevee');

    const url = 'https://pokeapi.co/api/v2/pokemon/eevee/';
    const impliedMs = P.getConfig().cache.getTtl(url) - before;

    // Must stay close to cacheLimit (100000ms). The bug passed the ms value
    // straight to node-cache's seconds-based ttl, producing ~1000x this.
    assert.ok(
      impliedMs < cacheLimit * 2,
      `expected TTL close to ${cacheLimit}ms, got ${impliedMs}ms`,
    );
  });
});
