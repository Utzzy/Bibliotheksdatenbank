import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BookInfo {
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
  rawData: Record<string, unknown>;
}

// Try Open Library first
async function lookupOpenLibrary(isbn: string): Promise<BookInfo | null> {
  try {
    console.log(`[OpenLibrary] Looking up ISBN: ${isbn}`);
    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    
    if (!response.ok) {
      console.log(`[OpenLibrary] HTTP error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const bookData = data[`ISBN:${isbn}`];

    if (!bookData) {
      console.log(`[OpenLibrary] No data found for ISBN: ${isbn}`);
      return null;
    }

    console.log(`[OpenLibrary] Found book: ${bookData.title}`);

    // Get cover image - prefer medium size
    let coverImage = null;
    if (bookData.cover) {
      coverImage = bookData.cover.medium || bookData.cover.large || bookData.cover.small;
    }

    return {
      isbn,
      title: bookData.title || 'Unknown Title',
      authors: bookData.authors?.map((a: { name: string }) => a.name) || [],
      publisher: bookData.publishers?.[0]?.name || null,
      publishedDate: bookData.publish_date || null,
      description: bookData.notes || bookData.excerpts?.[0]?.text || null,
      pageCount: bookData.number_of_pages || null,
      coverImage,
      language: bookData.languages?.[0]?.key?.replace('/languages/', '') || null,
      categories: bookData.subjects?.map((s: { name: string }) => s.name).slice(0, 5) || [],
      source: 'Open Library',
      rawData: bookData,
    };
  } catch (error) {
    console.error(`[OpenLibrary] Error:`, error);
    return null;
  }
}

// Try Google Books as fallback
async function lookupGoogleBooks(isbn: string): Promise<BookInfo | null> {
  try {
    console.log(`[GoogleBooks] Looking up ISBN: ${isbn}`);
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    
    if (!response.ok) {
      console.log(`[GoogleBooks] HTTP error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log(`[GoogleBooks] No data found for ISBN: ${isbn}`);
      return null;
    }

    const bookData = data.items[0].volumeInfo;
    console.log(`[GoogleBooks] Found book: ${bookData.title}`);

    // Get cover image - prefer large thumbnail
    let coverImage = null;
    if (bookData.imageLinks) {
      coverImage = bookData.imageLinks.thumbnail || bookData.imageLinks.smallThumbnail;
      // Convert to HTTPS
      if (coverImage) {
        coverImage = coverImage.replace('http://', 'https://');
      }
    }

    return {
      isbn,
      title: bookData.title || 'Unknown Title',
      authors: bookData.authors || [],
      publisher: bookData.publisher || null,
      publishedDate: bookData.publishedDate || null,
      description: bookData.description || null,
      pageCount: bookData.pageCount || null,
      coverImage,
      language: bookData.language || null,
      categories: bookData.categories || [],
      source: 'Google Books',
      rawData: bookData,
    };
  } catch (error) {
    console.error(`[GoogleBooks] Error:`, error);
    return null;
  }
}

// Try ISBNdb as another fallback (free tier available)
async function lookupISBNdb(isbn: string): Promise<BookInfo | null> {
  try {
    console.log(`[ISBNdb-alt] Looking up ISBN via Open Library Works API: ${isbn}`);
    
    // Use Open Library's works API for additional data
    const searchResponse = await fetch(`https://openlibrary.org/search.json?isbn=${isbn}&limit=1`);
    
    if (!searchResponse.ok) {
      console.log(`[ISBNdb-alt] HTTP error: ${searchResponse.status}`);
      return null;
    }

    const searchData = await searchResponse.json();

    if (!searchData.docs || searchData.docs.length === 0) {
      console.log(`[ISBNdb-alt] No data found for ISBN: ${isbn}`);
      return null;
    }

    const bookData = searchData.docs[0];
    console.log(`[ISBNdb-alt] Found book: ${bookData.title}`);

    // Build cover URL from cover_i
    let coverImage = null;
    if (bookData.cover_i) {
      coverImage = `https://covers.openlibrary.org/b/id/${bookData.cover_i}-M.jpg`;
    }

    return {
      isbn,
      title: bookData.title || 'Unknown Title',
      authors: bookData.author_name || [],
      publisher: bookData.publisher?.[0] || null,
      publishedDate: bookData.first_publish_year?.toString() || null,
      description: bookData.first_sentence?.join(' ') || null,
      pageCount: bookData.number_of_pages_median || null,
      coverImage,
      language: bookData.language?.[0] || null,
      categories: bookData.subject?.slice(0, 5) || [],
      source: 'Open Library Search',
      rawData: bookData,
    };
  } catch (error) {
    console.error(`[ISBNdb-alt] Error:`, error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { isbn } = await req.json();

    if (!isbn) {
      console.log('No ISBN provided');
      return new Response(
        JSON.stringify({ error: 'ISBN is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean ISBN - remove dashes and spaces
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    console.log(`Looking up ISBN: ${cleanIsbn}`);

    // Try different sources in order
    let bookInfo: BookInfo | null = null;

    // 1. Try Open Library first
    bookInfo = await lookupOpenLibrary(cleanIsbn);

    // 2. Try Google Books if Open Library fails
    if (!bookInfo) {
      console.log('Open Library failed, trying Google Books...');
      bookInfo = await lookupGoogleBooks(cleanIsbn);
    }

    // 3. Try Open Library Search as last resort
    if (!bookInfo) {
      console.log('Google Books failed, trying Open Library Search...');
      bookInfo = await lookupISBNdb(cleanIsbn);
    }

    if (!bookInfo) {
      console.log(`No book found for ISBN: ${cleanIsbn}`);
      return new Response(
        JSON.stringify({ error: 'Book not found in any database', isbn: cleanIsbn }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully found book: ${bookInfo.title} from ${bookInfo.source}`);

    return new Response(
      JSON.stringify(bookInfo),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in isbn-lookup function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
