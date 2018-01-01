// https://github.com/bitcoincashjs/cashaddr
// Copyright (c) 2017 Emilio Almansi
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

/* global describe it */

const Random = require('random-js');
const assert = require('chai').assert;
const cashaddr = require('cashaddrjs');

describe('cashaddr', () => {

  const NETWORKS = ['bitcoincash', 'bchtest', 'bchreg'];
  
  const ADDRESS_TYPES = ['P2KH', 'P2SH'];
  
  const VALID_SIZES = [20, 24, 28, 32, 40, 48, 56, 64];

  const TEST_HASHES = [
    [118, 160, 64,  83, 189, 160, 168, 139, 218, 81, 119, 184, 106, 21, 195, 178, 159, 85,  152, 115],
    [203, 72, 18, 50, 41,  156, 213, 116, 49,  81, 172, 75, 45, 99, 174, 25,  142, 123, 176, 169],
    [1,   31, 40,  228, 115, 201, 95, 64,  19,  215, 213, 62, 197, 251, 195, 180, 45, 248, 237, 16],
  ];
  
  const EXPECTED_P2KH_OUTPUTS = [
    'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a',
    'bitcoincash:qr95sy3j9xwd2ap32xkykttr4cvcu7as4y0qverfuy',
    'bitcoincash:qqq3728yw0y47sqn6l2na30mcw6zm78dzqre909m2r',
  ];

  const EXPECTED_P2SH_OUTPUTS = [
    'bitcoincash:ppm2qsznhks23z7629mms6s4cwef74vcwvn0h829pq',
    'bitcoincash:pr95sy3j9xwd2ap32xkykttr4cvcu7as4yc93ky28e',
    'bitcoincash:pqq3728yw0y47sqn6l2na30mcw6zm78dzq5ucqzc37', 
  ];

  const random = new Random(Random.engines.mt19937().seed(42));

  function getRandomHash(size) {
    const hash = [];
    for (let i = 0; i < size; ++i) {
      hash.push(random.integer(0, 255));
    }
    return hash;
  }

  describe('#encode()', () => {
    it('should fail on hashes of invalid length', () => {
      for (let size of VALID_SIZES) {
        const hash = getRandomHash(size - 1);
        assert.throws(() => {
          cashaddr.encode(NETWORKS[0], ADDRESS_TYPES[0], hash);
        });
      }
    });

    it('should encode test hashes correctly', () => {
      for (const index in TEST_HASHES) {
        assert.equal(
          cashaddr.encode('bitcoincash', 'P2KH', TEST_HASHES[index]),
          EXPECTED_P2KH_OUTPUTS[index]
        );
        assert.equal(
          cashaddr.encode('bitcoincash', 'P2SH', TEST_HASHES[index]),
          EXPECTED_P2SH_OUTPUTS[index]
        );
      }
    });
  });

  describe('#decode()', () => {
    it('should decode a valid address regardless of case', () => {
      assert.deepEqual(
        cashaddr.decode('bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a').hash,
        cashaddr.decode('BITCOINCASH:QPM2QSZNHKS23Z7629MMS6S4CWEF74VCWVY22GDX6A').hash
      );
    });

    it('should fail when given an address with mixed case', () => {
      assert.throws(() => {
        cashaddr.decode('BitCOINcash:QPM2QSZNHKS23Z7629MMS6s4cwef74vcwvY22GDX6A');
      });
    });

    it('should fail when decoding for a different network', () => {
      for (let network of NETWORKS) {
        for (let anotherNetwork of NETWORKS) {
          if (network !== anotherNetwork) {
            const hash = getRandomHash(20);
            assert.throws(() => {
              const address = cashaddr.encode(network, ADDRESS_TYPES[0], hash);
              const invalidAddress = [anotherNetwork, address.split(':')[1]].join(':');
              cashaddr.decode(invalidAddress);
            });
          }
        } 
      }
    });
  });
  
  describe('#encode() #decode()', () => {
    it('should encode and decode all sizes correctly', () => {
      for (let size of VALID_SIZES) {
        const hash = getRandomHash(size);
        const address = cashaddr.encode(NETWORKS[0], ADDRESS_TYPES[0], hash);
        const { prefix, type, hash: actualHash } = cashaddr.decode(address);
        assert.equal(prefix, NETWORKS[0]);
        assert.equal(type, ADDRESS_TYPES[0]);
        assert.deepEqual(actualHash, hash);
      }
    });
  
    it('should encode and decode all types and networks', () => {
      for (let type of ADDRESS_TYPES) {
        for (let network of NETWORKS) {
          const hash = getRandomHash(20);
          const address = cashaddr.encode(network, type, hash);
          const { prefix, type: actualType, hash: actualHash } = cashaddr.decode(address);
          assert.equal(prefix, network);
          assert.equal(actualType, type);
          assert.deepEqual(actualHash, hash);
        }
      }
    });
  
    it('should encode and decode many random hashes', () => {
      const NUM_TESTS = 1000;
      for (let i = 0; i < NUM_TESTS; ++i) {
        for (let type of ADDRESS_TYPES) {
          const hash = getRandomHash(20);
          const address = cashaddr.encode(NETWORKS[0], type, hash);
          const { prefix, type: actualType, hash: actualHash } = cashaddr.decode(address);
          assert.equal(prefix, NETWORKS[0]);
          assert.equal(actualType, type);
          assert.deepEqual(actualHash, hash);
        }
      }
    });
  });
});