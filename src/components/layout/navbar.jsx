import { useContext } from 'react';
import imagenLogo from '../../assets/Imagen.png';
import { AuthContext } from '../../context/AuthContext';

function Navbar({ menuOpen, setMenuOpen }) {
  const { user } = useContext(AuthContext);

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-700 px-4 py-3 md:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">

        {/* Logo y nombre */}
        <div className="flex items-center gap-3">
          <img src={imagenLogo} alt="Logo" className="w-12 h-12" />
          <div className="text-lg md:text-xl font-bold text-emerald-400 leading-tight">
            Lumet Inspection
            <div className="text-sm text-white font-normal">Bienvenido, {user.nombre}</div>
          </div>
        </div>

        {/* Botón hamburguesa (móvil) */}
        <button
          className="md:hidden p-2 bg-gray-800 text-white rounded"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        {/* Botón de menú (desktop) */}
        <div className="hidden md:block relative">
          <button
            className="p-2 bg-gray-800 text-white rounded"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded shadow-lg z-50 animate-fade-in">
              <ul className="py-2 text-white text-sm">
                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Ver Perfil</li>
                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Modificar Datos</li>
                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Salir</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="md:hidden mt-2 bg-gray-800 rounded shadow-lg w-full z-40 animate-fade-in">
          <ul className="py-2 text-white text-center text-sm">
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Ver Perfil</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Modificar Datos</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Salir</li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;