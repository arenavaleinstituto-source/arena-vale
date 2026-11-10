/**
 * Posta a notícia como Story no Instagram (API oficial com login do Instagram).
 * Fala com o Instagram, o banco e o armazenamento só pelas "portas", para ser testado sem eles.
 *
 * Passos da API: cria o "container" (media_type=STORIES com video_url ou image_url JPEG),
 * espera o Instagram processar (status_code = FINISHED) e então publica (media_publish).
 */

export type ContaInstagram = { userId: string; token: string };
export type MidiaStory = { video_url: string } | { image_url: string };
export type StatusStory = 'processando' | 'publicado' | 'erro';
export type ResultadoStory = { status: StatusStory; erro?: string };

export type NoticiaStory = {
  id: string;
  video_url: string | null;
  imagem_url: string | null;
  story_status: StatusStory | null;
  story_container_id: string | null;
};

export type CamposStory = {
  story_status: StatusStory;
  story_container_id: string | null;
  story_erro: string | null;
  story_em?: string;
};

export type PortasStory = {
  conta(): Promise<ContaInstagram | null>;
  criarContainer(conta: ContaInstagram, midia: MidiaStory): Promise<string>;
  /** IN_PROGRESS, FINISHED, ERROR, EXPIRED ou PUBLISHED. */
  statusContainer(conta: ContaInstagram, id: string): Promise<string>;
  publicarContainer(conta: ContaInstagram, id: string): Promise<string>;
  /** Monta a imagem em pé (1080x1920, JPEG) a partir da capa e devolve o endereço público. */
  prepararImagem(noticiaId: string, capaUrl: string): Promise<string>;
  salvar(noticiaId: string, campos: CamposStory): Promise<void>;
  esperar(ms: number): Promise<void>;
  agora(): number;
};

const INTERVALO = 3000;

export async function publicarStory(n: NoticiaStory, p: PortasStory, limiteMs: number): Promise<ResultadoStory> {
  if (n.story_status === 'publicado') return { status: 'publicado' };
  const conta = await p.conta();
  if (!conta) return { status: 'erro', erro: 'O Instagram ainda não foi ligado ao site.' };
  if (!n.video_url && !n.imagem_url) return { status: 'erro', erro: 'A notícia não tem foto nem vídeo para o Story.' };

  const fim = p.agora() + limiteMs;
  let container = n.story_status === 'processando' ? n.story_container_id : null;
  try {
    if (!container) {
      const midia: MidiaStory = n.video_url ? { video_url: n.video_url } : { image_url: await p.prepararImagem(n.id, n.imagem_url!) };
      container = await p.criarContainer(conta, midia);
      await p.salvar(n.id, { story_status: 'processando', story_container_id: container, story_erro: null });
    }
    for (;;) {
      const status = await p.statusContainer(conta, container);
      if (status === 'FINISHED') break;
      if (status === 'PUBLISHED') {
        await p.salvar(n.id, { story_status: 'publicado', story_container_id: null, story_erro: null, story_em: new Date().toISOString() });
        return { status: 'publicado' };
      }
      if (status === 'ERROR' || status === 'EXPIRED') {
        const erro =
          status === 'ERROR'
            ? 'O Instagram não aceitou o arquivo (Story aceita vídeo de até 60 segundos, em MP4).'
            : 'O envio venceu antes de publicar. Tente de novo.';
        await p.salvar(n.id, { story_status: 'erro', story_container_id: null, story_erro: erro });
        return { status: 'erro', erro };
      }
      if (p.agora() + INTERVALO > fim) {
        await p.salvar(n.id, { story_status: 'processando', story_container_id: container, story_erro: null });
        return { status: 'processando' };
      }
      await p.esperar(INTERVALO);
    }
    await p.publicarContainer(conta, container);
    await p.salvar(n.id, { story_status: 'publicado', story_container_id: null, story_erro: null, story_em: new Date().toISOString() });
    return { status: 'publicado' };
  } catch (e) {
    const erro = e instanceof Error ? e.message : 'Falha ao falar com o Instagram.';
    await p.salvar(n.id, { story_status: 'erro', story_container_id: null, story_erro: erro });
    return { status: 'erro', erro };
  }
}
