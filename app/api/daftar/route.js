import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// PERINGATAN: Kredensial di-hardcode hanya untuk debugging.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Gunakan 'export async function POST(req)' BUKAN 'export default'
export async function POST(req) {
  try {
    // Membaca data dari frontend
    const formData = await req.json();

    // Menyiapkan data untuk dimasukkan ke tabel Supabase
    const dataToInsert = {
      nama_komandan: formData.nama,
      kelas: formData.kelas,
      no_whatsapp: formData.wa,
      tiup_gelas_nama: formData.lomba?.tiupGelas?.nama,
      kerupuk_nama: formData.lomba?.kerupuk?.nama,
      paku_peserta: formData.lomba?.paku?.peserta,
      tambang_putra_peserta: formData.lomba?.tambangPutra?.peserta,
      tambang_putri_peserta: formData.lomba?.tambangPutri?.peserta,
    };

    // Memasukkan data ke Supabase
    const { data, error } = await supabase
      .from('pendaftaran')
      .insert([dataToInsert])
      .select();

    if (error) {
      // Jika Supabase mengembalikan error
      console.error('Supabase Error:', error);
      return NextResponse.json({ message: 'Gagal menyimpan data ke Supabase.', error: error.message }, { status: 500 });
    }

    // Jika berhasil, kirim respons sukses
    return NextResponse.json({ message: 'Pendaftaran berhasil!', data: data }, { status: 201 });

  } catch (err) {
    // Jika terjadi error tak terduga
    console.error('Server Error:', err);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}