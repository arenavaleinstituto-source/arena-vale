// Configura o robô do Telegram: menu de comandos e webhook com botões (callback_query).
// Uso: node scripts/telegram/configurar.mjs   (lê TELEGRAM_BOT_TOKEN e TELEGRAM_WEBHOOK_SECRET do .env.local)
// Nunca imprime o token nem o segredo.
import { readFileSync } from 'node:fs';

const env = {};
for (const linha of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const token = env.TELEGRAM_BOT_TOKEN;
const segredo = env.TELEGRAM_WEBHOOK_SECRET;
if (!token || !segredo) {
  console.error('Faltam TELEGRAM_BOT_TOKEN e/ou TELEGRAM_WEBHOOK_SECRET no .env.local');
  process.exit(1);
}

async function tg(metodo, corpo = {}) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${metodo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });
  const j = await r.json();
  if (!j.ok) throw new Error(`${metodo}: ${j.description ?? 'erro'}`);
  return j.result;
}

const info = await tg('getWebhookInfo');
const url = process.argv[2] || info.url;
if (!url) {
  console.error('Webhook sem endereço: passe a URL, ex.: node scripts/telegram/configurar.mjs https://arena-vale.vercel.app/api/telegram');
  process.exit(1);
}

await tg('setMyCommands', {
  commands: [
    { command: 'fotos', description: 'Enviar fotos para a galeria' },
    { command: 'pronto', description: 'Terminar o envio de fotos' },
  ],
});
await tg('setWebhook', { url, secret_token: segredo, allowed_updates: ['message', 'callback_query'] });
const depois = await tg('getWebhookInfo');
console.log(
  JSON.stringify(
    {
      url: depois.url,
      allowed_updates: depois.allowed_updates,
      pendentes: depois.pending_update_count,
      ultimo_erro: depois.last_error_message ?? null,
    },
    null,
    2,
  ),
);
