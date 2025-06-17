import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children, showNavbar = true }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {showNavbar && <Navbar />}
            <main className={showNavbar ? "" : "pt-0"}>{children}</main>
        </div>
    );
};

export default Layout;
