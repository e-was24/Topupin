import "./components.css";
import Button from "./Button";
import { Link } from "react-router-dom";

// Komponen Card Kamu
function Card(props) {
  // Jika punya 3 variasi warna, gunakan % 3
  const themeClass = `theme-${props.index % 3}`;

  return (
    // Gabungkan kelas dasar dengan kelas tema dinamis
    <div className={`card ${themeClass}`}>
      <div className="card-header">
        <h2 className="card-title">{props.title}</h2>
      </div>
      <div className="card-img">
        <img src={props.img} alt="" />
      </div>
      <div className="card-body">
        <p className="card-text">{props.text}</p>
      </div>
      <div className="card-footer">
        <Link to={props.link}>
          <Button className="btn btn-buy" text={props.buttonText} />
        </Link>
      </div>
    </div>
  );
}

export default Card;
