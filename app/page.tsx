import Script from 'next/script';

const ORIGINAL_URL = 'https://0zjmezlsxvwtj.space.minimax.io/';

export default async function HomePage() {
  const response = await fetch(ORIGINAL_URL, { cache: 'no-store' });
  const source = await response.text();
  const body = source.match(/<body[^>]*>([\\s\\S]*?)<\\/body>/i)?.[1] ?? '';
  const content = body.replaceAll('src="./', 'src="' + ORIGINAL_URL).replaceAll('href="./', 'href="' + ORIGINAL_URL).replace('<a href="https://www.youtube.com/@TVArenaVale"', '<a href="/coordenador" class="btn btn-outline">COORDENAÇÃO</a><a href="https://www.youtube.com/@TVArenaVale"');
  return (<><link rel="stylesheet" href={`${ORIGINAL_URL}styles.css`} /><div dangerouslySetInnerHTML={{ __html: content }} /><Script src={`${ORIGINAL_URL}script.js`} strategy="afterInteractive" /></>);
}
