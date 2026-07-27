/** Pure SHA-512 (FIPS 180-4) using BigInt. Returns lowercase hex. */

const MASK = (BigInt(1) << BigInt(64)) - BigInt(1);

const K: bigint[] = [
  BigInt("0x428a2f98d728ae22"), BigInt("0x7137449123ef65cd"), BigInt("0xb5c0fbcfec4d3b2f"), BigInt("0xe9b5dba58189dbbc"),
  BigInt("0x3956c25bf348b538"), BigInt("0x59f111f1b605d019"), BigInt("0x923f82a4af194f9b"), BigInt("0xab1c5ed5da6d8118"),
  BigInt("0xd807aa98a3030242"), BigInt("0x12835b0145706fbe"), BigInt("0x243185be4ee4b28c"), BigInt("0x550c7dc3d5ffb4e2"),
  BigInt("0x72be5d74f27b896f"), BigInt("0x80deb1fe3b1696b1"), BigInt("0x9bdc06a725c71235"), BigInt("0xc19bf174cf692694"),
  BigInt("0xe49b69c19ef14ad2"), BigInt("0xefbe4786384f25e3"), BigInt("0x0fc19dc68b8cd5b5"), BigInt("0x240ca1cc77ac9c65"),
  BigInt("0x2de92c6f592b0275"), BigInt("0x4a7484aa6ea6e483"), BigInt("0x5cb0a9dcbd41fbd4"), BigInt("0x76f988da831153b5"),
  BigInt("0x983e5152ee66dfab"), BigInt("0xa831c66d2db43210"), BigInt("0xb00327c898fb213f"), BigInt("0xbf597fc7beef0ee4"),
  BigInt("0xc6e00bf33da88fc2"), BigInt("0xd5a79147930aa725"), BigInt("0x06ca6351e003826f"), BigInt("0x142929670a0e6e70"),
  BigInt("0x27b70a8546d22ffc"), BigInt("0x2e1b21385c26c926"), BigInt("0x4d2c6dfc5ac42aed"), BigInt("0x53380d139d95b3df"),
  BigInt("0x650a73548baf63de"), BigInt("0x766a0abb3c77b2a8"), BigInt("0x81c2c92e47edaee6"), BigInt("0x92722c851482353b"),
  BigInt("0xa2bfe8a14cf10364"), BigInt("0xa81a664bbc423001"), BigInt("0xc24b8b70d0f89791"), BigInt("0xc76c51a30654be30"),
  BigInt("0xd192e819d6ef5218"), BigInt("0xd69906245565a910"), BigInt("0xf40e35855771202a"), BigInt("0x106aa07032bbd1b8"),
  BigInt("0x19a4c116b8d2d0c8"), BigInt("0x1e376c085141ab53"), BigInt("0x2748774cdf8eeb99"), BigInt("0x34b0bcb5e19b48a8"),
  BigInt("0x391c0cb3c5c95a63"), BigInt("0x4ed8aa4ae3418acb"), BigInt("0x5b9cca4f7763e373"), BigInt("0x682e6ff3d6b2b8a3"),
  BigInt("0x748f82ee5defb2fc"), BigInt("0x78a5636f43172f60"), BigInt("0x84c87814a1f0ab72"), BigInt("0x8cc702081a6439ec"),
  BigInt("0x90befffa23631e28"), BigInt("0xa4506cebde82bde9"), BigInt("0xbef9a3f7b2c67915"), BigInt("0xc67178f2e372532b"),
  BigInt("0xca273eceea26619c"), BigInt("0xd186b8c721c0c207"), BigInt("0xeada7dd6cde0eb1e"), BigInt("0xf57d4f7fee6ed178"),
  BigInt("0x06f067aa72176fba"), BigInt("0x0a637dc5a2c898a6"), BigInt("0x113f9804bef90dae"), BigInt("0x1b710b35131c471b"),
  BigInt("0x28db77f523047d84"), BigInt("0x32caab7b40c72493"), BigInt("0x3c9ebe0a15c9bebc"), BigInt("0x431d67c49c100d4c"),
  BigInt("0x4cc5d4becb3e42b6"), BigInt("0x597f299cfc657e2a"), BigInt("0x5fcb6fab3ad6faec"), BigInt("0x6c44198c4a475817"),
];

