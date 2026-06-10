import "./Loader.css";

export default function Loader({
    fullscreen = false,
    overlay = false,
    opaque = false,
    size = "medium",
    text = ""
}) {
    return (
        <div id="loader"
            className={`
                ${fullscreen ? "fullscreen" : ""}
                ${overlay ? "overlay" : ""}
                ${opaque ? "opaque" : ""}
                ${size}`}
        >
            <div className="spinner"></div>
            <p>{text}</p>
        </div>
    );
}