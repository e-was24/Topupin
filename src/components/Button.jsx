import { Link } from "react-router-dom";
import "./components.css";

function Button(props) {
  // Jika props "to" ada, maka render sebagai Link
  if (props.to) {
    return (
      <Link to={props.to} className="button-link-wrapper">
        <button
          className={props.className}
          id={props.id}
          type="button" // Link biasanya bukan untuk submit
          disabled={props.disabled}
        >
          {props.text || props.children}
        </button>
      </Link>
    );
  }

  // Jika props "to" TIDAK ADA, render sebagai button biasa untuk form/click
  return (
    <button
      className={props.className}
      onClick={props.onClick}
      id={props.id}
      type={props.type || "button"} // Default ke "button" jika tidak diisi
      disabled={props.disabled}
      heft={props.href} // Untuk tombol yang berfungsi sebagai link biasa (bukan React Router Link)
    >
      {props.text || props.children}
    </button>
  );
}

export default Button;
