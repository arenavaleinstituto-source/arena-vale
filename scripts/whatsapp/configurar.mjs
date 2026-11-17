/**
 * Verifica a configuração do bot WhatsApp Business e exibe informações do número.
 * Uso: node scripts/whatsapp/configurar.mjs
 *      (lê WHATSAPP_ACCESS_TOKEN e WHATSAPP_PHONE_NUMBER_ID do .env.local)
 *
 * O webhook em si é registrado pelo painel Meta for Developers:
 *   https://developers.facebook.com/apps → Webhooks → Subscribir "messages"
 *   URL do callback: https://www.arenavale.com.br/api/whatsapp
 *   Token de verificação: valor de WHATSAPP_WEBHOOK_VERIFY_TOKEN
 */
import { readFileSync } from 'node:fs';

const env = {};
for (const linha of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const token = env.WHATSAPP_ACCESS_TOKEN;
const phoneId = env.WHATSAPP_PHONE_NUMBER_ID;
const verifyToken = env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
const appSecret = env.WHATSAPP_APP_SECRET;

const faltam = [
  !token && 'WHATSAPP_ACCESS_TOKEN',
  !phoneId && 'WHATSAPP_PHONE_NUMBER_ID',
  !verifyToken && 'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
  !appSecret && 'WHATSAPP_APP_SECRET',
].filter(Boolean);

if (faltam.length) {
  console.error('Faltam variáveis no .env.local:', faltam.join(', '));
  process.exit(1);
}

async function graph(path) {
  const r = await fetch(`https://graph.facebook.com/v19.0/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = await r.json();
  if (j.error) throw new Error(`${j.error.code} ${j.error.message}`);
  return j;
}

try {
  // Busca info do número de telefone
  const info = await graph(`${phoneId}?fields=display_phone_number,verified_name,quality_rating,platform_type`);

  console.log('\n✅ WhatsApp Business configurado\n');
  console.log(JSON.stringify({
    numero: info.display_phone_number,
    nome_verificado: info.verified_name,
    qualidade: info.quality_rating,
    plataforma: info.platform_type,
    phone_number_id: phoneId,
  }, null, 2));

  console.log('\n📋 Próximos passos para registrar o webhook:\n');
  console.log('1. Acesse: https://developers.facebook.com/apps');
  console.log('2. Selecione seu App → WhatsApp → Configuração');
  console.log('3. Em "Webhooks", clique em "Editar"');
  console.log(`4. URL do callback: ${env.NEXT_PUBLIC_BASE_URL ?? 'https://www.arenavale.com.br'}/api/whatsapp`);
  console.log(`5. Token de verificação: ${verifyToken}`);
  console.log('6. Assine o campo: messages\n');
} catch (e) {
  console.error('Erro ao consultar a Graph API:', e.message);
  process.exit(1);
}
