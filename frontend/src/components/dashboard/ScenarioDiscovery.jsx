import { useNavigate } from "react-router-dom";
import { useFinance } from "../../context/FinanceContext";

export default function ScenarioDiscovery() {
    const navigate = useNavigate();
    const { scenarios, scenariosLoading } = useFinance();

    if (scenariosLoading) {
        return null;
    }

    return (
        <section className="scenario-discovery">
            <div className="scenario-discovery-content">

                <div className="scenario-discovery-text">
                    <span className="scenario-discovery-eyebrow">
                        WHAT IF?
                    </span>

                    <h2>
                        Explore possible changes to your finances
                    </h2>

                    <p>
                        See how hypothetical changes could affect your finances.
                    </p>
                </div>

                <div className="scenario-discovery-actions">
                    <button
                        type="button"
                        onClick={() => navigate("/scenarios")}
                    >
                        {scenarios.length > 0
                            ? "View Scenarios →"
                            : "Create a Scenario →"}
                    </button>
                </div>

            </div>
        </section>
    );
}