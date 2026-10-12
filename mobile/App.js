
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const API = "http://192.168.1.16:8082/api";

const C = {
  navy: "#11213B",
  navy2: "#1B3456",
  gold: "#D3AA67",
  goldLight: "#F8F1E6",
  bg: "#F4F6FA",
  white: "#FFFFFF",
  text: "#17263F",
  muted: "#78869B",
  line: "#E8EDF4",
  blue: "#3265AD",
  green: "#168267",
  red: "#D95058",
  orange: "#DB903C",
};

function hoy() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const nuevo = {
  empleados: () => ({
    nombre: "",
    apellido: "",
    cargo: "",
    telefono: "",
    fecha_ingreso: hoy(),
  }),
  servicios: () => ({
    nombre: "",
    descripcion: "",
    precio: "",
  }),
  consumos: () => ({
    empleado: "",
    servicio: "",
    fecha: hoy(),
    cantidad: "1",
  }),
};

function Boton({ texto, onPress, secundario, peligro, disabled }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.boton,
        secundario && styles.botonSecundario,
        peligro && styles.botonPeligro,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text
        style={[
          styles.botonTexto,
          secundario && { color: C.navy },
        ]}
      >
        {texto}
      </Text>
    </TouchableOpacity>
  );
}

function Campo({ titulo, valor, onChange, teclado, multilinea }) {
  return (
    <View style={styles.campoGrupo}>
      <Text style={styles.label}>{titulo}</Text>
      <TextInput
        value={String(valor ?? "")}
        onChangeText={onChange}
        placeholder={`Ingresa ${titulo.toLowerCase()}`}
        placeholderTextColor="#A6B0C0"
        keyboardType={teclado || "default"}
        multiline={multilinea}
        style={[
          styles.input,
          multilinea && {
            minHeight: 90,
            textAlignVertical: "top",
          },
        ]}
      />
    </View>
  );
}

