import "./Loader.css";

export default function Loader({
    fullscreen = false,
    overlay = false,
    opaque = false,
    size = "medium",
    text = ""
}) {
    return (
        <div
            className={`app-loader ${fullscreen ? "app-loader--fullscreen" : ""} ${overlay ? "app-loader--overlay" : ""} ${opaque ? "app-loader--opaque" : ""} app-loader--${size}`}
            role="status"
            aria-live="polite"
        >
            <span className="app-loader__spinner" aria-hidden="true" />
            {text && <span className="app-loader__text">{text}</span>}
        </div>
    );
}
