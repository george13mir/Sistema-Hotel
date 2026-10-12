
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";

function fechaHoy() {
  const d = new Date();
  const local = new Date(
    d.getTime() - d.getTimezoneOffset() * 60000
  );
  return local.toISOString().slice(0, 10);
}

const nuevoEmpleado = () => ({
  nombre: "",
  apellido: "",
  cargo: "",
  telefono: "",
  fecha_ingreso: fechaHoy(),
});

const nuevoServicio = () => ({
  nombre: "",
  descripcion: "",
  precio: "",
});

const nuevoConsumo = () => ({
  empleado: "",
  servicio: "",
  fecha: fechaHoy(),
  cantidad: 1,
});

const css = {
  pagina: {
    background: "#f1f5f9",
    minHeight: "100vh",
    padding: "25px 15px",
    fontFamily: "Arial, sans-serif",
    color: "#1e293b",
    textAlign: "left",
  },
  principal: {
    maxWidth: 1200,
    margin: "auto",
  },
  cabecera: {
    background: "#1e3a8a",
    color: "#ffffff",
    padding: 30,
    borderRadius: 12,
    textAlign: "center",
    marginBottom: 25,
  },
  tarjeta: {
    background: "#ffffff",
    padding: 24,
    borderRadius: 12,
    marginBottom: 25,
    boxShadow: "0 3px 12px #00000012",
  },
  formulario: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "end",
    marginBottom: 20,
  },
  grupo: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    flex: "1 1 155px",
    minWidth: 145,
  },
  campo: {
    background: "#ffffff",
    color: "#1e293b",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    padding: 11,
    width: "100%",
    boxSizing: "border-box",
    fontSize: 14,
  },
  boton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 6,
    padding: "11px 15px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  tabla: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: 14,
  },
  th: {
    background: "#eff6ff",
    color: "#1e40af",
    padding: 12,
    borderBottom: "2px solid #bfdbfe",
    textAlign: "left",
  },
  td: {
    padding: 12,
    borderBottom: "1px solid #e2e8f0",
  },
};

// COMPONENTES FUERA DE APP PARA NO PERDER EL FOCO

function Campo({
  titulo,
  valor,
  cambiar,
  tipo = "text",
  min,
  step,
}) {
  return (
    <label style={css.grupo}>
      <span>{titulo}</span>
      <input
        style={css.campo}
        type={tipo}
        value={valor}
        onChange={(e) => cambiar(e.target.value)}
        min={min}
        step={step}
        required
      />
    </label>
  );
}

function Tabla({ columnas, children }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={css.tabla}>
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c} style={css.th}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Acciones({ editar, borrar, deshabilitado }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        type="button"
        disabled={deshabilitado}
        style={{ ...css.boton, background: "#d97706" }}
        onClick={editar}
      >
        Editar
      </button>
      <button
        type="button"
        disabled={deshabilitado}
        style={{ ...css.boton, background: "#dc2626" }}
        onClick={borrar}
      >
        Eliminar
      </button>
    </div>
  );
}

