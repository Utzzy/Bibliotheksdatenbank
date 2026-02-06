import { supabase } from "@/integrations/supabase/client";
import { Book, Folder, BookLookupResult } from "@/types/book";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export async function lookupISBN(isbn: string): Promise<BookLookupResult> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/isbn-lookup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isbn }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to lookup ISBN');
  }

  return response.json();
}

export async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Book[];
}

export async function addBook(book: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book> {
  const { data, error } = await supabase
    .from('books')
    .insert([book])
    .select()
    .single();

  if (error) throw error;
  return data as Book;
}

export async function updateBookQuantity(id: string, quantity: number): Promise<Book> {
  const { data, error } = await supabase
    .from('books')
    .update({ quantity })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Book;
}

export async function updateBookFolder(id: string, folder_id: string | null): Promise<Book> {
  const { data, error } = await supabase
    .from('books')
    .update({ folder_id })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Book;
}

export async function deleteBook(id: string): Promise<void> {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getFolders(): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []) as Folder[];
}

export async function addFolder(folder: Omit<Folder, 'id' | 'created_at' | 'updated_at'>): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .insert(folder)
    .select()
    .single();

  if (error) throw error;
  return data as Folder;
}

export async function updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Folder;
}

export async function deleteFolder(id: string): Promise<void> {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function checkExistingBook(userId: string, isbn: string): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .eq('isbn', isbn)
    .maybeSingle();

  if (error) throw error;
  return data as Book | null;
}
