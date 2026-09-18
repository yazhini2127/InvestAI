import { useState } from "react";
import "./SIPPlans.css";

const defaultPlans = [
  {
    id: 3,
    investment: "Investment #1",
    amount: 2000,
    date: 25,
    status: "Paused",
  },
  {
    id: 2,
    investment: "Investment #1",
    amount: 3000,
    date: 15,
    status: "Active",
  },
  {
    id: 1,
    investment: "Investment #1",
    amount: 5000,
    date: 10,
    status: "Active",
  },
];

function getInitialPlans() {
  try {
    const saved = localStorage.getItem("investai_sip_plans");

    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    return defaultPlans;
  }

  return defaultPlans;
}

function SIPPlans() {
  const [plans, setPlans] = useState(getInitialPlans);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    investment: "Investment #1",
    amount: "",
    date: "",
  });

  const savePlans = (newPlans) => {
    setPlans(newPlans);

    localStorage.setItem(
      "investai_sip_plans",
      JSON.stringify(newPlans)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((oldForm) => ({
      ...oldForm,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingId(null);

    setForm({
      investment: "Investment #1",
      amount: "",
      date: "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);

    setForm({
      investment: "Investment #1",
      amount: "",
      date: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = Number(form.amount);
    const date = Number(form.date);

    if (!amount || amount < 500) {
      alert("Minimum SIP amount is ₹500");
      return;
    }

    if (!date || date < 1 || date > 28) {
      alert("SIP date must be between 1 and 28");
      return;
    }

    if (editingId !== null) {
      const updatedPlans = plans.map((plan) => {
        if (plan.id === editingId) {
          return {
            ...plan,
            investment: form.investment,
            amount: amount,
            date: date,
          };
        }

        return plan;
      });

      savePlans(updatedPlans);

      alert("SIP updated successfully!");

      closeForm();

      return;
    }

    const highestId =
      plans.length > 0
        ? Math.max(
            ...plans.map(
              (plan) => Number(plan.id) || 0
            )
          )
        : 0;

    const newPlan = {
      id: highestId + 1,
      investment: form.investment,
      amount: amount,
      date: date,
      status: "Active",
    };

    savePlans([newPlan, ...plans]);

    alert("SIP created successfully!");

    closeForm();
  };

  const editPlan = (plan) => {
    setEditingId(plan.id);

    setForm({
      investment: plan.investment,
      amount: String(plan.amount),
      date: String(plan.date),
    });

    setShowForm(true);
  };

  const togglePlan = (id) => {
    const updatedPlans = plans.map((plan) => {
      if (plan.id === id) {
        return {
          ...plan,
          status:
            plan.status === "Active"
              ? "Paused"
              : "Active",
        };
      }

      return plan;
    });

    savePlans(updatedPlans);
  };

  const deletePlan = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this SIP?"
    );

    if (!confirmDelete) {
      return;
    }

    const updatedPlans = plans.filter(
      (plan) => plan.id !== id
    );

    savePlans(updatedPlans);

    alert("SIP deleted successfully!");
  };

  const refreshPlans = () => {
    try {
      const saved = localStorage.getItem(
        "investai_sip_plans"
      );

      if (saved) {
        setPlans(JSON.parse(saved));
      } else {
        setPlans(defaultPlans);
      }

      alert("SIP plans refreshed!");
    } catch {
      setPlans(defaultPlans);
      alert("Unable to refresh SIP plans.");
    }
  };

  const activePlans = plans.filter(
    (plan) => plan.status === "Active"
  );

  const monthlyAmount = activePlans.reduce(
    (total, plan) =>
      total + Number(plan.amount),
    0
  );

  return (
    <div className="sip-page">

      {/* HEADER */}

      <div className="sip-header">

        <div>
          <h1>📅 SIP Plans</h1>

          <p>
            Manage your systematic investment plans
          </p>
        </div>

        <div className="sip-header-actions">

          <button
            className="refresh-btn"
            onClick={refreshPlans}
          >
            🔄 Refresh
          </button>

          <button
            className="add-sip-btn"
            onClick={openCreateForm}
          >
            + Create SIP
          </button>

        </div>

      </div>


      {/* SUMMARY */}

      <div className="sip-summary">

        <div className="summary-card">

          <span>
            Active SIPs
          </span>

          <strong>
            {activePlans.length}
          </strong>

        </div>


        <div className="summary-card">

          <span>
            Monthly Investment
          </span>

          <strong>
            ₹
            {monthlyAmount.toLocaleString(
              "en-IN"
            )}
          </strong>

        </div>


        <div className="summary-card">

          <span>
            Total SIP Plans
          </span>

          <strong>
            {plans.length}
          </strong>

        </div>

      </div>


      {/* FORM */}

      {showForm && (

        <div className="sip-form-card">

          <h2>
            {editingId !== null
              ? "✏️ Edit SIP"
              : "➕ Create New SIP"}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>
                Investment
              </label>

              <select
                name="investment"
                value={form.investment}
                onChange={handleChange}
              >

                <option value="Investment #1">
                  Investment #1
                </option>

                <option value="Tata Motors">
                  Tata Motors
                </option>

                <option value="TVS Motor">
                  TVS Motor
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Monthly Amount
              </label>

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="500"
              />

            </div>


            <div className="form-group">

              <label>
                SIP Date
              </label>

              <input
                type="number"
                name="date"
                value={form.date}
                onChange={handleChange}
                placeholder="1 - 28"
                min="1"
                max="28"
              />

            </div>


            <div className="form-buttons">

              <button
                type="submit"
                className="save-btn"
              >
                {editingId !== null
                  ? "Update SIP"
                  : "Create SIP"}
              </button>


              <button
                type="button"
                className="cancel-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}


      {/* SIP LIST */}

      <div className="sip-list">

        {plans.length === 0 ? (

          <div className="empty-state">

            <div>
              📅
            </div>

            <h2>
              No SIP Plans
            </h2>

            <p>
              Create your first SIP plan.
            </p>

            <button
              className="add-sip-btn"
              onClick={openCreateForm}
            >
              + Create SIP
            </button>

          </div>

        ) : (

          plans.map((plan) => (

            <div
              className="sip-card"
              key={plan.id}
            >

              <div className="sip-card-top">

                <div>

                  <h2>
                    📅 SIP Plan #{plan.id}
                  </h2>

                  <span
                    className={
                      plan.status === "Active"
                        ? "status active"
                        : "status paused"
                    }
                  >
                    {plan.status}
                  </span>

                </div>


                <div className="sip-actions">

                  <button
                    className="edit-btn"
                    onClick={() =>
                      editPlan(plan)
                    }
                  >
                    ✏️ Edit
                  </button>


                  <button
                    className="toggle-btn"
                    onClick={() =>
                      togglePlan(plan.id)
                    }
                  >
                    {plan.status === "Active"
                      ? "⏸️ Pause"
                      : "▶️ Resume"}
                  </button>


                  <button
                    className="delete-btn"
                    onClick={() =>
                      deletePlan(plan.id)
                    }
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>


              <div className="sip-details">

                <div>

                  <span>
                    Investment
                  </span>

                  <strong>
                    {plan.investment}
                  </strong>

                </div>


                <div>

                  <span>
                    Monthly Amount
                  </span>

                  <strong>
                    ₹
                    {Number(
                      plan.amount
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    SIP Date
                  </span>

                  <strong>
                    {plan.date}th of every month
                  </strong>

                </div>

              </div>

            </div>

          ))

        )}

      </div>


      {/* FOOTER */}

      <footer className="sip-footer">

        © 2026 InvestAI • Smart Investing with AI

      </footer>

    </div>
  );
}

export default SIPPlans;