function App() {
  const [empleados, setEmpleados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [consumos, setConsumos] = useState([]);

  const [empleado, setEmpleado] = useState(nuevoEmpleado);
  const [servicio, setServicio] = useState(nuevoServicio);
  const [consumo, setConsumo] = useState(nuevoConsumo);

  const [editEmpleado, setEditEmpleado] = useState(null);
  const [editServicio, setEditServicio] = useState(null);
  const [editConsumo, setEditConsumo] = useState(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  async function api(ruta, opciones = {}) {
    let respuesta;

    try {
      respuesta = await fetch(`${API}/${ruta}`, {
        ...opciones,
        headers: {
          "Content-Type": "application/json",
          ...opciones.headers,
        },
      });
    } catch {
      throw new Error(
        "No se pudo conectar con Django. Comprueba que esté encendido."
      );
    }

    const texto = await respuesta.text();
    let datos;

    try {
      datos = texto ? JSON.parse(texto) : null;
    } catch {
      datos = texto;
    }

    if (!respuesta.ok) {
      throw new Error(
        typeof datos === "object" && datos !== null
          ? JSON.stringify(datos)
          : datos || `Error HTTP ${respuesta.status}`
      );
    }

    return datos;
  }

  async function cargarDatos() {
    try {
      const [e, s, c] = await Promise.all([
        api("empleados/"),
        api("servicios/"),
        api("consumos/"),
      ]);

      setEmpleados(Array.isArray(e) ? e : e.results || []);
      setServicios(Array.isArray(s) ? s : s.results || []);
      setConsumos(Array.isArray(c) ? c : c.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function cambiar(setter, campo, valor) {
    setter((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function notificar(texto) {
    setError("");
    setMensaje(texto);
  }

  async function guardarEmpleado(e) {
    e.preventDefault();
    if (guardando) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      await api(
        editEmpleado
          ? `empleados/${editEmpleado}/`
          : "empleados/",
        {
          method: editEmpleado ? "PUT" : "POST",
          body: JSON.stringify(empleado),
        }
      );

      setEmpleado(nuevoEmpleado());
      setEditEmpleado(null);
      await cargarDatos();
      notificar("Empleado guardado correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarServicio(e) {
    e.preventDefault();
    if (guardando) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      await api(
        editServicio
          ? `servicios/${editServicio}/`
          : "servicios/",
        {
          method: editServicio ? "PUT" : "POST",
          body: JSON.stringify(servicio),
        }
      );

      setServicio(nuevoServicio());
      setEditServicio(null);
      await cargarDatos();
      notificar("Servicio guardado correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const servicioElegido = servicios.find(
    (s) => s.id === Number(consumo.servicio)
  );

  const cantidadValida =
    Number.isInteger(Number(consumo.cantidad)) &&
    Number(consumo.cantidad) > 0;

  const total =
    servicioElegido && cantidadValida
      ? Number(servicioElegido.precio) *
        Number(consumo.cantidad)
      : 0;

  async function guardarConsumo(e) {
    e.preventDefault();
    if (guardando) return;

    setError("");
    setMensaje("");

    if (
      !consumo.empleado ||
      !consumo.servicio ||
      !cantidadValida
    ) {
      setError("Selecciona empleado, servicio y cantidad válida.");
      return;
    }

    setGuardando(true);

    try {
      await api(
        editConsumo
          ? `consumos/${editConsumo}/`
          : "consumos/",
        {
          method: editConsumo ? "PUT" : "POST",
          body: JSON.stringify({
            empleado: Number(consumo.empleado),
            servicio: Number(consumo.servicio),
            fecha: consumo.fecha,
            cantidad: Number(consumo.cantidad),
            total: total.toFixed(2),
          }),
        }
      );

      setConsumo(nuevoConsumo());
      setEditConsumo(null);
      await cargarDatos();
      notificar("Consumo guardado correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  function editarEmpleado(e) {
    setEmpleado({
      nombre: e.nombre,
      apellido: e.apellido,
      cargo: e.cargo,
      telefono: e.telefono,
      fecha_ingreso: e.fecha_ingreso,
    });
    setEditEmpleado(e.id);
    setMensaje("");
  }

  function editarServicio(s) {
    setServicio({
      nombre: s.nombre,
      descripcion: s.descripcion,
      precio: s.precio,
    });
    setEditServicio(s.id);
    setMensaje("");
  }

  function editarConsumo(c) {
    setConsumo({
      empleado: String(c.empleado),
      servicio: String(c.servicio),
      fecha: c.fecha,
      cantidad: c.cantidad,
    });
    setEditConsumo(c.id);
    setMensaje("");
  }

  function cancelarEmpleado() {
    setEmpleado(nuevoEmpleado());
    setEditEmpleado(null);
  }

  function cancelarServicio() {
    setServicio(nuevoServicio());
    setEditServicio(null);
  }

  function cancelarConsumo() {
    setConsumo(nuevoConsumo());
    setEditConsumo(null);
  }

  async function eliminar(tipo, id) {
    if (guardando) return;

    setError("");
    setMensaje("");

    try {
      // Consultar consumos actuales antes de eliminar
      // empleados o servicios relacionados.
      if (tipo !== "consumos") {
        const respuesta = await api("consumos/");
        const actuales = Array.isArray(respuesta)
          ? respuesta
          : respuesta.results || [];

        const relacionados = actuales.some((c) =>
          tipo === "empleados"
            ? c.empleado === id
            : c.servicio === id
        );

        if (relacionados) {
          setError(
            "No se puede eliminar porque tiene consumos asociados. Elimina primero los consumos correspondientes."
          );
          return;
        }
      }

      if (!window.confirm("¿Eliminar este registro definitivamente?")) {
        return;
      }

      setGuardando(true);
      await api(`${tipo}/${id}/`, { method: "DELETE" });

      if (tipo === "empleados") cancelarEmpleado();
      if (tipo === "servicios") cancelarServicio();
      if (tipo === "consumos") cancelarConsumo();

      await cargarDatos();
      notificar("Registro eliminado correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={css.pagina}>
      <main style={css.principal}>
        <header style={css.cabecera}>
          <h1 style={{
            color: "#ffffff",
            fontSize: 36,
            lineHeight: 1.2,
            margin: "0 0 12px",
          }}>
            Sistema Hotelero
          </h1>
          <p style={{
            color: "#ffffff",
            margin: 0,
            fontSize: 16,
          }}>
            Administración de empleados, servicios y consumos
          </p>
        </header>

        {error && (
          <p style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: 14,
            borderRadius: 8,
            overflowWrap: "anywhere",
          }}>
            {error}
          </p>
        )}

        {mensaje && (
          <p style={{
            background: "#dcfce7",
            color: "#166534",
            padding: 14,
            borderRadius: 8,
          }}>
            {mensaje}
          </p>
        )}

        {cargando && <p>Cargando información...</p>}

        {/* EMPLEADOS */}

        <section style={css.tarjeta}>
          <h2>Gestión de empleados</h2>

          <form style={css.formulario} onSubmit={guardarEmpleado}>
            <Campo
              titulo="Nombre"
              valor={empleado.nombre}
              cambiar={(v) => cambiar(setEmpleado, "nombre", v)}
            />
            <Campo
              titulo="Apellido"
              valor={empleado.apellido}
              cambiar={(v) => cambiar(setEmpleado, "apellido", v)}
            />
            <Campo
              titulo="Cargo"
              valor={empleado.cargo}
              cambiar={(v) => cambiar(setEmpleado, "cargo", v)}
            />
            <Campo
              titulo="Teléfono"
              valor={empleado.telefono}
              cambiar={(v) => cambiar(setEmpleado, "telefono", v)}
            />
            <Campo
              titulo="Fecha de ingreso"
              tipo="date"
              valor={empleado.fecha_ingreso}
              cambiar={(v) =>
                cambiar(setEmpleado, "fecha_ingreso", v)
              }
            />

            <button
              style={css.boton}
              type="submit"
              disabled={guardando}
            >
              {editEmpleado ? "Actualizar empleado" : "Agregar empleado"}
            </button>

            {editEmpleado && (
              <button
                type="button"
                style={{ ...css.boton, background: "#64748b" }}
                onClick={cancelarEmpleado}
              >
                Cancelar
              </button>
            )}
          </form>

          <Tabla columnas={[
            "ID", "Nombre", "Apellido", "Cargo",
            "Teléfono", "Ingreso", "Acciones",
          ]}>
            {empleados.map((e) => (
              <tr key={e.id}>
                <td style={css.td}>{e.id}</td>
                <td style={css.td}>{e.nombre}</td>
                <td style={css.td}>{e.apellido}</td>
                <td style={css.td}>{e.cargo}</td>
                <td style={css.td}>{e.telefono}</td>
                <td style={css.td}>{e.fecha_ingreso}</td>
                <td style={css.td}>
                  <Acciones
                    deshabilitado={guardando}
                    editar={() => editarEmpleado(e)}
                    borrar={() => eliminar("empleados", e.id)}
                  />
                </td>
              </tr>
            ))}
          </Tabla>
        </section>

        {/* SERVICIOS */}

        <section style={css.tarjeta}>
          <h2>Gestión de servicios</h2>

          <form style={css.formulario} onSubmit={guardarServicio}>
            <Campo
              titulo="Nombre del servicio"
              valor={servicio.nombre}
              cambiar={(v) => cambiar(setServicio, "nombre", v)}
            />
            <Campo
              titulo="Descripción"
              valor={servicio.descripcion}
              cambiar={(v) => cambiar(setServicio, "descripcion", v)}
            />
            <Campo
              titulo="Precio (Bs)"
              tipo="number"
              min="0"
              step="0.01"
              valor={servicio.precio}
              cambiar={(v) => cambiar(setServicio, "precio", v)}
            />

            <button
              style={css.boton}
              type="submit"
              disabled={guardando}
            >
              {editServicio ? "Actualizar servicio" : "Agregar servicio"}
            </button>

            {editServicio && (
              <button
                type="button"
                style={{ ...css.boton, background: "#64748b" }}
                onClick={cancelarServicio}
              >
                Cancelar
              </button>
            )}
          </form>

          <Tabla columnas={[
            "ID", "Nombre", "Descripción", "Precio", "Acciones",
          ]}>
            {servicios.map((s) => (
              <tr key={s.id}>
                <td style={css.td}>{s.id}</td>
                <td style={css.td}>{s.nombre}</td>
                <td style={css.td}>{s.descripcion}</td>
                <td style={css.td}>
                  Bs {Number(s.precio).toFixed(2)}
                </td>
                <td style={css.td}>
                  <Acciones
                    deshabilitado={guardando}
                    editar={() => editarServicio(s)}
                    borrar={() => eliminar("servicios", s.id)}
                  />
                </td>
              </tr>
            ))}
          </Tabla>
        </section>

        {/* CONSUMOS */}

        <section style={css.tarjeta}>
          <h2>Consumo de servicios</h2>

          <form style={css.formulario} onSubmit={guardarConsumo}>
            <label style={css.grupo}>
              <span>Empleado</span>
              <select
                style={css.campo}
                value={consumo.empleado}
                required
                onChange={(e) =>
                  cambiar(setConsumo, "empleado", e.target.value)
                }
              >
                <option value="">Seleccionar empleado</option>
                {empleados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} {e.apellido}
                  </option>
                ))}
              </select>
            </label>

            <label style={css.grupo}>
              <span>Servicio</span>
              <select
                style={css.campo}
                value={consumo.servicio}
                required
                onChange={(e) =>
                  cambiar(setConsumo, "servicio", e.target.value)
                }
              >
                <option value="">Seleccionar servicio</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} - Bs {s.precio}
                  </option>
                ))}
              </select>
            </label>

            <Campo
              titulo="Fecha"
              tipo="date"
              valor={consumo.fecha}
              cambiar={(v) => cambiar(setConsumo, "fecha", v)}
            />

            <Campo
              titulo="Cantidad"
              tipo="number"
              min="1"
              step="1"
              valor={consumo.cantidad}
              cambiar={(v) => cambiar(setConsumo, "cantidad", v)}
            />

            <button
              type="submit"
              style={css.boton}
              disabled={guardando || !empleados.length || !servicios.length}
            >
              {editConsumo ? "Actualizar consumo" : "Registrar consumo"}
            </button>

            {editConsumo && (
              <button
                type="button"
                style={{ ...css.boton, background: "#64748b" }}
                onClick={cancelarConsumo}
              >
                Cancelar
              </button>
            )}
          </form>

          <p style={{
            background: "#eff6ff",
            padding: 16,
            borderRadius: 8,
            fontWeight: "bold",
            color: "#1e40af",
          }}>
            Total calculado: Bs {total.toFixed(2)}
          </p>

          <Tabla columnas={[
            "ID", "Empleado", "Servicio",
            "Fecha", "Cantidad", "Total", "Acciones",
          ]}>
            {consumos.map((c) => {
              const e = empleados.find(
                (x) => x.id === c.empleado
              );
              const s = servicios.find(
                (x) => x.id === c.servicio
              );

              return (
                <tr key={c.id}>
                  <td style={css.td}>{c.id}</td>
                  <td style={css.td}>
                    {e
                      ? `${e.nombre} ${e.apellido}`
                      : `Empleado ${c.empleado}`}
                  </td>
                  <td style={css.td}>
                    {s?.nombre || `Servicio ${c.servicio}`}
                  </td>
                  <td style={css.td}>{c.fecha}</td>
                  <td style={css.td}>{c.cantidad}</td>
                  <td style={css.td}>
                    Bs {Number(c.total).toFixed(2)}
                  </td>
                  <td style={css.td}>
                    <Acciones
                      deshabilitado={guardando}
                      editar={() => editarConsumo(c)}
                      borrar={() => eliminar("consumos", c.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </Tabla>
        </section>

        <p style={{
          textAlign: "center",
          color: "#64748b",
          padding: 15,
        }}>
          Sistema de Gestión Hotelera | React + Django
        </p>
      </main>
    </div>
  );
}

export default App;