function Seleccion({ titulo, items, valor, onChange, nombre }) {
  return (
    <View style={styles.campoGrupo}>
      <Text style={styles.label}>{titulo}</Text>
      {items.length === 0 ? (
        <Text style={styles.muted}>No hay opciones disponibles.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {items.map((item) => {
            const activo = String(valor) === String(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onChange(String(item.id))}
                style={[
                  styles.chip,
                  activo && styles.chipActivo,
                ]}
              >
                <Text
                  style={[
                    styles.chipTexto,
                    activo && { color: C.white },
                  ]}
                >
                  {nombre(item)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function Tarjeta({ children, estilo }) {
  return (
    <View style={[styles.card, estilo]}>
      {children}
    </View>
  );
}

function Estadistica({ icono, valor, titulo }) {
  return (
    <View style={styles.estadistica}>
      <Text style={styles.estadisticaIcono}>{icono}</Text>
      <Text style={styles.estadisticaValor}>{valor}</Text>
      <Text style={styles.estadisticaTitulo}>{titulo}</Text>
    </View>
  );
}

function Info({ titulo, valor }) {
  return (
    <View style={styles.infoFila}>
      <Text style={styles.infoTitulo}>{titulo}</Text>
      <Text style={styles.infoValor}>{String(valor ?? "—")}</Text>
    </View>
  );
}

export default function App() {
  const [pagina, setPagina] = useState("inicio");
  const [empleados, setEmpleados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [consumos, setConsumos] = useState([]);

  const [formularios, setFormularios] = useState({
    empleados: nuevo.empleados(),
    servicios: nuevo.servicios(),
    consumos: nuevo.consumos(),
  });

  const [editando, setEditando] = useState({
    empleados: null,
    servicios: null,
    consumos: null,
  });

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [conectado, setConectado] = useState(false);

  const esModulo = pagina !== "inicio";
  const form = formularios[pagina] || {};
  const registros = {
    empleados,
    servicios,
    consumos,
  };

  async function solicitar(ruta, opciones = {}) {
    const controller = new AbortController();
    const temporizador = setTimeout(() => controller.abort(), 12000);

    try {
      const respuesta = await fetch(`${API}/${ruta}`, {
        ...opciones,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...opciones.headers,
        },
      });

      const texto = await respuesta.text();
      let datos = null;

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
    } catch (e) {
      if (controller.signal.aborted) {
        throw new Error("El servidor tardó demasiado en responder.");
      }

      if (
        e.message === "Network request failed" ||
        e.message.includes("fetch failed")
      ) {
        throw new Error("No se pudo establecer conexión con el servidor.");
      }

      throw e;
    } finally {
      clearTimeout(temporizador);
    }
  }

  async function cargar() {
    setCargando(true);
    setError("");

    try {
      const [e, s, c] = await Promise.all([
        solicitar("empleados/"),
        solicitar("servicios/"),
        solicitar("consumos/"),
      ]);

      setEmpleados(Array.isArray(e) ? e : e.results || []);
      setServicios(Array.isArray(s) ? s : s.results || []);
      setConsumos(Array.isArray(c) ? c : c.results || []);
      setConectado(true);
    } catch (e) {
      setConectado(false);
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function cambiar(campo, valor) {
    setFormularios((prev) => ({
      ...prev,
      [pagina]: {
        ...prev[pagina],
        [campo]: valor,
      },
    }));
  }

  function limpiar(tipo) {
    setFormularios((prev) => ({
      ...prev,
      [tipo]: nuevo[tipo](),
    }));

    setEditando((prev) => ({
      ...prev,
      [tipo]: null,
    }));
  }

  function editar(item) {
    const valores =
      pagina === "empleados"
        ? {
            nombre: item.nombre,
            apellido: item.apellido,
            cargo: item.cargo,
            telefono: item.telefono,
            fecha_ingreso: item.fecha_ingreso,
          }
        : pagina === "servicios"
          ? {
              nombre: item.nombre,
              descripcion: item.descripcion,
              precio: String(item.precio),
            }
          : {
              empleado: String(item.empleado),
              servicio: String(item.servicio),
              fecha: item.fecha,
              cantidad: String(item.cantidad),
            };

    setFormularios((prev) => ({
      ...prev,
      [pagina]: valores,
    }));

    setEditando((prev) => ({
      ...prev,
      [pagina]: item.id,
    }));
  }

  const cantidad = Number(formularios.consumos.cantidad);

  const servicioElegido = servicios.find(
    (s) => String(s.id) === String(formularios.consumos.servicio)
  );

  const totalPreview =
    servicioElegido && Number.isInteger(cantidad) && cantidad > 0
      ? Number(servicioElegido.precio) * cantidad
      : 0;

  async function guardar() {
    if (!esModulo || guardando) return;

    let datos;
    const id = editando[pagina];

    if (pagina === "empleados") {
      if (Object.values(form).some((v) => !String(v).trim())) {
        Alert.alert("Campos incompletos", "Completa todos los datos.");
        return;
      }
      datos = form;
    }

    if (pagina === "servicios") {
      const precio = Number(String(form.precio).replace(",", "."));

      if (
        !form.nombre.trim() ||
        !form.descripcion.trim() ||
        !String(form.precio).trim() ||
        !Number.isFinite(precio) ||
        precio < 0
      ) {
        Alert.alert("Datos inválidos", "Revisa el nombre, descripción y precio.");
        return;
      }

      datos = { ...form, precio: precio.toFixed(2) };
    }

    if (pagina === "consumos") {
      const cant = Number(form.cantidad);

      if (
        !form.empleado ||
        !form.servicio ||
        !Number.isInteger(cant) ||
        cant <= 0
      ) {
        Alert.alert(
          "Datos incompletos",
          "Selecciona empleado, servicio y una cantidad positiva."
        );
        return;
      }

      datos = {
        empleado: Number(form.empleado),
        servicio: Number(form.servicio),
        fecha: form.fecha,
        cantidad: cant,
      };
    }

    setGuardando(true);

    try {
      await solicitar(id ? `${pagina}/${id}/` : `${pagina}/`, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(datos),
      });

      limpiar(pagina);
      await cargar();
      Alert.alert("¡Guardado!", "La información se guardó correctamente.");
    } catch (e) {
      Alert.alert("No se pudo guardar", e.message);
    } finally {
      setGuardando(false);
    }
  }

  function eliminar(item) {
    Alert.alert(
      "Eliminar registro",
      "¿Estás seguro? Esta operación no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            if (guardando) return;
            setGuardando(true);

            try {
              await solicitar(`${pagina}/${item.id}/`, {
                method: "DELETE",
              });
              limpiar(pagina);
              await cargar();
              Alert.alert("Eliminado", "El registro fue eliminado.");
            } catch (e) {
              Alert.alert("No se pudo eliminar", e.message);
            } finally {
              setGuardando(false);
            }
          },
        },
      ]
    );
  }

  function contenidoFormulario() {
    if (pagina === "empleados") {
      return (
        <>
          <Campo titulo="Nombre" valor={form.nombre}
            onChange={(v) => cambiar("nombre", v)} />
          <Campo titulo="Apellido" valor={form.apellido}
            onChange={(v) => cambiar("apellido", v)} />
          <Campo titulo="Cargo" valor={form.cargo}
            onChange={(v) => cambiar("cargo", v)} />
          <Campo titulo="Teléfono" valor={form.telefono}
            teclado="phone-pad"
            onChange={(v) => cambiar("telefono", v)} />
          <Campo titulo="Fecha de ingreso (AAAA-MM-DD)"
            valor={form.fecha_ingreso}
            onChange={(v) => cambiar("fecha_ingreso", v)} />
        </>
      );
    }

    if (pagina === "servicios") {
      return (
        <>
          <Campo titulo="Nombre del servicio"
            valor={form.nombre}
            onChange={(v) => cambiar("nombre", v)} />
          <Campo titulo="Descripción"
            valor={form.descripcion}
            multilinea
            onChange={(v) => cambiar("descripcion", v)} />
          <Campo titulo="Precio en Bs"
            valor={form.precio}
            teclado="decimal-pad"
            onChange={(v) => cambiar("precio", v)} />
        </>
      );
    }

    return (
      <>
        <Seleccion
          titulo="Empleado responsable"
          items={empleados}
          valor={form.empleado}
          onChange={(v) => cambiar("empleado", v)}
          nombre={(e) => `${e.nombre} ${e.apellido}`}
        />
        <Seleccion
          titulo="Servicio"
          items={servicios}
          valor={form.servicio}
          onChange={(v) => cambiar("servicio", v)}
          nombre={(s) => `${s.nombre} · Bs ${s.precio}`}
        />
        <Campo titulo="Fecha (AAAA-MM-DD)"
          valor={form.fecha}
          onChange={(v) => cambiar("fecha", v)} />
        <Campo titulo="Cantidad"
          valor={form.cantidad}
          teclado="number-pad"
          onChange={(v) => cambiar("cantidad", v)} />
        <View style={styles.totalCaja}>
          <Text style={styles.totalLabel}>TOTAL ESTIMADO</Text>
          <Text style={styles.totalImporte}>
            Bs {totalPreview.toFixed(2)}
          </Text>
        </View>
      </>
    );
  }

  function contenidoRegistro(item) {
    if (pagina === "empleados") {
      return (
        <>
          <Text style={styles.registroNombre}>
            {item.nombre} {item.apellido}
          </Text>
          <Text style={styles.registroSub}>{item.cargo}</Text>
          <View style={styles.separador}/>
          <Info titulo="Teléfono" valor={item.telefono}/>
          <Info titulo="Fecha de ingreso" valor={item.fecha_ingreso}/>
        </>
      );
    }

    if (pagina === "servicios") {
      return (
        <>
          <Text style={styles.registroNombre}>{item.nombre}</Text>
          <Text style={styles.registroSub}>{item.descripcion}</Text>
          <View style={styles.separador}/>
          <Text style={styles.precio}>
            Bs {Number(item.precio).toFixed(2)}
          </Text>
        </>
      );
    }

    const empleado = empleados.find((e) => e.id === item.empleado);
    const servicio = servicios.find((s) => s.id === item.servicio);

    return (
      <>
        <Text style={styles.registroNombre}>
          {servicio?.nombre || item.servicio_nombre || "Servicio"}
        </Text>
        <Text style={styles.registroSub}>
          {empleado
            ? `${empleado.nombre} ${empleado.apellido}`
            : item.empleado_nombre || "Empleado"}
        </Text>
        <View style={styles.separador}/>
        <Info titulo="Fecha" valor={item.fecha}/>
        <Info titulo="Cantidad" valor={item.cantidad}/>
        <Text style={styles.precio}>
          Bs {Number(item.total).toFixed(2)}
        </Text>
      </>
    );
  }

  function inicio() {
    const importeTotal = consumos.reduce(
      (suma, c) => suma + Number(c.total || 0),
      0
    );

    return (
      <>
        <Text style={styles.bienvenida}>Bienvenido al hotel</Text>
        <Text style={styles.bienvenidaSub}>
          Gestiona tu establecimiento desde cualquier lugar.
        </Text>

        <View style={styles.resumenFila}>
          <Estadistica icono="👥" valor={empleados.length} titulo="Empleados"/>
          <Estadistica icono="🛎️" valor={servicios.length} titulo="Servicios"/>
          <Estadistica icono="🧾" valor={consumos.length} titulo="Consumos"/>
        </View>

        <View style={styles.balance}>
          <Text style={styles.balanceLabel}>TOTAL DE CONSUMOS REGISTRADOS</Text>
          <Text style={styles.balanceValor}>
            Bs {importeTotal.toFixed(2)}
          </Text>
          <Text style={styles.balancePie}>
            Suma de los consumos disponibles en la API
          </Text>
        </View>

        <Text style={styles.seccionTitulo}>Accesos rápidos</Text>

        {[
          ["👥", "Empleados", "Gestionar el personal", "empleados"],
          ["🛎️", "Servicios", "Gestionar precios y servicios", "servicios"],
          ["🧾", "Consumos", "Registrar nuevos consumos", "consumos"],
        ].map(([icono, titulo, sub, destino]) => (
          <TouchableOpacity
            key={destino}
            style={styles.acceso}
            onPress={() => setPagina(destino)}
          >
            <View style={styles.accesoIcono}>
              <Text style={{ fontSize: 25 }}>{icono}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accesoTitulo}>{titulo}</Text>
              <Text style={styles.accesoSub}>{sub}</Text>
            </View>
            <Text style={styles.flecha}>›</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.pie}>
          Sistema Hotelero · Panel de administración
        </Text>
      </>
    );
  }

  const titulos = {
    inicio: "Inicio",
    empleados: "Empleados",
    servicios: "Servicios",
    consumos: "Consumos",
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.pagina}>
        <StatusBar backgroundColor={C.navy} barStyle="light-content"/>

        <View style={styles.header}>
          <Text style={styles.headerMarca}>H  /  HOTEL MANAGEMENT</Text>
          <Text style={styles.headerTitulo}>{titulos[pagina]}</Text>
          <View style={styles.estadoFila}>
            <View style={[
              styles.estadoPunto,
              { backgroundColor: conectado ? "#6AD7AD" : "#F5BC6E" },
            ]}/>
            <Text style={styles.estadoTexto}>
              {conectado ? "Sistema conectado" : "Sin conexión al servidor"}
            </Text>
            <TouchableOpacity onPress={cargar} style={styles.refrescar}>
              <Text style={{ color: C.white, fontSize: 17 }}>↻</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          key={pagina}
          style={{ flex: 1 }}
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={cargando} onRefresh={cargar}/>
          }
        >
          {!!error && (
            <View style={styles.errorCaja}>
              <Text style={styles.errorTitulo}>Conexión no disponible</Text>
              <Text style={styles.errorTexto}>{error}</Text>
              <Text style={styles.errorTexto}>
                Verifica que Django y el proxy Node.js estén encendidos.
              </Text>
              <Boton texto="Reintentar" onPress={cargar} secundario/>
            </View>
          )}

          {cargando && (
            <ActivityIndicator
              size="small"
              color={C.blue}
              style={{ marginBottom: 16 }}
            />
          )}

          {pagina === "inicio" ? (
            inicio()
          ) : (
            <>
              <View style={styles.seccionFila}>
                <View>
                  <Text style={styles.seccionTitulo}>
                    {editando[pagina] ? "Editar registro" : "Nuevo registro"}
                  </Text>
                  <Text style={styles.seccionSub}>
                    Completa la información solicitada
                  </Text>
                </View>
                <Text style={styles.seccionIcono}>
                  {pagina === "empleados"
                    ? "👤"
                    : pagina === "servicios" ? "🛎️" : "🧾"}
                </Text>
              </View>

              <Tarjeta>
                {contenidoFormulario()}
                <Boton
                  texto={editando[pagina] ? "Guardar cambios" : "Guardar registro"}
                  onPress={guardar}
                  disabled={guardando || cargando}
                />
                {editando[pagina] && (
                  <Boton
                    texto="Cancelar edición"
                    secundario
                    onPress={() => limpiar(pagina)}
                  />
                )}
              </Tarjeta>

              <View style={styles.listaHeader}>
                <Text style={styles.seccionTitulo}>Registros</Text>
                <View style={styles.contador}>
                  <Text style={styles.contadorTexto}>
                    {registros[pagina].length}
                  </Text>
                </View>
              </View>

              {registros[pagina].length === 0 && !cargando && (
                <Tarjeta>
                  <Text style={styles.muted}>
                    {error
                      ? "No se pudieron cargar los registros."
                      : "Todavía no hay registros disponibles."}
                  </Text>
                </Tarjeta>
              )}

              {registros[pagina].map((item) => (
                <Tarjeta key={item.id}>
                  <View style={styles.registroCabecera}>
                    <View style={styles.idCaja}>
                      <Text style={styles.idTexto}>#{item.id}</Text>
                    </View>
                    <Text style={styles.registroEstado}>REGISTRADO</Text>
                  </View>

                  {contenidoRegistro(item)}

                  <View style={styles.acciones}>
                    <View style={{ flex: 1 }}>
                      <Boton
                        texto="Editar"
                        secundario
                        onPress={() => editar(item)}
                        disabled={guardando}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Boton
                        texto="Eliminar"
                        peligro
                        onPress={() => eliminar(item)}
                        disabled={guardando}
                      />
                    </View>
                  </View>
                </Tarjeta>
              ))}
            </>
          )}
        </ScrollView>

        <View style={styles.nav}>
          {[
            ["inicio", "⌂", "Inicio"],
            ["empleados", "♙", "Empleados"],
            ["servicios", "◇", "Servicios"],
            ["consumos", "▤", "Consumos"],
          ].map(([clave, icono, titulo]) => {
            const activo = pagina === clave;
            return (
              <TouchableOpacity
                key={clave}
                onPress={() => setPagina(clave)}
                style={styles.navItem}
              >
                <Text style={[
                  styles.navIcono,
                  activo && { color: C.gold },
                ]}>
                  {icono}
                </Text>
                <Text style={[
                  styles.navLabel,
                  activo && { color: C.navy, fontWeight: "bold" },
                ]}>
                  {titulo}
                </Text>
                {activo && <View style={styles.navLinea}/>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pagina: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    backgroundColor: C.navy,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 25,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  headerMarca: {
    color: C.gold,
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: "bold",
    marginBottom: 12,
  },
  headerTitulo: {
    color: C.white,
    fontSize: 31,
    fontWeight: "bold",
    marginBottom: 13,
  },
  estadoFila: {
    flexDirection: "row",
    alignItems: "center",
  },
  estadoPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  estadoTexto: {
    color: "#CBD6E5",
    fontSize: 12,
    flex: 1,
  },
  refrescar: {
    backgroundColor: "#2B4260",
    borderRadius: 10,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  contenido: {
    padding: 20,
    paddingBottom: 35,
  },
  bienvenida: {
    fontSize: 23,
    fontWeight: "bold",
    color: C.navy,
    marginBottom: 6,
  },
  bienvenidaSub: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 23,
  },
  resumenFila: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 19,
  },
  estadistica: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    elevation: 2,
  },
  estadisticaIcono: {
    fontSize: 23,
    marginBottom: 10,
  },
  estadisticaValor: {
    fontSize: 25,
    fontWeight: "bold",
    color: C.navy,
  },
  estadisticaTitulo: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
  },
  balance: {
    backgroundColor: C.navy2,
    padding: 22,
    borderRadius: 18,
    marginBottom: 27,
  },
  balanceLabel: {
    fontSize: 10,
    letterSpacing: 1.3,
    color: "#B7C8DF",
    fontWeight: "bold",
  },
  balanceValor: {
    color: C.white,
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 14,
  },
  balancePie: {
    color: "#A9BDD7",
    fontSize: 11,
  },
  acceso: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 1,
  },
  accesoIcono: {
    backgroundColor: C.goldLight,
    width: 49,
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    marginRight: 14,
  },
  accesoTitulo: {
    fontWeight: "bold",
    color: C.navy,
    fontSize: 15,
  },
  accesoSub: {
    color: C.muted,
    marginTop: 5,
    fontSize: 12,
  },
  flecha: {
    fontSize: 26,
    color: C.gold,
  },
  seccionFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },
  seccionTitulo: {
    color: C.navy,
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 5,
  },
  seccionSub: {
    color: C.muted,
    fontSize: 12,
  },
  seccionIcono: {
    fontSize: 25,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 17,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  campoGrupo: {
    marginBottom: 17,
  },
  label: {
    color: C.text,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 9,
  },
  input: {
    backgroundColor: "#FAFBFD",
    color: C.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    borderColor: "#DEE5EF",
    borderWidth: 1,
    borderRadius: 10,
  },
  boton: {
    backgroundColor: C.navy,
    borderRadius: 11,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  botonSecundario: {
    backgroundColor: C.goldLight,
  },
  botonPeligro: {
    backgroundColor: C.red,
  },
  botonTexto: {
    color: C.white,
    fontSize: 13,
    fontWeight: "bold",
  },
  chip: {
    backgroundColor: "#F3F6FA",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: C.line,
  },
  chipActivo: {
    backgroundColor: C.navy,
    borderColor: C.navy,
  },
  chipTexto: {
    color: C.text,
    fontSize: 13,
  },
  totalCaja: {
    backgroundColor: C.goldLight,
    borderRadius: 12,
    padding: 17,
    marginBottom: 12,
  },
  totalLabel: {
    color: "#987140",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  totalImporte: {
    color: C.navy,
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 7,
  },
  listaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    gap: 9,
  },
  contador: {
    backgroundColor: C.goldLight,
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
  },
  contadorTexto: {
    color: "#946B31",
    fontWeight: "bold",
  },
  registroCabecera: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  idCaja: {
    backgroundColor: C.goldLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 7,
  },
  idTexto: {
    color: "#996F34",
    fontWeight: "bold",
    fontSize: 12,
  },
  registroEstado: {
    fontSize: 10,
    color: C.green,
    letterSpacing: 0.8,
    fontWeight: "bold",
  },
  registroNombre: {
    fontSize: 19,
    fontWeight: "bold",
    color: C.navy,
  },
  registroSub: {
    fontSize: 13,
    color: C.muted,
    marginTop: 5,
  },
  separador: {
    height: 1,
    backgroundColor: C.line,
    marginVertical: 15,
  },
  infoFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 12,
  },
  infoTitulo: {
    color: C.muted,
    fontSize: 12,
  },
  infoValor: {
    color: C.text,
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
  precio: {
    color: C.green,
    fontSize: 21,
    fontWeight: "bold",
    marginTop: 5,
  },
  acciones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  muted: {
    color: C.muted,
    fontSize: 13,
  },
  errorCaja: {
    backgroundColor: "#FFF0F0",
    borderRadius: 14,
    padding: 17,
    marginBottom: 20,
  },
  errorTitulo: {
    color: "#A52C34",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 7,
  },
  errorTexto: {
    color: "#A44E54",
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 7,
  },
  pie: {
    color: C.muted,
    textAlign: "center",
    fontSize: 11,
    marginTop: 25,
  },
  nav: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navIcono: {
    fontSize: 25,
    color: "#98A6BA",
    marginBottom: 4,
  },
  navLabel: {
    color: C.muted,
    fontSize: 10,
  },
  navLinea: {
    backgroundColor: C.gold,
    height: 3,
    width: 23,
    borderRadius: 5,
    marginTop: 6,
  },
});
