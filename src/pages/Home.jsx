import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import LandingPage from "../components/Landingpage";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // Jika user sudah login, langsung arahkan ke dashboard
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <>
      <LandingPage />
    </>
  );
}

export default Home;
