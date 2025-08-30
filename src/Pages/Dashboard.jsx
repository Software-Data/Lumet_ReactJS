import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from '../components/layout/layout.jsx';
import { reportesService, usuariosService, carroceriasService, severidadesService, imperfeccionesService, rolesService, kpisService } from "../api/api";
import { FileText, Users, Car, AlertCircle, Plus, DnaIcon, ZapIcon, CalendarIcon, TrendingUp, TrendingDown, Minus, Target, CheckCircle, XCircle, BarChart3, Activity } from "lucide-react";

// Imports para las nuevas funcionalidades
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Registrar los componentes de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  // Estado para el rango de fechas. Inicia con los últimos 30 días.
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());

  // Estados para los datos filtrados y de las gráficas
  const [stats, setStats] = useState({ reportes: 0, usuarios: 0, carrocerias: 0, imperfecciones: 0, severidades: 0, roles: 0 });
  const [recentReportes, setRecentReportes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para los KPIs de calidad
  const [kpiHoy, setKpiHoy] = useState(null);
  const [kpiSemana, setKpiSemana] = useState(null);
  const [tendencias, setTendencias] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [kpisError, setKpisError] = useState(null);

  // useEffect se ejecutará cada vez que cambie el rango de fechas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtenemos todos los datos una vez
        const [reportesRes, usuariosRes, carroceriasRes, imperfeccionesRes, rolesRes, severidadesRes] = await Promise.all([
          reportesService.getAll(),
          usuariosService.getAll(),
          carroceriasService.getAll(),
          imperfeccionesService.getAll(),
          rolesService.getAll(),
          severidadesService.getAll(),
        ]);

        // --- Filtrado de datos según el rango de fechas ---
        const filterByDate = (item) => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= startDate && itemDate <= endDate;
        };

        const filteredReportes = reportesRes.data.filter(filterByDate);
        const filteredUsuarios = usuariosRes.data.filter(filterByDate);
        const filteredCarrocerias = reportesRes.data.filter(filterByDate);

        // Actualizamos las tarjetas de estadísticas con los datos filtrados
        setStats({
          reportes: reportesRes.data.length,
          usuarios: usuariosRes.data.length,
          carrocerias: carroceriasRes.data.length,
          // Estos no suelen tener fecha de creación, así que mostramos el total
          imperfecciones: imperfeccionesRes.data.length,
          roles: rolesRes.data.length,
          severidades: severidadesRes.data.length,
        });
        
        // Actualizamos los reportes recientes (estos no se filtran por fecha)
        const sortedReportes = [...reportesRes.data]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentReportes(sortedReportes);

      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]); // Dependencias: el efecto se re-ejecuta si las fechas cambian

  // Cargar KPIs de calidad
  useEffect(() => {
    const fetchKPIs = async () => {
      setKpisLoading(true);
      setKpisError(null);
      try {
        const [hoyRes, semanaRes, tendenciasRes] = await Promise.all([
          kpisService.getCalidadHoy(),
          kpisService.getCalidadSemana(),
          kpisService.getTendencias(30)
        ]);

        setKpiHoy(hoyRes.data?.data);
        setKpiSemana(semanaRes.data?.data);
        setTendencias(tendenciasRes.data?.data);
      } catch (error) {
        console.error("Error al cargar KPIs:", error);
        setKpisError("No se pudieron cargar los KPIs de calidad. Verifica que el backend esté funcionando.");
      } finally {
        setKpisLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  const StatCard = ({ title, value, icon, color, linkTo, subtitle = null }) => (
    <Link to={linkTo} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} text-white mr-4`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </Link>
  );

  const KPICard = ({ title, value, subtitle, icon, color, trend = null }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${color} text-white`}>{icon}</div>
        {trend && (
          <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : 
             trend === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : 
             <Minus className="h-4 w-4 mr-1" />}
            {trend === 'up' ? 'Mejorando' : trend === 'down' ? 'Bajando' : 'Estable'}
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </div>
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        labels: { color: '#9ca3af' }
      },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#9ca3af', stepSize: 1 },
        grid: { color: '#374151' }
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  if (loading || kpisLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  // Preparar datos para las gráficas solo si existen los KPIs
  const calidadSemanaData = kpiSemana ? {
    labels: kpiSemana.kpis_por_dia.map(kpi => format(new Date(kpi.fecha), 'dd/MM', { locale: es })),
    datasets: [
      {
        label: 'Calidad (%)',
        data: kpiSemana.kpis_por_dia.map(kpi => kpi.porcentaje_calidad),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Carrocerías',
        data: kpiSemana.kpis_por_dia.map(kpi => kpi.total_carrocerias),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  } : null;

  const tendenciasData = tendencias ? {
    labels: tendencias.tendencias.slice(-15).map(t => format(new Date(t.fecha), 'dd/MM', { locale: es })),
    datasets: [
      {
        label: 'Volumen de Trabajo',
        data: tendencias.tendencias.slice(-15).map(t => t.total_carrocerias),
        backgroundColor: tendencias.tendencias.slice(-15).map(t => 
          t.tendencia === 'Subiendo' ? 'rgba(16, 185, 129, 0.8)' :
          t.tendencia === 'Bajando' ? 'rgba(239, 68, 68, 0.8)' :
          'rgba(156, 163, 175, 0.8)'
        ),
        borderColor: tendencias.tendencias.slice(-15).map(t => 
          t.tendencia === 'Subiendo' ? '#10b981' :
          t.tendencia === 'Bajando' ? '#ef4444' :
          '#9ca3af'
        ),
        borderWidth: 2
      }
    ]
  } : null;

  const calidadDoughnutData = kpiHoy ? {
    labels: ['Sin Imperfecciones', 'Con Imperfecciones'],
    datasets: [
      {
        data: [
          kpiHoy.resumen.carrocerias_sin_imperfecciones,
          kpiHoy.resumen.carrocerias_con_imperfecciones
        ],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: ['#059669', '#dc2626'],
        borderWidth: 2
      }
    ]
  } : null;

  return (
    <Layout>
      {/* Encabezado con título y selector de fechas */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-b-emerald-800 h-20 px-6 bg-gray-800 mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">Dashboard de Calidad</h1>
      </div>

      {/* KPIs de Calidad del Día */}
      {kpiHoy ? (
        <div className="mb-8 mx-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Target className="h-6 w-6 mr-2 text-emerald-400" />
            Indicadores de calidad
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <KPICard
              title="Score de Calidad"
              value={`${kpiHoy.metricas.score_calidad}%`}
              subtitle={kpiHoy.interpretacion.nivel_calidad}
              icon={<Activity className="h-6 w-6" />}
              color="bg-emerald-600"
              trend={kpiHoy.metricas.score_calidad > 85 ? 'up' : kpiHoy.metricas.score_calidad < 70 ? 'down' : null}
            />
            
            <KPICard
              title="Calidad General"
              value={`${kpiHoy.porcentajes.calidad_general}%`}
              subtitle={`${kpiHoy.resumen.carrocerias_sin_imperfecciones} de ${kpiHoy.resumen.total_carrocerias}`}
              icon={<CheckCircle className="h-6 w-6" />}
              color="bg-blue-600"
            />
            
            <KPICard
              title="Carrocerías con imperfecciones"
              value={kpiHoy.resumen.carrocerias_con_imperfecciones}
              subtitle={`${kpiHoy.resumen.carrocerias_con_imperfecciones} de ${kpiHoy.resumen.total_carrocerias}`}
              icon={<XCircle className="h-6 w-6" />}
              color="bg-red-600"
            />
            
            <KPICard
              title="Imperfecciones por carrocería"
              value={`${kpiHoy.metricas.imperfecciones_por_carroceria}`}
              subtitle={`Meta: 1.0`}
              icon={<BarChart3 className="h-6 w-6" />}
              color="bg-purple-600"
            />
          </div>
        </div>
      ) : kpisError ? (
        <div className="mb-8 mx-6">
          <div className="bg-red-900/50 border border-red-500 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center">
              <XCircle className="h-6 w-6 mr-2" />
              Error al Cargar KPIs
            </h2>
            <p className="text-red-300 mb-4">{kpisError}</p>
            <div className="text-sm text-red-400">
              <p>• Verifica que el backend esté funcionando</p>
              <p>• Confirma que los endpoints de KPIs estén implementados:</p>
              <ul className="ml-4 mt-2 space-y-1">
                <li>• <code className="bg-red-800 px-2 py-1 rounded">GET /kpis/calidad-dia</code></li>
                <li>• <code className="bg-red-800 px-2 py-1 rounded">GET /kpis/calidad-semana</code></li>
                <li>• <code className="bg-red-800 px-2 py-1 rounded">GET /kpis/tendencias</code></li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {/* Tarjetas de Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6 mx-6">
        <StatCard title="Reportes" value={stats.reportes} icon={<FileText size={24} />} color="bg-blue-600" linkTo="/reportes" />
        <StatCard title="Usuarios" value={stats.usuarios} icon={<Users size={24} />} color="bg-emerald-600" linkTo="/usuarios" />
        <StatCard title="Carrocerías" value={stats.carrocerias} icon={<Car size={24} />} color="bg-amber-600" linkTo="/carrocerias" />
        <StatCard title="Severidades" value={stats.severidades} icon={<ZapIcon size={24} />} color="bg-sky-600" linkTo="/severidades" />
        <StatCard title="Imperfecciones" value={stats.imperfecciones} icon={<DnaIcon size={24} />} color="bg-red-600" linkTo="/imperfecciones" />
        <StatCard title="Roles" value={stats.roles} icon={<Plus size={24} />} color="bg-purple-600" linkTo="/roles" />
      </div>

      {/* Sección principal con Gráficas y Reportes Recientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-6 mb-6">
  {/* Columna de Gráficas (ocupa 2/3 en pantallas grandes) */}
  <div className="md:col-span-2 space-y-6">
    {/* Gráfico de Calidad Semanal */}
    <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-[1.02]">
      <h2 className="text-lg md:text-xl font-bold text-emerald-400 mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2" />
        Evolución de Calidad - Última Semana
      </h2>
      <div className="h-72 md:h-80">
        {calidadSemanaData ? (
          <Line
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: { duration: 800, easing: "easeOutQuart" },
              interaction: { mode: "index", intersect: false },
              plugins: {
                tooltip: {
                  backgroundColor: "#1f2937",
                  titleColor: "#fff",
                  bodyColor: "#d1d5db",
                  borderColor: "#10b981",
                  borderWidth: 1,
                  padding: 12,
                },
                legend: { labels: { color: "#9ca3af" } },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: { color: "#9ca3af" },
                  grid: { color: "#374151" },
                },
                x: {
                  ticks: { color: "#9ca3af" },
                  grid: { color: "#374151" },
                },
              },
            }}
            data={{
              ...calidadSemanaData,
              datasets: calidadSemanaData.datasets.map((ds) => ({
                ...ds,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: "#10b981",
              })),
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <BarChart3 className="h-16 w-16 text-gray-600" />
            <p className="ml-4 text-center">No hay datos disponibles</p>
          </div>
        )}
      </div>
    </div>

    {/* Gráfico de Tendencias */}
    <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-[1.02]">
      <h2 className="text-lg md:text-xl font-bold text-emerald-400 mb-4 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2" />
        Tendencias de Volumen - Últimos 15 Días
      </h2>
      <div className="h-72 md:h-80">
        {tendenciasData ? (
          <Bar
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: { duration: 1000, easing: "easeOutBounce" },
              plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: "#1f2937", bodyColor: "#d1d5db" },
              },
              scales: {
                y: { ticks: { color: "#9ca3af" }, grid: { color: "#374151" } },
                x: { ticks: { color: "#9ca3af" }, grid: { display: false } },
              },
            }}
            data={{
              ...tendenciasData,
              datasets: tendenciasData.datasets.map((ds) => ({
                ...ds,
                borderRadius: 6,
                hoverBackgroundColor: "#10b981",
              })),
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <TrendingUp className="h-16 w-16 text-gray-600" />
            <p className="ml-4">No hay datos de tendencias</p>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Columna de Reportes Recientes y Gráfico Doughnut */}
  <div className="space-y-6">
    {/* Doughnut */}
    <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-[1.02]">
      <h2 className="text-lg md:text-xl font-bold text-emerald-400 mb-4 flex items-center">
        <Target className="h-5 w-5 mr-2" />
        Distribución de Calidad
      </h2>
      <div className="h-56 md:h-64">
        {calidadDoughnutData ? (
          <Doughnut
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: "65%",
              plugins: {
                legend: {
                  display: true,
                  position: "bottom",
                  labels: { color: "#9ca3af" },
                },
              },
            }}
            data={calidadDoughnutData}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Target className="h-16 w-16 text-gray-600" />
            <p className="ml-4">No hay datos</p>
          </div>
        )}
      </div>
    </div>

    {/* Reportes Recientes */}
    <div className="bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
      <h2 className="text-lg md:text-xl font-bold text-emerald-400 mb-4">Reportes Recientes</h2>
      <div className="space-y-4">
        {recentReportes.length > 0 ? (
          recentReportes.map((reporte) => (
            <Link
              key={reporte.id}
              to={`/reportes/${reporte.id}`}
              className="block hover:bg-gray-800 p-3 rounded-lg transition-colors duration-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white">Reporte #{reporte.id}</p>
                  <p className="text-sm text-gray-400">VIN: {reporte.vin}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(reporte.createdAt), "dd MMM yyyy", { locale: es })}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-400 text-center py-8">No hay reportes recientes.</p>
        )}
      </div>
    </div>
  </div>
</div>

    </Layout>
  );
}

export default Dashboard;