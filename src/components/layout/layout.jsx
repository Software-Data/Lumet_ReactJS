import { useState } from "react";
import { Link } from 'react-router-dom';
import Navbar from './navbar.jsx';
import Sidebar from './sidebar.jsx';
import ChatbotComponent from '../chatbot/ChatbotComponent.jsx';

function layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <div className="flex md:grid-cols-4 h-[calc(100vh)]">
        <Sidebar />
        <div className="w-full h-full flex-1 overflow-auto">{children}</div>
      </div>
      
      {/* Chatbot flotante disponible en toda la aplicación */}
    </div>
  );
}

export default layout;