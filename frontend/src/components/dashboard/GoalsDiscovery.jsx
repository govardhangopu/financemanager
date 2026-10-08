import { useNavigate } from "react-router-dom";
import "./DiscoveryCard.css";

const GoalsDiscovery = () => {
    const navigate = useNavigate();

    return (
        <div className="discovery-card">
            <div className="discovery-content">
                <div className="discovery-text">
                    <span className="discovery-eyebrow">GOALS</span>

                    <div>
                        <h2>Where do you want to reach?</h2>
                        <p>
                            Set financial targets and track where you're
                            trying to go.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="discovery-action"
                    onClick={() => navigate("/goals")}
                >
                    Explore
                    <span>→</span>
                </button>
            </div>
        </div>
    );
};

export default GoalsDiscovery;