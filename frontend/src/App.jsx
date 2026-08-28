import { useEffect, useState } from "react";
import { supabase } from "./supabase";

function App() {

  const [empleados, setEmpleados] = useState([]);
const [servicios, setServicios] = useState([]);
const [consumos, setConsumos] = useState([]);
  useEffect(() => {

    supabase
    .from("empleado")
    .select("*")
    .then(({data,error})=>{

      if(error){
        console.log(error);
      }else{
        console.log(data);
        setEmpleados(data);
      }
supabase
.from("servicio")
.select("*")
.then(({data,error})=>{
    if(error){
        console.log(error);
    }else{
        console.log(data);
        setServicios(data);
    }
});
    });
supabase
.from("consumo_servicios")
.select("*")
.then(({data,error})=>{
    console.log("CONSUMOS:", data);
    console.log("ERROR:", error);

    if(data){
        setConsumos(data);
    }
});
  }, []);


  return (
  <div>

    <h1>Sistema Hotel</h1>

    

        <table>
<thead>
<tr>
<th>ID</th>
<th>Nombre</th>
<th>Cargo</th>
<th>Teléfono</th>
<th>Ingreso</th>
</tr>
</thead>
<tbody>
{empleados.map((empleado)=>(
<tr key={empleado.id}>
<td>{empleado.id}</td>
<td>{empleado.nombre}</td>
<td>{empleado.cargo}</td>
<td>{empleado.telefono}</td>
<td>{empleado.fecha_ingreso}</td>
</tr>
))}
</tbody>
</table>


   <h2>Servicios</h2>

<table>
<thead>
<tr>
<th>ID</th>
<th>Nombre</th>
<th>Precio</th>
</tr>
</thead>

<tbody>

{servicios.map((servicio)=>(
<tr key={servicio.id}>
<td>{servicio.id}</td>
<td>{servicio.nombre}</td>
<td>{servicio.precio}</td>
</tr>
))}

</tbody>
</table>

<h2>Consumo de Servicios</h2>

<table>
<thead>
<tr>
<th>ID</th>
<th>Empleado</th>
<th>Servicio</th>
<th>Fecha</th>
<th>Cantidad</th>
</tr>
</thead>

<tbody>

{consumos.map((consumo)=>(
<tr key={consumo.id}>
<td>{consumo.id}</td>
<td>
{
empleados.find(
(e)=>e.id === consumo.empleado_id
)?.nombre
}
</td>

<td>
{
servicios.find(
(s)=>s.id === consumo.servicio_id
)?.nombre
}
</td>
<td>{consumo.fecha}</td>
<td>{consumo.cantidad}</td>
</tr>
))}

</tbody>

</table>
      
      

       </div>
  );
}

export default App;
