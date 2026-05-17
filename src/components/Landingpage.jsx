import Button from "./Button";

function LandingPage() {
  return (
    <>
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Top Up Aman, Dompet Tenang di TopupinID.
            </h1>
            <p className="hero-description">
              Platform terpercaya untuk pulsa dan voucher game dengan metode
              pembayaran terlengkap.
            </p>
            <div className="hero-buttons">
              <Button
                text="Belanja Sekarang"
                className="btn btn-primary"
              ></Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default LandingPage;
