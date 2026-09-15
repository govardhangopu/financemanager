import { useNavigate } from "react-router-dom";
import "./DiscoveryCard.css";

const ForecastDiscovery = () => {
    const navigate = useNavigate();

    return (
        <div className="discovery-card">
            <div className="discovery-content">
                <div className="discovery-text">
                    <span className="discovery-eyebrow">FORECAST</span>

                    <div>
                        <h2>Where are you heading?</h2>
                        <p>
                            See where your finances could go if nothing
                            changes.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="discovery-action"
                    onClick={() => navigate("/forecast")}
                >
                    Explore
                    <span>→</span>
                </button>
            </div>
        </div>
    );
};

export default ForecastDiscovery;