import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFinance } from "../context/FinanceContext";
import { addScenario } from "../api/scenarioApi.js";
import "../styles/Scenarios.css"

export default function Scenarios() {
    const navigate = useNavigate();
    const { scenarios, refreshScenarios, scenariosLoading } = useFinance();
    const [showAddScenario, setShowAddScenario] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [errors, setErrors] = useState({ name: "", target: "", type: "", start: "", end: "" });

    function handleCreate() {
        let newErrors = {};
        if (!name) newErrors.name = "Scenario name is required.";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        const newScenario = {
            name: name.trim(),
            description: description.trim(),
        };

        //console.log("New scenario data:", newScenario);
        addScenario(newScenario)
            .then((res) => {
                //console.log("Scenario created successfully:", res);
                refreshScenarios();
                setName("");
                setDescription("");
                setShowAddScenario(false);
                if (res && res.insertId) {
                    navigate(`/scenarios/${res.insertId}`);
                }
            })
            .catch((err) => {
                console.error("Error creating scenario:", err);
            });
    }

    return (
        <div className="scenarios-page">
            <h1>Scenarios</h1>
            <button className={!showAddScenario ? "open" : "close"} onClick={() => setShowAddScenario(true)}>Add Scenario</button>

            <div className={showAddScenario ? "open" : "close"} id="addBudget">
                <h2>Create New Scenario</h2>
                <label htmlFor="name">Scenario Name:</label>
                <div className="field1">
                    <input id="name" type="text" placeholder="Name" autoFocus={showAddScenario ? true : false} value={name} onChange={e => setName(e.target.value)} />
                    <div className="errmsg">{errors.name}</div>
                </div>

                <label htmlFor="description">Description:</label>
                <div className="field1">
                    <textarea placeholder="Description" id="description" value={description} onInput={e => setDescription(e.target.value)}
                        onChange={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}>
                    </textarea>
                    <div className="errmsg">{errors.description}</div>
                </div>
                <button onClick={() => setShowAddScenario(false)}>Cancel</button>
                <button onClick={() => handleCreate()}>Create</button>
            </div>

            <h2 className="section-title">Scenarios</h2>
            <div className="budgets_grid">
                {scenarios.length === 0 ? (
                    <p>No scenarios found. Click "Add Scenario" to create your first scenario.</p>
                ) : (
                    scenarios.map(scenario => (
                        <div key={scenario.scenarioid} className="budget_card" onClick={() => navigate(`/scenarios/${scenario.scenarioid}`)} >
                            <h3>{scenario.name}</h3>
                            {scenario.description && <p>{scenario.description}</p>}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}