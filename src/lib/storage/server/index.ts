import 'server-only';
import { demoEnabled, supabase } from '@/lib/server';
import { storageProviderName } from './config';
import type { StorageServerProvider } from './provider';
import { localStorageProvider } from './providers/local';
import { createSupabaseStorageProvider } from './providers/supabase';
import { s3StorageProvider } from './providers/s3';

const supabaseProvider = createSupabaseStorageProvider(supabase);

export function getStorageProvider(): StorageServerProvider {
  if (demoEnabled()) return localStorageProvider;
  const name = storageProviderName();
  if (name === 'local') return localStorageProvider;
  if (name === 's3') return s3StorageProvider;
  return supabaseProvider;
}
