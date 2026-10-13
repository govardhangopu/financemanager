import "./ScenarioPicker.css";

export default function ScenarioPicker({ scenarios = [], onSelect, onCreate, onClose }) {
    return (
        <div className="scenario-picker-overlay">
            <div className="scenario-picker">
                <div className="scenario-picker-header">
                    <div>
                        <h3>Explore in Scenario</h3>
                        <p>
                            Choose a scenario to explore this transaction in.
                        </p>
                    </div>

                    <button type="button" className="scenario-picker-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="scenario-picker-body">
                    {scenarios.length === 0 ? (
                        <div className="scenario-picker-empty">
                            <h4>No scenarios yet</h4>
                            <p>
                                Create a scenario to explore how changing this
                                transaction could affect your finances.
                            </p>
                            <button
                                type="button"
                                className="scenario-picker-create"
                                onClick={onCreate}
                            >
                                + Create Your First Scenario
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="scenario-picker-label">
                                Your Scenarios
                            </p>

                            <button type="button" className="scenario-picker-create" onClick={onCreate}>+ Create New Scenario</button>

                            <div className="scenario-picker-list">
                                {scenarios.map(scenario => (
                                    <button key={scenario.scenarioid} type="button" 
                                        className="scenario-picker-item" onClick={() => onSelect(scenario.scenarioid)}>
                                        <div>
                                            <strong>{scenario.name}</strong>
                                            {scenario.description && (
                                                <span>
                                                    {scenario.description}
                                                </span>
                                            )}
                                        </div>

                                        <span className="scenario-picker-arrow">→</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}                    
                </div>
            </div>
        </div>
    );
}