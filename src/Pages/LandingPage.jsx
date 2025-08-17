import imagenLogo from '../assets/Logo.png';
import { motion } from "framer-motion";
import playBadge from "../assets/google-play-badge.png";
import { FaGlobe, FaFacebook, FaInstagram } from "react-icons/fa";

import ia1 from "../assets/ia1.jpg";
import ia2 from "../assets/ia2.jpg";
import ia3 from "../assets/ia3.jpg";
import { useNavigate } from 'react-router-dom';
import ReactPlayer from "react-player";
import { Eye, Zap, Target, CheckCircle } from "lucide-react";
function LandingPage() {
  const navigate = useNavigate();

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
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <img src={imagenLogo} alt="Lumet Logo" className="w-12 h-12 rounded-xl" />
            <span className="text-2xl font-bold text-blue-500 select-none">Lumet Inspection</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 select-none">
            {["Inicio", "Demo", "Características", "Ventajas", "Disponibilidad", "Contacto"].map((section, i) => (
              <button
                key={i}
                onClick={() => {
                  const positions = [0, 1000, 1700, 2525, 3400, 4000];
                  window.scrollTo({ top: positions[i], behavior: "smooth" });
                }}
                className="text-gray-300 hover:text-blue-400 transition font-medium"
                aria-label={`Ir a sección ${section}`}
              >
                {section}
              </button>
            ))}
          </nav>
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => navigate("/Login")}
              className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate("/Register")}
              className="px-5 py-2 rounded-full border border-blue-600 hover:bg-blue-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Registrarse
            </button>
            <button
              onClick={() => navigate("/Terminos")}
              className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Terminos de Servicio
            </button>
          </div>
          <button
            className="md:hidden text-gray-300 hover:text-blue-400 focus:outline-none"
            onClick={() => document.body.classList.toggle("overflow-hidden")}
            aria-label="Menú móvil"
          >
            ☰
          </button>
        </div>
      </header>
      <div className="pt-24">{/* Spacer for fixed header */}</div>
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center bg-gradient-to-b from-black to-gray-900 py-20 px-6 overflow-hidden">
        {/* Animación ligera con canvas para no recargar */}
      <section className="relative bg-gradient-to-b pt-12 pb-0 text-center">
        <div className="container mx-auto px-6">
          <img
            src={imagenLogo}
            alt="Logo Lumet"
            className="w-100 h-100 mx-auto mb-4 drop-shadow-xl animate-pulse rounded-2xl"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-2 leading-tight">Bienvenido a</h1>
          <h1 className="text-3xl md:text-4xl font-semibold text-blue-500 italic mx-36">Lumet Inspection</h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mt-16">
            Revoluciona el control de calidad automotriz con
          </p>
        </div>
      </section>
        <canvas
          aria-hidden="true"
          className="absolute top-0 right-0 w-64 opacity-20 pointer-events-none select-none"
          id="background-canvas"
        />
        {/* Logo pulsando suavemente */}
        <motion.h2
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="text-3xl text-blue-500 mb-4 italic tracking-wide"
        >
          Inteligencia Artificial y Visión Computacional
        </motion.h2>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-300 max-w-2xl leading-relaxed"
        >
          Basado en tecnología YOLOv8 entrenada en GPUs RTX con datasets gestionados vía Roboflow, nuestra solución detecta defectos en pintura automotriz con precisión milimétrica y velocidad inigualable.
        </motion.p>
      </section>
      <section id="demo" className="container mx-auto py-20 px-6">
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-3xl font-semibold text-center mb-8"
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
              <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                ▶
              </button>
            }
          />
        </div>
      </section>
      {/* Problema planteado */}
      <section className="bg-gray-950 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight">
            ¿Tu planta automotriz enfrenta desafíos en la detección precisa de imperfecciones en pintura?
          </h3>
          <p className="text-xl text-gray-400 mb-8">
            Nuestro sistema inteligente de inspección transforma el proceso tradicional.
          </p>
        </div>
      </section>
      {/* Características / Ventajas */}
      <section id="caracteristicas" className="bg-gray-950 py-20 px-6">
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-3xl font-semibold text-center mb-12"
        >
          Características Clave
        </motion.h3>
        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-4">
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
              whileHover={{ scale: 1.1, boxShadow: "0 10px 20px rgba(59, 130, 246, 0.6)" }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-6 bg-gray-900 rounded-3xl text-center shadow-md cursor-pointer select-none"
            >
              <div className="mb-5 flex justify-center">{f.icon}</div>
              <h4 className="font-semibold text-2xl mb-3">{f.title}</h4>
              <p className="text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Lista de beneficios */}
      <section className="py-20 px-6 bg-gradient-to-r from-black via-gray-900 to-black">
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-3xl font-semibold text-center mb-12"
        >
          Ventajas del Sistema
        </motion.h3>
        <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
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
              className="flex items-start space-x-4 cursor-default select-none"
            >
              <span className="mt-2 w-5 h-5 bg-blue-500 rounded-full inline-block" />
              <p className="text-gray-300 text-lg leading-relaxed">{benefit}</p>
            </motion.div>
          ))}
        </div>
      </section>
      <section id="galeria" className="bg-gray-900 py-20 px-6">
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-3xl font-semibold text-center mb-12"
        >
          Capturas de Pantalla
        </motion.h3>
        <div className="grid gap-8 md:grid-cols-3">
          {[ia1, ia2, ia3].map((src, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04, boxShadow: "0 15px 25px rgba(59, 130, 246, 0.7)" }}
              transition={{ type: "spring", stiffness: 200 }}
              className="overflow-hidden rounded-3xl shadow-lg cursor-zoom-in select-none"
            >
              <img
                src={src}
                alt={`Captura ${i + 1}`}
                className="object-cover w-full h-64 md:h-72"
                loading="lazy"
                draggable={false}
              />
            </motion.div>
          ))}
        </div>
      </section>
      <section className="py-16 px-6 text-center bg-gradient-to-r from-gray-900 to-black">
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-2xl font-semibold mb-6"
        >
          Próximamente en
        </motion.h3>
        <motion.img
          initial={{ scale: 0.85, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          src={playBadge}
          alt="Google Play Badge"
          className="mx-auto w-48 filter drop-shadow-lg"
          loading="lazy"
          draggable={false}
        />
      </section>
      <section className="py-16 px-6 text-center bg-gradient-to-r from-gray-900 to-black">
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-2xl font-semibold mb-6"
        >
          Contáctanos
        </motion.h3>
        
        <div className="flex justify-center gap-6 mt-8">
          {/* Botón Web */}
          <a
            href="https://67ae33c7a3854.site123.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gray-800 rounded-full hover:bg-[#4A0638] transition shadow-lg"
            aria-label="Visitar sitio web"
          >
            <FaGlobe className="text-3xl text-white" />
          </a>

          {/* Botón Facebook */}
          <a
            href="https://www.facebook.com/share/1Ad17DEC4B/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gray-800 rounded-full hover:bg-blue-600 transition shadow-lg"
            aria-label="Ir a Facebook"
          >
            <FaFacebook className="text-3xl text-white" />
          </a>

          {/* Botón Instagram */}
          <a
            href="https://www.instagram.com/softwaredatta?igsh=MW9zYTFrcGlqM2RmOQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gray-800 rounded-full hover:bg-pink-600 transition shadow-lg"
            aria-label="Ir a Instagram"
          >
            <FaInstagram className="text-3xl text-white" />
          </a>
        </div>
      </section>

      {/* Llamado a la acción */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center select-none">
          <motion.h3
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl font-semibold mb-4"
          >
            ¿Listo para transformar la calidad en tu planta?
          </motion.h3>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-gray-400 mb-8 leading-relaxed"
          >
            Únete a la industria 4.0 con Lumet Inspection, la herramienta que combina visión computacional y AI para optimizar procesos y reducir defectos.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.07 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => navigate("/Login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full text-lg shadow-xl transition focus:outline-none focus:ring-4 focus:ring-blue-500"
            aria-label="Empieza tu demo ahora"
          >
            Empieza ahora
          </motion.button>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 py-6 px-6 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Lumet Inspection. Todos los derechos reservados.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Desarrollado por <a href="https://67ae33c7a3854.site123.me/" className="text-blue-500 hover:underline">Software Data</a>
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
