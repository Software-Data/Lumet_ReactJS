import React from "react";
import imagenLogo from '../assets/Logo.png';
import { useNavigate } from "react-router-dom";

export default function TermsOfService({
  lastUpdated = "15 de agosto de 2025",
  companyName = "Lumet Inspection",
  contactEmail = "legal@lumet-inspection.com",
  country = "México",
  cityState = "Ciudad de México",
}) {
  const sections = [
    { id: "intro", title: "Introducción" },
    { id: "objeto", title: "1. Objeto del Servicio" },
    { id: "elegibilidad", title: "2. Elegibilidad y Registro" },
    { id: "licencia", title: "3. Licencia Limitada" },
    { id: "contenido", title: "4. Contenido Generado" },
    { id: "privacidad", title: "5. Privacidad y Protección de Datos" },
    { id: "conducta", title: "6. Conductas Prohibidas" },
    { id: "pagos", title: "7. Pagos y Facturación (si aplica)" },
    { id: "exclusion", title: "8. Exclusión de Garantías" },
    { id: "limitacion", title: "9. Limitación de Responsabilidad" },
    { id: "modificaciones", title: "10. Modificaciones y Actualizaciones" },
    { id: "suspension", title: "11. Suspensión y Terminación" },
    { id: "ley", title: "12. Ley Aplicable y Resolución de Disputas" },
    { id: "finales", title: "13. Disposiciones Finales" },
    { id: "contacto", title: "14. Contacto" },
  ];
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:py-16">
      <header className="mb-8 border-b pb-6">
        <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-3 mb-8">
                <img src={imagenLogo} alt="Lumet Logo" className="w-12 h-12 rounded-xl" />
                <span className="text-2xl font-bold text-blue-500 select-none">Lumet Inspection</span>
            </div>
            
            <button
            onClick={() => navigate("/")}
            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
        >
            Volver
        </button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-100">Términos de Servicio</h1>
        <p className="mt-2 text-sm text-gray-600">Última actualización: 15 de agosto del 2025</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-6 h-fit rounded-2xl border bg-white/50 p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider">Índice</p>
          <nav className="space-y-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="prose prose-gray max-w-none">
          {/* Aquí irían todas las secciones de términos como en el código original */}
          <section id="intro">
            <p className="text-gray-400 mb-6">
              Estos Términos de Servicio ("Términos") constituyen un acuerdo legal entre usted ("Usuario") y {companyName}
              ("nosotros", "nuestro" o "la Compañía"), y regulan el acceso y uso del sistema de control de calidad para
              el acabado de pintura automotriz mediante inteligencia artificial, así como de cualquier servicio, contenido,
              software o funcionalidades relacionadas (conjuntamente, el "Servicio"). Al acceder o utilizar el Servicio,
              usted acepta estos Términos y nuestra Política de Privacidad. Si no está de acuerdo, no utilice el Servicio.
            </p>
          </section>

          <section id="objeto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">1. Objeto del Servicio</h2>
            <p className="text-gray-400 mb-6">
              {companyName} es una plataforma digital que utiliza inteligencia artificial para analizar imágenes de carrocerías
              automotrices con el fin de detectar imperfecciones en el acabado de pintura y generar reportes. El Servicio incluye:
            </p>
            <ul className="text-gray-400 mb-6">
              <li>Análisis de imágenes cargadas por el Usuario.</li>
              <li>Generación de reportes que incorporan la imagen original y la imagen procesada con señalización de imperfecciones, junto con detalles técnicos.</li>
              <li>Visualización de métricas y gráficos relacionados con usuarios, carrocerías e imperfecciones.</li>
            </ul>
            <p className="text-gray-400 mb-6">
              El Servicio está destinado a uso profesional o corporativo en el sector automotriz, salvo acuerdo expreso en contrario.
            </p>
          </section>

          <section id="elegibilidad">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">2. Elegibilidad y Registro</h2>
            <ul className="text-gray-400 mb-6">
              <li><strong>Acceso actual:</strong> En la etapa actual, solo administradores autorizados pueden crear cuentas de Usuario.</li>
              <li><strong>Acceso futuro:</strong> Se podrá habilitar el registro directo de usuarios, sujeto a verificación y aprobación.</li>
              <li><strong>Responsabilidad de la cuenta:</strong> Usted es responsable de mantener la seguridad de sus credenciales y de las actividades bajo su cuenta.</li>
              <li><strong>Información veraz:</strong> Usted declara que la información proporcionada es precisa, completa y actualizada.</li>
            </ul>
          </section>

          <section id="licencia">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">3. Licencia Limitada</h2>
            <p className="text-gray-400 mb-6">
              Sujeto al cumplimiento de estos Términos, le otorgamos una licencia limitada, no exclusiva, intransferible y revocable para
              acceder y utilizar el Servicio con fines autorizados y legítimos vinculados al control de calidad automotriz.
            </p>
            <p className="mt-3 text-gray-400 mb-6">Usted <strong>no</strong> podrá:</p>
            <ul className="text-gray-400 mb-6">
              <li>Copiar, modificar, distribuir, vender, arrendar o sublicenciar partes del Servicio.</li>
              <li>Realizar ingeniería inversa, descompilar o intentar extraer el código fuente, salvo lo permitido por la ley.</li>
              <li>Usar el Servicio para desarrollar un producto o servicio competidor.</li>
            </ul>
          </section>

          <section id="contenido">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">4. Contenido Generado</h2>
            <ul className="text-gray-400 mb-6">
              <li><strong>Propiedad del Usuario:</strong> Usted conserva la titularidad de las imágenes que cargue.</li>
              <li><strong>Licencia de uso a la Compañía:</strong> Usted concede a {companyName} una licencia mundial, no exclusiva y libre de regalías para procesar, almacenar y utilizar dichas imágenes exclusivamente para operar, mantener y mejorar el Servicio.</li>
              <li><strong>Propiedad de la Compañía:</strong> El software, modelos de IA, algoritmos, interfaces, bases de datos y materiales asociados son propiedad exclusiva de {companyName} o sus licenciantes.</li>
            </ul>
          </section>

          <section id="privacidad">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">5. Privacidad y Protección de Datos</h2>
            <p className="text-gray-400 mb-6">
              Recopilamos y tratamos datos personales y operativos necesarios para el funcionamiento del Servicio. Los datos sensibles se almacenan
              cifrados y se protegen con estándares de seguridad de la industria. El tratamiento de datos se rige por nuestra Política de Privacidad,
              la cual forma parte de estos Términos.
            </p>
          </section>

          <section id="conducta">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">6. Conductas Prohibidas</h2>
            <ul className="text-gray-400 mb-6">
              <li>Subir o compartir contenido ilegal, difamatorio, obsceno o que infrinja derechos de terceros.</li>
              <li>Interferir con el funcionamiento del Servicio o eludir medidas de seguridad.</li>
              <li>Acceder sin autorización a cuentas, sistemas o datos.</li>
              <li>Utilizar el Servicio con fines de fraude, suplantación o competencia desleal.</li>
            </ul>
          </section>

          <section id="pagos">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">7. Pagos y Facturación (si aplica)</h2>
            <p className="text-gray-400 mb-6">
              En caso de habilitarse funciones de pago, {companyName} publicará las tarifas y términos aplicables con antelación razonable. Usted será responsable
              de los cargos asociados a su cuenta. Los pagos podrán procesarse a través de proveedores externos y estarán sujetos a sus términos.
            </p>
          </section>

          <section id="exclusion">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">8. Exclusión de Garantías</h2>
            <p className="text-gray-400 mb-6">
              El Servicio se proporciona "tal cual" y "según disponibilidad". {companyName} no garantiza que el análisis de IA sea libre de errores ni que el Servicio
              esté disponible de forma ininterrumpida o exento de vulnerabilidades. Usted asume el riesgo derivado del uso del Servicio.
            </p>
          </section>

          <section id="limitacion">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">9. Limitación de Responsabilidad</h2>
            <p className="text-gray-400 mb-6">
              En la máxima medida permitida por la ley, {companyName} no será responsable de daños indirectos, incidentales, especiales, consecuenciales ni de pérdida
              de beneficios. La responsabilidad total de {companyName} por cualquier reclamación relacionada con el Servicio no excederá el monto que usted haya pagado
              por el Servicio en los 12 meses previos a la reclamación (o $0 si no ha pagado).
            </p>
          </section>

          <section id="modificaciones">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">10. Modificaciones y Actualizaciones</h2>
            <p className="text-gray-400 mb-6">
              {companyName} puede modificar estos Términos y/o el Servicio en cualquier momento. Cuando se realicen cambios sustanciales, se notificará a través del
              propio Servicio o por correo electrónico. El uso continuado del Servicio tras la notificación implica la aceptación de los cambios.
            </p>
          </section>

          <section id="suspension">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">11. Suspensión y Terminación</h2>
            <p className="text-gray-400 mb-6">
              {companyName} podrá suspender o cancelar su cuenta y acceso al Servicio en caso de incumplimiento de estos Términos, uso indebido o por requerimiento legal.
              La terminación no limita el derecho de {companyName} a reclamar daños ni el ejercicio de otras acciones legales disponibles.
            </p>
          </section>

          <section id="ley">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">12. Ley Aplicable y Resolución de Disputas</h2>
            <p className="text-gray-400 mb-6">
              Estos Términos se regirán por las leyes de {country}, sin perjuicio de sus normas sobre conflicto de leyes. Cualquier disputa se someterá a los tribunales
              competentes de {cityState}.
            </p>
          </section>

          <section id="finales">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">13. Disposiciones Finales</h2>
            <ul className="text-gray-400 mb-6">
              <li><strong>Fuerza mayor:</strong> Ninguna parte será responsable por incumplimientos debidos a eventos fuera de su control razonable.</li>
              <li><strong>Cesión:</strong> Usted no puede ceder sus derechos u obligaciones bajo estos Términos sin consentimiento previo y por escrito de {companyName}.</li>
              <li><strong>Divisibilidad:</strong> Si alguna disposición es considerada inválida, el resto permanecerá vigente.</li>
              <li><strong>Acuerdo completo:</strong> Estos Términos constituyen el acuerdo íntegro entre las partes respecto del Servicio.</li>
              <li><strong>Renuncia:</strong> La falta de exigencia del cumplimiento de una cláusula no constituye renuncia a derechos.</li>
            </ul>
          </section>

          <section id="contacto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-tight text-gray-200">14. Contacto</h2>
            <p className="text-gray-400 mb-6">
              Si tiene preguntas o comentarios sobre estos Términos, contáctenos en <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
