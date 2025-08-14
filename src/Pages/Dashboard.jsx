import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from '../components/layout/layout.jsx';
import { reportesService, usuariosService, carroceriasService, severidadesService, imperfeccionesService, rolesService } from "../api/api";
import { FileText, Users, Car, AlertCircle, Plus, DnaIcon, ZapIcon, CalendarIcon } from "lucide-react";

// Imports para las nuevas funcionalidades
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Registrar los componentes de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  // Estado para el rango de fechas. Inicia con los últimos 30 días.
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());

  // Estados para los datos filtrados y de las gráficas
  const [stats, setStats] = useState({ reportes: 0, usuarios: 0, carrocerias: 0, imperfecciones: 0, severidades: 0, roles: 0 });
  const [recentReportes, setRecentReportes] = useState([]);
  const [userChartData, setUserChartData] = useState({ labels: [], datasets: [] });
  const [carroceriaChartData, setCarroceriaChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

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
        const filteredCarrocerias = carroceriasRes.data.filter(filterByDate);

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
        
        console.log(filteredUsuarios);
        // --- Procesamiento de datos para las gráficas ---
        const processDataForChart = (data, label) => {
          const monthlyCounts = {};
          data.forEach(item => {
            const month = format(new Date(item.createdAt), 'yyyy-MM');
            monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
          });

          const sortedMonths = Object.keys(monthlyCounts).sort();
          const labels = sortedMonths.map(month => format(new Date(month), 'MMMM yyyy', { locale: es }));
          const counts = sortedMonths.map(month => monthlyCounts[month]);

          return {
            labels,
            datasets: [{
              label,
              data: counts,
              backgroundColor: 'rgba(34, 211, 238, 0.6)', // Un color cian/azul
              borderColor: 'rgba(34, 211, 238, 1)',
              borderWidth: 1,
            }],
          };
        };
        
        setUserChartData(processDataForChart(filteredUsuarios, 'Usuarios Registrados'));
        setCarroceriaChartData(processDataForChart(filteredCarrocerias, 'Carrocerías Creadas'));

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

  const StatCard = ({ title, value, icon, color, linkTo }) => (
    <Link to={linkTo} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} text-white mr-4`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Link>
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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


  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Encabezado con título y selector de fechas */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-b-emerald-800 h-20 px-6 bg-gray-800 mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">Dashboard General</h1>
        <div className="flex items-center gap-4 bg-gray-800 p-2 rounded-lg">
           <CalendarIcon className="h-5 w-5 text-emerald-400"/>
           <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="bg-gray-700 text-white p-2 rounded w-32 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              dateFormat="dd/MM/yyyy"
            />
            <span className="text-gray-400">-</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="bg-gray-700 text-white p-2 rounded w-32 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              dateFormat="dd/MM/yyyy"
            />
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6 mx-6">
        <StatCard title="Reportes" value={stats.reportes} icon={<FileText size={24} />} color="bg-blue-600" linkTo="/reportes" />
        <StatCard title="Usuarios" value={stats.usuarios} icon={<Users size={24} />} color="bg-emerald-600" linkTo="/usuarios" />
        <StatCard title="Carrocerías" value={stats.carrocerias} icon={<Car size={24} />} color="bg-amber-600" linkTo="/carrocerias" />
        <StatCard title="Severidades" value={stats.severidades} icon={<ZapIcon size={24} />} color="bg-sky-600" linkTo="/severidades" />
        <StatCard title="Imperfecciones" value={stats.imperfecciones} icon={<DnaIcon size={24} />} color="bg-red-600" linkTo="/imperfecciones" />
        <StatCard title="Roles" value={stats.roles} icon={<Plus size={24} />} color="bg-purple-600" linkTo="/roles" />
      </div>

      {/* Sección principal con Gráficas y Reportes Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-6">
        {/* Columna de Gráficas (ocupa 2/3 del espacio en pantallas grandes) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold text-emerald-400 mb-4">Usuarios Registrados por Mes</h2>
                <div className="h-64">
                    <Bar options={chartOptions} data={userChartData} />
                </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold text-emerald-400 mb-4">Carrocerías Creadas por Mes</h2>
                <div className="h-64">
                    <Bar options={chartOptions} data={carroceriaChartData} />
                </div>
            </div>
        </div>
        
        {/* Columna de Reportes Recientes (ocupa 1/3 del espacio) */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-emerald-400 mb-4">Reportes Recientes</h2>
          <div className="space-y-4">
            {recentReportes.length > 0 ? (
              recentReportes.map((reporte) => (
                <Link key={reporte.id} to={`/reportes/${reporte.id}`} className="block hover:bg-gray-700 p-3 rounded-lg transition-colors duration-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">Reporte #{reporte.id}</p>
                      <p className="text-sm text-gray-400">VIN: {reporte.vin}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(reporte.createdAt), 'dd MMM yyyy', { locale: es })}
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
    </Layout>
  );
}

export default Dashboard;