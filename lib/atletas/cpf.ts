/** CPF dos atletas: conferência, formato e máscara. */

export function soDigitos(v: string): string {
  return v.replace(/\D/g, '');
}

export function cpfValido(v: string): boolean {
  const d = soDigitos(v);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (base: string) => {
    const soma = base.split('').reduce((acc, c, i) => acc + Number(c) * (base.length + 1 - i), 0);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return digito(d.slice(0, 9)) === Number(d[9]) && digito(d.slice(0, 10)) === Number(d[10]);
}

/** 000.000.000-00, aplicado enquanto a pessoa digita. */
export function formatarCpf(v: string): string {
  const d = soDigitos(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

/** Na lista, só os 3 primeiros dígitos e reticências (o CPF completo fica guardado no banco). */
export function mascararCpf(v: string | null | undefined): string {
  const d = soDigitos(v ?? '');
  return d.length === 11 ? `${d.slice(0, 3)}...` : '—';
}
