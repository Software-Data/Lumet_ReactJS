import imagenLogo from '../assets/Logo.png';
import { motion } from "framer-motion";
import playBadge from "../assets/google-play-badge.png";
import { FaGlobe, FaFacebook, FaInstagram } from "react-icons/fa";
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import ia1 from "../assets/ia1.jpg";
import ia2 from "../assets/ia2.jpg";
import ia3 from "../assets/ia3.jpg";
import { useNavigate } from 'react-router-dom';
import ReactPlayer from "react-player";
import { Eye, Zap, Target, CheckCircle } from "lucide-react";

function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionIndex) => {
    const positions = [0, 1000, 1700, 2525, 3400, 4000];
    window.scrollTo({ top: positions[sectionIndex], behavior: "smooth" });
    closeMenu();
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const pulseScale = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut",
      },
    },
  };

  const IconEye = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );

  const IconZap = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );

  const IconTarget = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth={2} />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );

  const IconCheckCircle = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-blue-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="fixed w-full bg-gray-900 bg-opacity-95 z-50 shadow-lg">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img src={imagenLogo} alt="Lumet Logo" className="w-12 h-12 rounded-xl" />
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-500 select-none">Lumet Inspection</span>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 select-none">
            {["Inicio", "Demo", "Características", "Ventajas", "Disponibilidad", "Contacto"].map((section, i) => (
              <button
                key={i}
                onClick={() => scrollToSection(i)}
                className="text-gray-300 hover:text-blue-400 transition font-medium text-sm xl:text-base"
                aria-label={`Ir a sección ${section}`}
              >
                {section}
              </button>
            ))}
          </nav>

          {/* Botones Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => navigate("/Login")}
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate("/Register")}
              className="px-4 py-2 rounded-full border border-blue-600 hover:bg-blue-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              Registrarse
            </button>
          </div>

          {/* Botón Menú Móvil */}
          <button
            className="lg:hidden text-gray-300 hover:text-blue-400 focus:outline-none p-2"
            onClick={toggleMenu}
            aria-label="Menú móvil"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú Móvil */}
        {isMenuOpen && (
          <div className="lg:hidden bg-gray-900 border-t border-gray-700">
            <div className="container mx-auto px-4 py-4">
              {/* Navegación Móvil */}
              <nav className="mb-6">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {["Inicio", "Demo", "Características", "Ventajas", "Disponibilidad", "Contacto"].map((section, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToSection(i)}
                      className="text-left px-4 py-3 text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition text-sm"
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </nav>

              {/* Botones de Acción Móvil */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    navigate("/Login");
                    closeMenu();
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-medium"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => {
                    navigate("/Register");
                    closeMenu();
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-blue-600 hover:bg-blue-600 hover:text-white transition text-white font-medium"
                >
                  Registrarse
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="pt-20 sm:pt-24">{/* Spacer for fixed header */}</div>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center bg-gradient-to-b from-black to-gray-900 py-16 sm:py-20 px-4 sm:px-6 overflow-hidden">
        {/* Animación ligera con canvas para no recargar */}
        <section className="relative bg-gradient-to-b pt-8 sm:pt-12 pb-0 text-center">
          <div className="container mx-auto px-4 sm:px-6">
            <img
              src={imagenLogo}
              alt="Logo Lumet"
              className="w-100 h-100 mx-auto mb-4 drop-shadow-xl animate-pulse rounded-2xl"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">Bienvenido a</h1>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-blue-500 italic mx-8 sm:mx-16 md:mx-24 lg:mx-36">Lumet Inspection</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mt-8 sm:mt-12 md:mt-16">
              Revoluciona el control de calidad automotriz con
            </p>
          </div>
        </section>
        <canvas
          aria-hidden="true"
          className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 opacity-20 pointer-events-none select-none"
          id="background-canvas"
        />
        {/* Logo pulsando suavemente */}
        <motion.h2
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="text-xl sm:text-2xl md:text-3xl text-blue-500 mb-4 italic tracking-wide px-4"
        >
          Inteligencia Artificial y Visión Computacional
        </motion.h2>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.4 }}
          className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed px-4"
        >
          Basado en tecnología YOLOv8 entrenada en GPUs RTX con datasets gestionados vía Roboflow, nuestra solución detecta defectos en pintura automotriz con precisión milimétrica y velocidad inigualable.
        </motion.p>
      </section>

      {/* Demo Section */}
      <section id="demo" className="container mx-auto py-16 sm:py-20 px-4 sm:px-6">
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-2xl sm:text-3xl font-semibold text-center mb-6 sm:mb-8"
        >
          Demo en Vivo
        </motion.h3>
        <div className="relative aspect-video w-full max-w-4xl mx-auto shadow-2xl rounded-xl overflow-hidden ring-2 ring-blue-600">
          <ReactPlayer
            url="https://www.youtube.com/watch?v=TuDemoVideoID"
            controls
            width="100%"
            height="100%"
            light={ia1}
            playing={false}
            playIcon={
              <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 sm:p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                ▶
              </button>
            }
          />
        </div>
      </section>

      {/* Problema planteado */}
      <section className="bg-gray-950 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 leading-tight">
            ¿Tu planta automotriz enfrenta desafíos en la detección precisa de imperfecciones en pintura?
          </h3>
          <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8">
            Nuestro sistema inteligente de inspección transforma el proceso tradicional.
          </p>
        </div>
      </section>

      {/* Características / Ventajas */}
      <section id="caracteristicas" className="bg-gray-950 py-16 sm:py-20 px-4 sm:px-6">
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-2xl sm:text-3xl font-semibold text-center mb-8 sm:mb-12"
        >
          Características Clave
        </motion.h3>
        <div className="max-w-6xl mx-auto grid gap-6 sm:gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <IconEye />,
              title: "Visión por Computadora",
              desc: "Detección milimétrica y automática de defectos en pintura.",
            },
            {
              icon: <IconZap />,
              title: "IA Avanzada",
              desc: "Modelos YOLOv8 entrenados en GPUs NVIDIA RTX para máxima precisión.",
            },
            {
              icon: <IconTarget />,
              title: "Cámaras Premium",
              desc: "Iluminación y ángulos controlados para análisis óptimo.",
            },
            {
              icon: <IconCheckCircle />,
              title: "Reporte en Tiempo Real",
              desc: "Alertas y reportes inmediatos integrados con tu planta.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(59, 130, 246, 0.6)" }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-4 sm:p-6 bg-gray-900 rounded-2xl sm:rounded-3xl text-center shadow-md cursor-pointer select-none"
            >
              <div className="mb-4 sm:mb-5 flex justify-center">{f.icon}</div>
              <h4 className="font-semibold text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3">{f.title}</h4>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lista de beneficios */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-r from-black via-gray-900 to-black">
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-2xl sm:text-3xl font-semibold text-center mb-8 sm:mb-12"
        >
          Ventajas del Sistema
        </motion.h3>
        <div className="max-w-4xl mx-auto grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
          {[
            "Reducción de tiempos de inspección en un 70%, optimizando recursos.",
            "Consistencia y precisión 24/7 sin fatiga humana.",
            "Integración sencilla con sistemas y líneas de producción existentes.",
            "Dashboard intuitivo con estadísticas y tendencias en tiempo real.",
          ].map((benefit, i) => (
            <motion.div
              key={i}
              whileHover={{ x: 8 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="flex items-start space-x-3 sm:space-x-4 cursor-default select-none"
            >
              <span className="mt-2 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full inline-block flex-shrink-0" />
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">{benefit}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Galería */}
      <section id="galeria" className="bg-gray-900 py-16 sm:py-20 px-4 sm:px-6">
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-2xl sm:text-3xl font-semibold text-center mb-8 sm:mb-12"
        >
          Capturas de Pantalla
        </motion.h3>
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[ia1, ia2, ia3].map((src, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04, boxShadow: "0 15px 25px rgba(59, 130, 246, 0.7)" }}
              transition={{ type: "spring", stiffness: 200 }}
              className="overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg cursor-zoom-in select-none"
            >
              <img
                src={src}
                alt={`Captura ${i + 1}`}
                className="object-cover w-full h-48 sm:h-56 md:h-64 lg:h-72"
                loading="lazy"
                draggable={false}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Disponibilidad */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 text-center bg-gradient-to-r from-gray-900 to-black">
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6"
        >
          Próximamente en
        </motion.h3>
        <motion.img
          initial={{ scale: 0.85, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          src={playBadge}
          alt="Google Play Badge"
          className="mx-auto w-32 sm:w-40 md:w-48 filter drop-shadow-lg"
          loading="lazy"
          draggable={false}
        />
      </section>

      {/* Contacto */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 text-center bg-gradient-to-r from-gray-900 to-black">
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6"
        >
          Contáctanos
        </motion.h3>
        
        <div className="flex justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
          {/* Botón Web */}
          <a
            href="https://67ae33c7a3854.site123.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 sm:p-4 bg-gray-800 rounded-full hover:bg-[#4A0638] transition shadow-lg"
            aria-label="Visitar sitio web"
          >
            <FaGlobe className="text-2xl sm:text-3xl text-white" />
          </a>

          {/* Botón Facebook */}
          <a
            href="https://www.facebook.com/share/1Ad17DEC4B/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 sm:p-4 bg-gray-800 rounded-full hover:bg-blue-600 transition shadow-lg"
            aria-label="Ir a Facebook"
          >
            <FaFacebook className="text-2xl sm:text-3xl text-white" />
          </a>

          {/* Botón Instagram */}
          <a
            href="https://www.instagram.com/softwaredatta?igsh=MW9zYTFrcGlqM2RmOQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 sm:p-4 bg-gray-800 rounded-full hover:bg-pink-600 transition shadow-lg"
            aria-label="Ir a Instagram"
          >
            <FaInstagram className="text-2xl sm:text-3xl text-white" />
          </a>
        </div>
      </section>

      {/* Llamado a la acción */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center select-none">
          <motion.h3
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-2xl sm:text-3xl font-semibold mb-4"
          >
            ¿Listo para transformar la calidad en tu planta?
          </motion.h3>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-gray-400 mb-6 sm:mb-8 leading-relaxed text-base sm:text-lg"
          >
            Únete a la industria 4.0 con Lumet Inspection, la herramienta que combina visión computacional y AI para optimizar procesos y reducir defectos.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.07 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => navigate("/Login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg shadow-xl transition focus:outline-none focus:ring-4 focus:ring-blue-500"
            aria-label="Empieza tu demo ahora"
          >
            Empieza ahora
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Sección Principal del Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Logo y Descripción */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src={imagenLogo} alt="Lumet Logo" className="w-12 h-12 rounded-xl" />
                <span className="text-xl font-bold text-blue-500">Lumet Inspection</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Revoluciona el control de calidad automotriz con inteligencia artificial y visión computacional. 
                Detecta defectos en pintura con precisión milimétrica.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://67ae33c7a3854.site123.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  aria-label="Visitar sitio web"
                >
                  <FaGlobe className="w-5 h-5" />
                </a>
                <a
                  href="https://www.facebook.com/share/1Ad17DEC4B/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  aria-label="Ir a Facebook"
                >
                  <FaFacebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/softwaredatta?igsh=MW9zYTFrcGlqM2RmOQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  aria-label="Ir a Instagram"
                >
                  <FaInstagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Enlaces Rápidos */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-lg">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    Inicio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const demoSection = document.getElementById('demo');
                      demoSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    Demo
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const caracteristicasSection = document.getElementById('caracteristicas');
                      caracteristicasSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    Características
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const galeriaSection = document.getElementById('galeria');
                      galeriaSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    Galería
                  </button>
                </li>
              </ul>
            </div>

            {/* Acciones */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-lg">Acciones</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => navigate("/Login")}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    Iniciar Sesión
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/Register")}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    Registrarse
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/Terminos")}
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                  >
                    Términos de Servicio
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Línea Separadora */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-500">
                  © {new Date().getFullYear()} Lumet Inspection. Todos los derechos reservados.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Desarrollado por <a href="https://67ae33c7a3854.site123.me/" className="text-blue-500 hover:underline hover:text-blue-400 transition-colors">Software Data</a>
                </p>
              </div>

              {/* Botón Volver Arriba */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors text-sm flex items-center space-x-2"
                aria-label="Volver arriba"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>Volver arriba</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
