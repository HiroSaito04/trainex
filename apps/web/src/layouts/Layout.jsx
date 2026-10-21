
import {
  Outlet,
  ScrollRestoration,
} from "react-router-dom";

import NavBar from "../components/common/NavBar.jsx";
import Footer from "../components/common/Footer.jsx";

export default function Layout() {
  return (
    <div className="app-shell">
      <NavBar />

      <main id="main-content" className="main-content">
        <Outlet />
      </main>

      <Footer />
      <ScrollRestoration />
    </div>
  );
}
