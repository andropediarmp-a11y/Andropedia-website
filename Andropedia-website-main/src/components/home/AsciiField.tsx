const signalText = `a3 01 x+ 77 b2 ?9 c0 4f
11 y7 2b =a 0x 56 9c +1
z4 88 n1 ?c 73 b6 x2 04
0a +5 19 yx 31 c7 =b 62
7n 23 x0 46 a1 ?8 z5 c9
b4 =2 67 0x y3 15 c8 +7
39 a6 ?1 n4 00 xb 72 z5
x2 14 c9 +3 6a 87 ?0 b1
05 z7 yx 32 =c 68 1n 44
c1 73 +9 b0 ?a 25 x6 z8`;

export function AsciiField({ className = "" }: { className?: string }) {
  return <pre aria-hidden="true" className={`signal-field pointer-events-none select-none whitespace-pre font-mono text-[clamp(0.55rem,1.15vw,1rem)] leading-[1.1] tracking-[0.12em] text-[rgba(8,10,13,0.1)] ${className}`}>{signalText}</pre>;
}
