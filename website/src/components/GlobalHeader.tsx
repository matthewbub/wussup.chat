import React from "react";

export function GlobalHeader() {
  return (
    <header className="zc-global-header">
      <nav>
        <div>
          <h1 className="text-xl font-semibold m-0">ZCauldron</h1>
          <span className="font-light m-0">easy finance</span>
        </div>

        {/* It's presumed the user is logged in at this point */}
        <div className="nav-links">
          <a href="/dashboard" id="dashboard-link">
            Dashboard
          </a>
          <a href="/logout" id="logout-link">
            Logout
          </a>
        </div>
      </nav>
    </header>
  );
}
