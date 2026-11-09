// Logo oficial Arena Vale (PNG, 614×276)
import Image from 'next/image';

const PROPORCAO = 614 / 276;

export function Shield({ size = 42 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Arena Vale"
      width={Math.round(size * PROPORCAO)}
      height={size}
      priority
      style={{
        height: 'auto',
        filter: 'drop-shadow(0 3px 10px rgba(229, 9, 20, 0.3))',
      }}
    />
  );
}
