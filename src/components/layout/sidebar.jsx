import { useState, useEffect, useContext } from 'react';
import imagenLogo from '../../assets/Imagen.png';
import { AuthContext } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  ShieldAlert,
  ListOrdered,
  ZapIcon,
  Car,
  Settings,
  X,
  Menu,
  LogOut,
  MessageCircle,
  Shield,
  Key,
  UserCheck
} from 'lucide-react';

// Componente reutilizable para los items del menú
// Ayuda a mantener el código principal más limpio y añade la lógica de estado activo
function NavItem({ to, icon, label, isActive, onClick, requiredPermissions = [], requiredRole = null }) {
  const { hasAllPermissions, hasRole } = usePermissions();
  
  // Verificar si el usuario tiene acceso a este elemento
  const hasAccess = () => {
    // Si se requiere un rol específico, verificar primero
    if (requiredRole && !hasRole(requiredRole)) {
      return false;
    }

    // Si se requieren permisos específicos, verificar
    if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
      return false;
    }

    // Si no se especifica nada, permitir acceso
    return true;
  };

  // Si no tiene acceso, no mostrar el elemento
  if (!hasAccess()) {
    return null;
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center w-full h-12 px-3 mt-2 transition-colors duration-300 ease-in-out
        ${isActive
          ? 'border-green-400 border-r-2 text-white bg-emerald-950'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
    >
      <div className="mr-3">{icon}</div>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { canRead, isAdmin } = usePermissions();

  // Cierra el menú móvil si la pantalla se hace más grande
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { 
      label: 'Overview', 
      to: '/dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      label: 'Reportes', 
      to: '/reportes', 
      icon: <FileText className="h-5 w-5" />,
      requiredPermissions: [{ module: 'REPORTES', action: 'VIEW' }]
    },
    { 
      label: 'Usuarios', 
      to: '/usuarios', 
      icon: <Users className="h-5 w-5" />,
      requiredPermissions: [{ module: 'USUARIOS', action: 'VIEW' }]
    },
    { 
      label: 'Severidades', 
      to: '/severidades', 
      icon: <ShieldAlert className="h-5 w-5" />,
      requiredPermissions: [{ module: 'SEVERIDADES', action: 'VIEW' }]
    },
    { 
      label: 'Prioridades', 
      to: '/prioridades', 
      icon: <ListOrdered className="h-5 w-5" />,
      requiredPermissions: [{ module: 'PRIORIDADES', action: 'VIEW' }]
    },
    { 
      label: 'Carrocerías', 
      to: '/carrocerias', 
      icon: <Car className="h-5 w-5" />,
      requiredPermissions: [{ module: 'CARROCERIAS', action: 'VIEW' }]
    },
    { 
      label: 'Imperfecciones', 
      to: '/imperfecciones', 
      icon: <ZapIcon className="h-5 w-5" />,
      requiredPermissions: [{ module: 'IMPERFECCIONES', action: 'VIEW' }]
    },
    // Nuevos elementos de administración
    { 
      label: 'Roles', 
      to: '/roles', 
      icon: <Shield className="h-5 w-5" />,
      requiredPermissions: [{ module: 'ROLES', action: 'VIEW' }]
    },
    { 
      label: 'Roles y Permisos', 
      to: '/roles-permisos', 
      icon: <Key className="h-5 w-5" />,
      requiredPermissions: [
        { module: 'ROLES', action: 'VIEW' },
        { module: 'PERMISOS', action: 'VIEW' }
      ]
    },
    { 
      label: 'Configuración', 
      to: '/configuracion', 
      icon: <Settings className="h-5 w-5" />,
      requiredRole: 1 // Solo para administradores
    },
  ];

  const sidebarVariants = {
    hidden: { x: '-100%' },
    visible: { x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  };
  
  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-[calc(100vh-5rem)] p-2">
      <div className="flex-1">
        {menuItems.map((item, idx) => (
          <NavItem
            key={idx}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.to}
            onClick={() => setIsOpen(false)}
            requiredPermissions={item.requiredPermissions}
            requiredRole={item.requiredRole}
          />
        ))}
      </div>
      <div>
        <NavItem 
          label="Feedback" 
          to="/feedbacks" 
          icon={<MessageCircle className="h-5 w-5" />}
          requiredPermissions={[{ module: 'FEEDBACK', action: 'VIEW' }]}
        />
        
        
        
        <button
          onClick={() => {
            logout();
            setIsOpen(false);
          }}
          className='flex items-center w-full h-12 px-3 mt-2 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-300 ease-in-out'
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Botón de hamburguesa en la esquina superior derecha para móviles */}
      <div className="hidden flex justify-end p-4 bg-gray-900 text-white fixed top-0 right-2 z-20">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar para escritorio */}
      <motion.div
        className="hidden md:flex flex-col h-[calc(100vh)] overflow-auto w-64 bg-gray-800 text-white  left-0 top-0"
        variants={sidebarVariants}
        initial="visible" 
        animate="visible"
      >
          <Link to="/" className="flex items-center gap-4 p-2 h-20">
            <img src={imagenLogo} alt="Logo" className="w-15 h-15" />
            <div className="leading-tight">
              <h1 className="text-lg font-bold text-emerald-400">
                Lumet Inspection
              </h1>
              <p className="text-sm text-slate-300 hidden sm:block">
                Bienvenido, {user?.nombre || 'Usuario'}
              </p>
            </div>
          </Link>
        <div className='border-1 border-emerald-800'/>
        <SidebarContent />
      </motion.div>

      {/* Menú desplegable para móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden fixed top-17 left-0 w-full bg-gray-800 text-white z-10 shadow-lg"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;