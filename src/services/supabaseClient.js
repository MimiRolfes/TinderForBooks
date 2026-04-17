import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const saveLikedBook = async (book) => {
  console.log("🔥 SAVE FUNCTION CALLED", book);

  const { data, error } = await supabase
    .from("liked_Books")
    .insert([
 {
  title: book.title,
  author: book.author,
  cover: book.cover || null,
  claptext: book.claptext || null,
  amazonLink: book.amazonLink || null,
}
])
.select();

  if (error) {
    console.error("Error saving liked book:", error);
  } else {
    console.log("Saved to Supabase:", data);
  }
};

export const getLikedBooksFromSupabase = async () => {
  const { data, error } = await supabase
    .from("liked_Books")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading liked books:", error);
    return [];
  }

  return data;
};

export const removeLikedBookFromSupabase = async (id) => {
  const { error } = await supabase
    .from("liked_Books")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error removing liked book:", error);
    return false;
  }

  return true;
};