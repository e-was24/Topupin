import { useEffect, useState } from "react";
import "./components.css";
import { supabase } from "../lib/supabaseClient";

function Popup(props) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user); // update state user agar komponen di-render kembali
        
        // Gunakan maybeSingle() agar tidak error 406 jika tabel "users" masih kosong untuk id ini
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
          
        if (data) {
          console.log("Data Lengkap User:", data);
        }
      }
    };

    // Hanya fetch data jika popup sedang dibuka
    if (props.isOpen && !user) {
      fetchProfile();
    }
  }, [props.isOpen, user]);

  // Hook Rules: Conditional return tidak boleh berada di atas pemanggilan Hook
  if (!props.isOpen) return null;

  if (!user) {
    return (
      <div className="overlayStyle">
        <div className="contentStyle">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overlayStyle">
      <div className="contentStyle">
        <h2 style={{ marginBottom: "15px" }}>
          Halo! {user.user_metadata.username}
        </h2>
        <button className="closeBtnStyle" onClick={props.onClose}>
          &times;
        </button>
        <div>{props.children}</div>
      </div>
    </div>
  );
}
export default Popup;
