import React from 'react';

const About = () => {
    return (
        <div className="bg-slate-900 text-white min-h-screen font-sans">
            {/* Hero Section */}
            <div className="relative isolate overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 px-6 py-24 sm:py-32 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-4xl font-bold tracking-tight text-indigo-400 sm:text-6xl">About TopUpIn</h2>
                    <p className="mt-6 text-lg leading-8 text-slate-300">
                        Solusi tercepat, terpercaya, dan termurah untuk semua kebutuhan top-up game dan produk digital Anda.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
                <div className="mx-auto max-w-2xl lg:max-w-none">
                    <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-12">

                        {/* Cerita Kami */}
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl border-b-2 border-indigo-500 pb-2 inline-block">
                                Siapa Kami?
                            </h3>
                            <p className="mt-6 text-base leading-7 text-slate-400">
                                Hubungi **TopUpIn**, platform top-up produk digital yang didirikan untuk memberikan pengalaman transaksi yang mulus bagi para gamer dan pengguna internet di Indonesia. Kami memahami betapa pentingnya waktu dan keamanan dalam melakukan transaksi digital.
                            </p>
                            <p className="mt-4 text-base leading-7 text-slate-400">
                                Oleh karena itu, kami menghadirkan sistem otomatis yang memproses pesanan Anda dalam hitungan detik, 24 jam nonstop setiap hari, dengan berbagai pilihan metode pembayaran yang aman.
                            </p>
                        </div>

                        {/* Visi & Misi */}
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl border-b-2 border-indigo-500 pb-2 inline-block">
                                Visi & Misi
                            </h3>
                            <div className="mt-6 space-y-4 text-base leading-7 text-slate-400">
                                <p>
                                    <strong className="text-indigo-400 block">Visi:</strong>
                                    Menjadi platform layanan top-up game dan produk digital nomor satu yang paling tepercaya, cepat, dan terjangkau di seluruh wilayah.
                                </p>
                                <p>
                                    <strong className="text-indigo-400 block">Misi:</strong>
                                    Memberikan layanan pelanggan terbaik, menjaga keamanan setiap transaksi, serta terus memperbarui variasi produk sesuai dengan tren game dan aplikasi terbaru.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Keunggulan Kami (Fitur) */}
            <div className="bg-slate-800/50 py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-indigo-400">Mengapa Memilih Kami?</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Layanan Terbaik untuk Para Gamer
                        </p>
                    </div>

                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">

                            {/* Fitur 1 */}
                            <div className="flex flex-col items-center text-center bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white text-xl font-bold">
                                    ⚡
                                </div>
                                <dt className="text-lg font-semibold leading-7 text-white">Proses Instan</dt>
                                <dd className="mt-2 text-base leading-7 text-slate-400">
                                    Tidak perlu menunggu lama. Sistem otomatis kami memproses item game Anda masuk dalam hitungan detik setelah pembayaran terverifikasi.
                                </dd>
                            </div>

                            {/* Fitur 2 */}
                            <div className="flex flex-col items-center text-center bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white text-xl font-bold">
                                    🔒
                                </div>
                                <dt className="text-lg font-semibold leading-7 text-white">100% Aman & Legal</dt>
                                <dd className="mt-2 text-base leading-7 text-slate-400">
                                    Semua produk yang kami jual berasal dari jalur resmi/legal. Keamanan akun game Anda adalah prioritas utama kami.
                                </dd>
                            </div>

                            {/* Fitur 3 */}
                            <div className="flex flex-col items-center text-center bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white text-xl font-bold">
                                    💰
                                </div>
                                <dt className="text-lg font-semibold leading-7 text-white">Harga Bersaing</dt>
                                <dd className="mt-2 text-base leading-7 text-slate-400">
                                    Dapatkan penawaran harga terbaik dan promo menarik setiap harinya untuk menghemat pengeluaran gaming Anda.
                                </dd>
                            </div>

                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;