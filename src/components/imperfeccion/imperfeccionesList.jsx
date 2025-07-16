import { useState, useEffect, useRef } from "react"
import {  imperfeccionesService } from "../../api/api"
import CrudList from "../common/CrudList"

function ImperfeccionesList() {
  const [imperfecciones, setImperfecciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("") 

  let imperfeccionesRef = useRef([]) 

useEffect(() => {
  const fetchData = async () => {
    try {
      const [imperfeccionesRes] = await Promise.all([
        imperfeccionesService.getAll(),
      ]);

      setImperfecciones(imperfeccionesRes.data);

    } catch (error) {
      console.error("Error al cargar los datos:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []); 

  

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar esta reporte?")) {
      try {
        await imperfeccionesService.delete(id)
        setUsuarios(roles.filter((rol) => rol.id !== id))
      } catch (error) {
        console.error("Error al eliminar la reporte:", error)
        setError("Error al eliminar la severtidad. Intente nuevamente.")
      }
    }
  }

  const columns = [
    { key: "id", header: "ID" },
    //{ key: "nombre", header: "Nombre" },
    { key: "id_severidad", header: "id_severidad" },
    { key: "id_usuario", header: "id_usuario" },
  ]
  

  return (
    <CrudList
      title="Imperfecciones"
      items={imperfecciones}
      columns={columns}
      loading={loading}
      error={error}
      basePath="imperfecciones"
      onDelete={handleDelete}
      searchFields={["id", "descripcion"]}
    />
  )
}

export default ImperfeccionesList

