// Logo oficial Arena Vale Sports (PNG)
import Image from 'next/image';

export function Shield({ size = 42 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Arena Vale Sports"
      width={size * (449 / 512)}
      height={size}
      priority
      style={{
        height: 'auto',
        filter: 'drop-shadow(0 3px 10px rgba(212, 168, 73, 0.35))',
      }}
    />
  );
}

export function ShieldLarge({ size = 90 }: { size?: number }) {
  return (
    <Image
      src="/logo-footer.png"
      alt="Arena Vale Sports"
      width={size * (449 / 512)}
      height={size}
      style={{
        height: 'auto',
        filter: 'drop-shadow(0 4px 14px rgba(212, 168, 73, 0.35))',
      }}
    />
  );
}
