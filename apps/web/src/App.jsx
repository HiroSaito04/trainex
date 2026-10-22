import { createBrowserRouter, Navigate, RouterProvider, useParams } from 'react-router-dom';
import Layout from './layouts/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import SimulatorsPage from './pages/SimulatorsPage.jsx';
import Simulator2DPage from './pages/Simulator2DPage.jsx';
import Simulator3DPage from './pages/Simulator3DPage.jsx';
import TrainingPage from './pages/TrainingPage.jsx';
import LearningPage from './pages/LearningPage.jsx';
import GlossaryPage from './pages/GlossaryPage.jsx';
import LessonDetailPage from './pages/LessonDetailPage.jsx';
import ComponentDetailPage from './pages/ComponentDetailPage.jsx';
import GuideDetailPage from './pages/GuideDetailPage.jsx';
import GuidesPage from './pages/GuidesPage.jsx';
import HardwarePage from './pages/HardwarePage.jsx';
import AboutHelpPage from './pages/AboutHelpPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

const router=createBrowserRouter([{element:<Layout/>,children:[
 {path:'/',element:<HomePage/>},
 {path:'/simulators',element:<SimulatorsPage/>},
 {path:'/simulators/2d',element:<Simulator2DPage/>},
 {path:'/simulators/3d',element:<Simulator3DPage/>},
 {path:'/learn',element:<LearningPage/>},
 {path:'/learn/lessons/:lessonId',element:<LessonDetailPage/>},
 {path:'/learn/components/:componentId',element:<ComponentDetailPage/>},
 {path:'/glossary',element:<GlossaryPage/>},
 {path:'/train',element:<TrainingPage/>},
 {path:'/training',element:<Navigate to="/train" replace/>},
 {path:'/about',element:<AboutHelpPage/>},
 {path:'/about/guide',element:<GuidesPage/>},
 {path:'/about/guide/:guideId',element:<GuideDetailPage/>},
 {path:'/learn/guides/:guideId',element:<LegacyGuideRedirect/>},
 {path:'/hardware',element:<HardwarePage/>},
 {path:'*',element:<NotFoundPage/>},
]}]);
function LegacyGuideRedirect(){
  const {guideId}=useParams();
  return <Navigate to={`/about/guide/${encodeURIComponent(guideId)}`} replace/>;
}
export default function App(){return <RouterProvider router={router}/>;}
