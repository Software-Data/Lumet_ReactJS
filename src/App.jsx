import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PermissionsProvider } from './context/PermissionsContext';
import LoginPage from './Pages/LoginPage';
import Dashboard from './Pages/Dashboard';
import RolesPage from './Pages/RolesPage';
import AltaPage from './Pages/AltaPage';
import SeveridadesPage from './Pages/SeveridadesPage';
import ReportesPage from './Pages/ReportesPage';
import SeveridadForm from './components/severidad/SeveridadesForm';
import ReporteForm from './components/reporte/reporteForm';
import PrioridadesPage from './Pages/PrioridadesPage';
import PrioridadForm from './components/prioridad/PrioridadForm';
import ProtectedRoute from './ProtectedRoute';
import RolForm from './components/rol/RolForm';
import RolView from './components/rol/RolView';
import UsuarioView from './components/usuario/UsuarioView';
import SeveridadView from './components/severidad/SeveridadView';
import ReporteView from './components/reporte/ReporteView';
import ReporteDetalleView from './components/reporte/ReporteDetalleView';
import FeedbackScreen from './components/feedback/FeedbackScreen';
import FeedbackView from './components/feedback/FeedbackView';

import CarroceriasView from './components/carroceria/CarroceriaView';
import PrioridadView from './components/prioridad/PrioridadView';
import ImperfeccionView from './components/imperfeccion/ImperfeccionView';
import UsuarioForm from './components/usuario/UsuarioForm';
import ImperfeccionForm from './components/imperfeccion/imperfeccionForm';
import ImperfeccionesPage from './Pages/ImperfeccionesPage';
import CarroceriasForm from './components/carroceria/CarroceriaForm';
import UsuariosPage from './Pages/UsuariosPage';
import CarroceriasPage from './Pages/CarroceriasPage';
import DiccionarioPage from './Pages/DiccionarioPage';
import LandingPage from './Pages/LandingPage';
import RegistroPage from './Pages/RegitroPage';
import TermsOfService from './Pages/TerminosPage';
import RolesPermisosPage from './Pages/RolesPermisosPage';
import VerificacionPage from './Pages/VerificacionPage';
import ChatbotPage from './Pages/ChatbotPage';

function App() {
  return (     
    <AuthProvider>
      <PermissionsProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/diccionario' element={<DiccionarioPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegistroPage />} />
            <Route path='/register/verificar' element={<RegistroPage />} />
            <Route path='/verificacion' element={<VerificacionPage />} />
            <Route path='/verificacion/:correo' element={<VerificacionPage />} />
            <Route path='/terminos' element={<TermsOfService />} />
            <Route path='/' element={<LandingPage />} />

            {/* RUTAS PROTEGIDAS */}
            <Route element={<ProtectedRoute />}>
              <Route path='/alta' element={<AltaPage />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/roles/nuevo" element={<RolForm />} />
              <Route path="/roles/editar/:id" element={<RolForm />} />
              <Route path="/roles/ver/:id" element={<RolView />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/usuarios/nuevo" element={<UsuarioForm />} />
              <Route path="/usuarios/editar/:id" element={<UsuarioForm />} />
              <Route path="/usuarios/ver/:id" element={<UsuarioView />} />
              <Route path="/imperfecciones" element={<ImperfeccionesPage />} />
              <Route path="/imperfecciones/nuevo" element={<ImperfeccionForm />} />
              <Route path="/imperfecciones/editar/:id" element={<ImperfeccionForm />} />
              <Route path="/imperfecciones/ver/:id" element={<ImperfeccionView />} />
              <Route path="/severidades" element={<SeveridadesPage />} />
              <Route path="/severidades/nuevo" element={<SeveridadForm />} />
              <Route path="/severidades/editar/:id" element={<SeveridadForm />} />
              <Route path="/severidades/ver/:id" element={<SeveridadView />} />
              <Route path="/reportes" element={<ReportesPage />} />
              <Route path="/reportes/nuevo" element={<ReporteForm />} />
              <Route path="/reportes/editar/:id" element={<ReporteForm />} />
              <Route path="/reportes/ver/:id" element={<ReporteDetalleView />} />
              <Route path="/feedbacks" element={<FeedbackScreen />} />
              <Route path="/feedbacks/ver/:id" element={<FeedbackView />} />
              <Route path="/carrocerias" element={<CarroceriasPage />} />
              <Route path="/carrocerias/nuevo" element={<CarroceriasForm />} />
              <Route path="/carrocerias/editar/:id" element={<CarroceriasForm />} />
              <Route path="/carrocerias/ver/:id" element={<CarroceriasView />} />
              <Route path="/prioridades" element={<PrioridadesPage />} />
              <Route path="/prioridades/nuevo" element={<PrioridadForm />} />
              <Route path="/prioridades/editar/:id" element={<PrioridadForm />} />
              <Route path="/prioridades/ver/:id" element={<PrioridadView />} />
              
              {/* Nuevas rutas de permisos */}
              <Route path="/roles-permisos" element={<RolesPermisosPage />} />
              
              {/* Ruta del Chatbot */}
              <Route path="/chatbot" element={<ChatbotPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PermissionsProvider>
    </AuthProvider> 
  );
}

export default App;