function rotr(x: bigint, n: number): bigint {
  return ((x >> BigInt(n)) | (x << BigInt(64 - n))) & MASK;
}

function add(...xs: bigint[]): bigint {
  return xs.reduce((a, b) => (a + b) & MASK, BigInt(0));
}

function hex64(x: bigint): string {
  return x.toString(16).padStart(16, "0");
}

export function sha512Bytes(bytes: Uint8Array): string {
  const H = [
    BigInt("0x6a09e667f3bcc908"), BigInt("0xbb67ae8584caa73b"), BigInt("0x3c6ef372fe94f82b"), BigInt("0xa54ff53a5f1d36f1"),
    BigInt("0x510e527fade682d1"), BigInt("0x9b05688c2b3e6c1f"), BigInt("0x1f83d9abfb41bd6b"), BigInt("0x5be0cd19137e2179"),
  ];

  const bitLen = BigInt(bytes.length) * BigInt(8);
  const withOne = bytes.length + 1;
  const totalLen = withOne + ((112 - (withOne % 128) + 128) % 128) + 16;
  const padded = new Uint8Array(totalLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  // 128-bit length, big-endian (high 64 then low 64)
  const high = bitLen >> BigInt(64);
  const low = bitLen & MASK;
  for (let i = 0; i < 8; i += 1) {
    padded[totalLen - 16 + i] = Number((high >> BigInt(56 - i * 8)) & BigInt("0xff"));
    padded[totalLen - 8 + i] = Number((low >> BigInt(56 - i * 8)) & BigInt("0xff"));
  }

  const w = new Array<bigint>(80);
  for (let offset = 0; offset < totalLen; offset += 128) {
    for (let i = 0; i < 16; i += 1) {
      let v = BigInt(0);
      for (let j = 0; j < 8; j += 1) {
        v = (v << BigInt(8)) | BigInt(padded[offset + i * 8 + j]!);
      }
      w[i] = v;
    }
    for (let i = 16; i < 80; i += 1) {
      const s0 =
        rotr(w[i - 15]!, 1) ^ rotr(w[i - 15]!, 8) ^ (w[i - 15]! >> BigInt(7));
      const s1 =
        rotr(w[i - 2]!, 19) ^ rotr(w[i - 2]!, 61) ^ (w[i - 2]! >> BigInt(6));
      w[i] = add(w[i - 16]!, s0, w[i - 7]!, s1);
    }

    let [a, b, c, d, e, f, g, h] = H;

    for (let i = 0; i < 80; i += 1) {
      const S1 = rotr(e, 14) ^ rotr(e, 18) ^ rotr(e, 41);
      const ch = (e & f) ^ (~e & g);
      const temp1 = add(h, S1, ch, K[i]!, w[i]!);
      const S0 = rotr(a, 28) ^ rotr(a, 34) ^ rotr(a, 39);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = add(S0, maj);

      h = g;
      g = f;
      f = e;
      e = add(d, temp1);
      d = c;
      c = b;
      b = a;
      a = add(temp1, temp2);
    }

    H[0] = add(H[0]!, a);
    H[1] = add(H[1]!, b);
    H[2] = add(H[2]!, c);
    H[3] = add(H[3]!, d);
    H[4] = add(H[4]!, e);
    H[5] = add(H[5]!, f);
    H[6] = add(H[6]!, g);
    H[7] = add(H[7]!, h);
  }

  return H.map(hex64).join("");
}

export function sha512(message: string): string {
  return sha512Bytes(new TextEncoder().encode(message));
}
