import { useNavigate } from "react-router-dom";
import "./DiscoveryCard.css";

const ScenarioDiscovery = () => {
    const navigate = useNavigate();

    return (
        <div className="discovery-card">
            <div className="discovery-content">
                <div className="discovery-text">
                    <span className="discovery-eyebrow">SCENARIO</span>

                    <div>
                        <h2>What if you changed something?</h2>
                        <p>
                            Explore how different financial decisions could
                            affect your future.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="discovery-action"
                    onClick={() => navigate("/scenarios")}
                >
                    Explore
                    <span>→</span>
                </button>
            </div>
        </div>
    );
};

export default ScenarioDiscovery;