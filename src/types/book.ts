import { Json } from '@/integrations/supabase/types';

export interface Book {
  id: string;
  user_id: string;
  folder_id: string | null;
  isbn: string;
  title: string;
  authors: string[] | null;
  publisher: string | null;
  published_date: string | null;
  description: string | null;
  page_count: number | null;
  cover_image: string | null;
  language: string | null;
  categories: string[] | null;
  quantity: number;
  source: string | null;
  raw_data: Json | null;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface BookLookupResult {
  isbn: string;
  title: string;
  authors: string[];
  publisher: string | null;
  publishedDate: string | null;
  description: string | null;
  pageCount: number | null;
  coverImage: string | null;
  language: string | null;
  categories: string[];
  source: string;
  rawData: Json;
}
