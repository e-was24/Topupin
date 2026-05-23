import React from 'react';
import './pages-style.css';

const About = () => {
    return (
        <div className="about-container">
            
            {/* Hero Section */}
            <div className="about-hero">
                <div className="hero-content">
                    <h2 className="hero-title">About TopUpIn</h2>
                    <p className="hero-subtitle">
                        Solusi tercepat, terpercaya, dan termurah untuk semua kebutuhan top-up game dan produk digital Anda.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="about-main">
                <div className="about-grid">

                    {/* Cerita Kami */}
                    <div className="about-card siapa-kami">
                        <h3 className="card-title">Siapa Kami?</h3>
                        <div className="card-body">
                            <p>
                                Welcome to <span className="highlight">TopUpIn</span>, platform top-up produk digital yang didirikan untuk memberikan pengalaman transaksi yang mulus bagi para gamer dan pengguna internet di Indonesia. Kami memahami betapa pentingnya waktu dan keamanan dalam melakukan transaksi digital.
                            </p>
                            <p>
                                Oleh karena itu, kami menghadirkan sistem otomatis yang memproses pesanan Anda dalam hitungan detik, 24 jam nonstop setiap hari, dengan berbagai pilihan metode pembayaran yang aman.
                            </p>
                        </div>
                    </div>

                    {/* Visi & Misi */}
                    <div className="about-card visi-misi">
                        <h3 className="card-title">Visi & Misi</h3>
                        <div className="card-body">
                            <div className="sub-box">
                                <strong>Visi</strong>
                                Menjadi platform layanan top-up game dan produk digital nomor satu yang paling tepercaya, cepat, dan terjangkau di seluruh wilayah.
                            </div>
                            <div className="sub-box">
                                <strong>Misi</strong>
                                Memberikan layanan pelanggan terbaik, menjaga keamanan setiap transaksi, serta terus memperbarui variasi produk sesuai dengan tren game dan aplikasi terbaru.
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Keunggulan Kami (Fitur) */}
            <div className="about-features">
                <div className="features-header">
                    <h2>Mengapa Memilih Kami?</h2>
                    <p>Layanan Terbaik untuk Para Gamer</p>
                </div>

                <div className="features-grid">
                    {/* Fitur 1 */}
                    <div className="feature-item">
                        <div className="feature-icon">⚡</div>
                        <h3>Proses Instan</h3>
                        <p>Tidak perlu menunggu lama. Sistem otomatis kami memproses item game Anda masuk dalam hitungan detik setelah pembayaran terverifikasi.</p>
                    </div>

                    {/* Fitur 2 */}
                    <div className="feature-item">
                        <div className="feature-icon">🔒</div>
                        <h3>100% Aman & Legal</h3>
                        <p>Semua produk yang kami jual berasal dari jalur resmi/legal. Keamanan akun game Anda adalah prioritas utama kami.</p>
                    </div>

                    {/* Fitur 3 */}
                    <div className="feature-item">
                        <div className="feature-icon">💰</div>
                        <h3>Harga Bersaing</h3>
                        <p>Dapatkan penawaran harga terbaik dan promo menarik setiap harinya untuk menghemat pengeluaran gaming Anda.</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default About;