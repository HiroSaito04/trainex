
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Layout from "./layouts/Layout.jsx";

import HomePage from "./pages/HomePage.jsx";
import SimulatorsPage from "./pages/SimulatorsPage.jsx";
import Simulator2DPage from "./pages/Simulator2DPage.jsx";
import Simulator3DPage from "./pages/Simulator3DPage.jsx";
import TrainingPage from "./pages/TrainingPage.jsx";
import LearningPage from "./pages/LearningPage.jsx";
import GlossaryPage from "./pages/GlossaryPage.jsx";
import HardwarePage from "./pages/HardwarePage.jsx";
import AboutHelpPage from "./pages/AboutHelpPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/simulators",
        element: <SimulatorsPage />,
      },
      {
        path: "/simulators/2d",
        element: <Simulator2DPage />,
      },
      {
        path: "/simulators/3d",
        element: <Simulator3DPage />,
      },
      {
        path: "/training",
        element: <TrainingPage />,
      },
      {
        path: "/learn",
        element: <LearningPage />,
      },
      {
        path: "/glossary",
        element: <GlossaryPage />,
      },
      {
        path: "/hardware",
        element: <HardwarePage />,
      },
      {
        path: "/about",
        element: <AboutHelpPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
