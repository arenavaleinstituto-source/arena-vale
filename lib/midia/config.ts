import { createPublicClient } from '@/lib/supabase/server';
import { CONFIG_PADRAO, mapearConfig, type ConfigSite } from './config-padrao';

export * from './config-padrao';

export async function lerConfigSite(): Promise<ConfigSite> {
  try {
    const { data, error } = await createPublicClient().from('site_config').select('*').eq('id', 'main').maybeSingle();
    if (error) return { ...CONFIG_PADRAO };
    return mapearConfig(data as Record<string, unknown> | null);
  } catch {
    return { ...CONFIG_PADRAO };
  }
}
