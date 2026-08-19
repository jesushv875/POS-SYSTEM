/**
 * MODO DEMO
 * ---------
 * Intercepta window.fetch y responde las rutas /api/* con datos simulados,
 * para que el sistema se pueda navegar sin backend.
 *
 * Sólo se activa con REACT_APP_DEMO=true (ver .env.production). En desarrollo
 * local la variable no está y el interceptor no se instala, así que la app
 * sigue hablando con el backend real sin ningún cambio.
 *
 * Ningún componente fue modificado para esto.
 */

const activo = () => process.env.REACT_APP_DEMO === 'true';

/* ---------------------------------------------------------------- utilidades */

const b64url = (obj) =>
  btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// JWT sin firmar de verdad: jwt-decode sólo lee el payload, no valida firma.
const TOKEN_DEMO = [
  b64url({ alg: 'HS256', typ: 'JWT' }),
  b64url({
    id: 1,
    nombre: 'Eduardo Hernández',
    correo: 'demo@hvjsolutions.mx',
    rol: 'admin',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
  }),
  'demo',
].join('.');

const hoy = new Date();
const hace = (dias, horas = 0) => {
  const d = new Date(hoy);
  d.setDate(d.getDate() - dias);
  d.setHours(9 + horas, (dias * 17) % 60, 0, 0);
  return d.toISOString();
};
const money = (n) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------- catálogo */

const categorias = [
  { id: 1, nombre: 'Abarrotes' },
  { id: 2, nombre: 'Bebidas' },
  { id: 3, nombre: 'Lácteos' },
  { id: 4, nombre: 'Limpieza' },
  { id: 5, nombre: 'Dulcería' },
];

const proveedores = [
  { id: 1, nombre: 'Distribuidora del Centro', contacto: 'Rocío Salas', telefono: '55 1234 5678', correo: 'ventas@distcentro.mx' },
  { id: 2, nombre: 'Lácteos La Huasteca',      contacto: 'Miguel Ruiz',  telefono: '55 8765 4321', correo: 'pedidos@lahuasteca.mx' },
  { id: 3, nombre: 'Bebidas del Valle',        contacto: 'Ana Cordero',  telefono: '55 2244 6688', correo: 'contacto@bebidasvalle.mx' },
];

const productos = [
  { id: 1,  nombre: 'Coca-Cola 600 ml',          codigoBarras: '7501055300006', precio: 21,  stock: 84, stockMinimo: 24, categoriaId: 2, proveedorId: 3, pasillo: '2', anaquel: 'B', piso: '1', imagenUrl: '' },
  { id: 2,  nombre: 'Sabritas original 45 g',    codigoBarras: '7501011129201', precio: 19,  stock: 62, stockMinimo: 20, categoriaId: 1, proveedorId: 1, pasillo: '1', anaquel: 'A', piso: '2', imagenUrl: '' },
  { id: 3,  nombre: 'Leche Lala entera 1 L',     codigoBarras: '7501020511124', precio: 28,  stock: 9,  stockMinimo: 18, categoriaId: 3, proveedorId: 2, pasillo: '3', anaquel: 'C', piso: '1', imagenUrl: '' },
  { id: 4,  nombre: 'Pan Bimbo grande',          codigoBarras: '7501000111107', precio: 52,  stock: 16, stockMinimo: 10, categoriaId: 1, proveedorId: 1, pasillo: '1', anaquel: 'D', piso: '1', imagenUrl: '' },
  { id: 5,  nombre: 'Huevo blanco kilo',         codigoBarras: '7500465000012', precio: 46,  stock: 22, stockMinimo: 12, categoriaId: 1, proveedorId: 1, pasillo: '1', anaquel: 'A', piso: '1', imagenUrl: '' },
  { id: 6,  nombre: 'Fabuloso 1 L',              codigoBarras: '7501025403119', precio: 34,  stock: 5,  stockMinimo: 12, categoriaId: 4, proveedorId: 1, pasillo: '4', anaquel: 'A', piso: '2', imagenUrl: '' },
  { id: 7,  nombre: 'Papel higiénico 4 rollos',  codigoBarras: '7501234500018', precio: 39,  stock: 31, stockMinimo: 15, categoriaId: 4, proveedorId: 1, pasillo: '4', anaquel: 'B', piso: '1', imagenUrl: '' },
  { id: 8,  nombre: 'Yogurt bebible 900 ml',     codigoBarras: '7501020588126', precio: 33,  stock: 14, stockMinimo: 10, categoriaId: 3, proveedorId: 2, pasillo: '3', anaquel: 'A', piso: '2', imagenUrl: '' },
  { id: 9,  nombre: 'Agua Ciel 1.5 L',           codigoBarras: '7501055363513', precio: 16,  stock: 96, stockMinimo: 30, categoriaId: 2, proveedorId: 3, pasillo: '2', anaquel: 'A', piso: '1', imagenUrl: '' },
  { id: 10, nombre: 'Gansito Marinela',          codigoBarras: '7501000642106', precio: 18,  stock: 48, stockMinimo: 20, categoriaId: 5, proveedorId: 1, pasillo: '5', anaquel: 'C', piso: '2', imagenUrl: '' },
  { id: 11, nombre: 'Café soluble 200 g',        codigoBarras: '7501059281028', precio: 98,  stock: 7,  stockMinimo: 8,  categoriaId: 1, proveedorId: 1, pasillo: '1', anaquel: 'C', piso: '3', imagenUrl: '' },
  { id: 12, nombre: 'Jugo Del Valle 1 L',        codigoBarras: '7501055310098', precio: 27,  stock: 40, stockMinimo: 15, categoriaId: 2, proveedorId: 3, pasillo: '2', anaquel: 'C', piso: '2', imagenUrl: '' },
];

const usuarios = [
  { id: 1, nombre: 'Eduardo Hernández', correo: 'demo@hvjsolutions.mx', rol: 'admin' },
  { id: 2, nombre: 'Laura Méndez',      correo: 'laura@tienda.mx',      rol: 'cajero' },
  { id: 3, nombre: 'Sergio Peña',       correo: 'sergio@tienda.mx',     rol: 'cajero' },
];

const nombreProd = (id) => (productos.find((p) => p.id === id) || {}).nombre || 'Producto';

/* --------------------------------------------------------------------- ventas */

const METODOS = ['efectivo', 'tarjeta', 'transferencia'];

const ventas = (() => {
  const out = [];
  let id = 1000;
  for (let d = 0; d < 30; d++) {
    const cuantas = 3 + ((d * 7) % 5);
    for (let k = 0; k < cuantas; k++) {
      const cuantosProd = 1 + ((d + k) % 3);
      const detalles = [];
      for (let j = 0; j < cuantosProd; j++) {
        const p = productos[(d * 3 + k * 5 + j) % productos.length];
        const cantidad = 1 + ((k + j) % 3);
        detalles.push({
          id: id * 10 + j,
          productoId: p.id,
          producto: { id: p.id, nombre: p.nombre },
          cantidad,
          precio: p.precio,
          subtotal: money(p.precio * cantidad),
        });
      }
      const total = money(detalles.reduce((s, x) => s + x.subtotal, 0));
      const u = usuarios[1 + ((d + k) % 2)];
      out.push({
        id: id++,
        fecha: hace(d, k),
        total,
        metodoPago: METODOS[(d + k) % 3],
        cambio: money(Math.max(0, Math.ceil(total / 50) * 50 - total)),
        usuarioId: u.id,
        usuario: { id: u.id, nombre: u.nombre },
        detalles,
      });
    }
  }
  return out.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
})();

const ventasDeHoy = ventas.filter((v) => new Date(v.fecha).toDateString() === hoy.toDateString());

/* ---------------------------------------------------------------------- caja */

let caja = {
  id: 7,
  fecha: hace(0),
  fechaApertura: hace(0),
  fondoInicial: 1500,
  totalVentas: money(ventasDeHoy.reduce((s, v) => s + v.total, 0)),
  totalEnCaja: money(1500 + ventasDeHoy.reduce((s, v) => s + (v.metodoPago === 'efectivo' ? v.total : 0), 0)),
  estado: 'abierta',
  usuario: { id: 1, nombre: 'Eduardo Hernández' },
};

let movimientos = [
  { id: 1, tipo: 'entrada', monto: 1500, motivo: 'Fondo inicial de caja',    fecha: hace(0),    usuario: { nombre: 'Eduardo Hernández' } },
  { id: 2, tipo: 'salida',  monto: 320,  motivo: 'Pago de garrafones',       fecha: hace(0, 2), usuario: { nombre: 'Laura Méndez' } },
  { id: 3, tipo: 'entrada', monto: 500,  motivo: 'Reposición de cambio',     fecha: hace(0, 4), usuario: { nombre: 'Eduardo Hernández' } },
];

const movimientosInventario = (motivoBase) =>
  Array.from({ length: 12 }, (_, i) => {
    const p = productos[(i * 3) % productos.length];
    return {
      id: i + 1,
      productoId: p.id,
      producto: { id: p.id, nombre: p.nombre },
      nombre: p.nombre,
      cantidad: 6 + ((i * 5) % 24),
      motivo: motivoBase[i % motivoBase.length],
      comentario: '',
      fecha: hace(i % 14, i % 6),
      imagenUrl: '',
      usuario: { nombre: usuarios[i % 3].nombre },
    };
  });

/* ------------------------------------------------------------------ reportes */

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const ventasMensuales = MESES.map((mes, i) => ({
  mes,
  numeroMes: i + 1,
  total: money(38000 + ((i * 9173) % 27000)),
}));

const ventasPorProducto = productos
  .map((p, i) => ({
    productoId: p.id,
    producto: { id: p.id, nombre: p.nombre },
    nombre: p.nombre,
    _sum: { cantidad: 40 + ((i * 23) % 180), subtotal: money(p.precio * (40 + ((i * 23) % 180))) },
  }))
  .sort((a, b) => b._sum.subtotal - a._sum.subtotal);

const inventarioBajo = productos
  .filter((p) => p.stock <= p.stockMinimo)
  .map((p) => ({ id: p.id, nombre: p.nombre, stock: p.stock, stockMinimo: p.stockMinimo, categoriaId: p.categoriaId }));

const logs = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  accion: ['LOGIN', 'VENTA', 'ALTA_PRODUCTO', 'AJUSTE_STOCK', 'CIERRE_CAJA'][i % 5],
  descripcion: [
    'Inicio de sesión correcto',
    `Venta #${1000 + i} registrada`,
    `Alta de producto "${nombreProd((i % 12) + 1)}"`,
    `Ajuste de stock en "${nombreProd((i % 12) + 1)}"`,
    'Corte de caja realizado',
  ][i % 5],
  fecha: hace(i % 15, i % 8),
  usuario: { nombre: usuarios[i % 3].nombre },
  usuarioNombre: usuarios[i % 3].nombre,
}));

/* ------------------------------------------------------------------- ruteador */

const dashboard = () => ({
  caja: caja && caja.estado === 'abierta' ? caja : null,
  ventasHoy: ventasDeHoy.length,
  totalVentasHoy: money(ventasDeHoy.reduce((s, v) => s + v.total, 0)),
  productosBajoStock: inventarioBajo.length,
  ultimasVentas: ventas.slice(0, 8),
});

function resolver(ruta, metodo, cuerpo) {
  const r = ruta.replace(/\?.*$/, '');

  if (r === '/api/auth/login')
    return { token: TOKEN_DEMO, usuario: usuarios[0], message: 'Sesión demo iniciada' };

  if (r === '/api/dashboard')      return dashboard();
  if (r === '/api/productos')      return productos;
  if (r === '/api/categorias')     return categorias;
  if (r === '/api/proveedores')    return proveedores;
  if (r === '/api/usuarios')       return usuarios;
  if (r === '/api/ventas')         return ventas;
  if (r === '/api/logs')           return logs;

  if (r === '/api/caja/hoy')          return caja;
  if (r === '/api/caja/movimientos')  return movimientos;
  if (r === '/api/caja/corte')
    return {
      fondoInicial: caja.fondoInicial,
      totalVentas: caja.totalVentas,
      totalEfectivo: money(ventasDeHoy.filter(v => v.metodoPago === 'efectivo').reduce((s, v) => s + v.total, 0)),
      totalTarjeta: money(ventasDeHoy.filter(v => v.metodoPago === 'tarjeta').reduce((s, v) => s + v.total, 0)),
      totalTransferencia: money(ventasDeHoy.filter(v => v.metodoPago === 'transferencia').reduce((s, v) => s + v.total, 0)),
      entradas: money(movimientos.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.monto, 0)),
      salidas: money(movimientos.filter(m => m.tipo === 'salida').reduce((s, m) => s + m.monto, 0)),
      totalEnCaja: caja.totalEnCaja,
      numeroVentas: ventasDeHoy.length,
      fecha: new Date().toISOString(),
    };
  if (r === '/api/caja/iniciar') {
    caja = { ...caja, estado: 'abierta', fondoInicial: Number((cuerpo && cuerpo.fondoInicial) || 1500) };
    return caja;
  }
  if (r === '/api/caja/cerrar') { caja = { ...caja, estado: 'cerrada' }; return { message: 'Caja cerrada (demo)' }; }

  if (r === '/api/inventario/entradas') return movimientosInventario(['Compra a proveedor', 'Devolución de cliente', 'Ajuste de inventario']);
  if (r === '/api/inventario/salidas')  return movimientosInventario(['Merma', 'Producto caducado', 'Consumo interno']);

  if (r === '/api/reportes/ventas-mensuales') return ventasMensuales;
  if (r === '/api/reportes/ventas-producto')  return ventasPorProducto;
  if (r === '/api/reportes/inventario-bajo')  return inventarioBajo;

  if (r === '/api/agente/preguntar')
    return {
      respuesta:
        'Estás en el modo demostración, así que respondo con datos de ejemplo. ' +
        'Hoy van ' + ventasDeHoy.length + ' ventas por $' + money(ventasDeHoy.reduce((s, v) => s + v.total, 0)).toFixed(2) + '. ' +
        'Hay ' + inventarioBajo.length + ' productos por debajo del mínimo; el más urgente es ' +
        ((inventarioBajo[0] || {}).nombre || 'ninguno') + '.',
    };

  // Altas, ediciones y bajas: se aceptan para que la interfaz responda,
  // pero no se persiste nada. Al recargar vuelven los datos originales.
  if (metodo !== 'GET')
    return { ok: true, id: Math.floor(Math.random() * 9000) + 1000, message: 'Guardado en modo demo (no se persiste)', ...(cuerpo || {}) };

  return { message: 'Ruta no simulada en el modo demo', ruta: r };
}

/* -------------------------------------------------------------------- banner */

function banner() {
  if (document.getElementById('demo-banner')) return;
  const el = document.createElement('div');
  el.id = 'demo-banner';
  el.innerHTML =
    '<b>MODO DEMOSTRACIÓN</b> · datos de ejemplo, entra con cualquier correo y contraseña ' +
    '<a href="https://wa.me/5219212295670?text=Hola%2C%20vi%20la%20demo%20del%20punto%20de%20venta%20y%20quiero%20uno%20para%20mi%20negocio." ' +
    'target="_blank" rel="noopener">Quiero uno para mi negocio →</a>';
  el.setAttribute('style', [
    'position:fixed', 'left:0', 'right:0', 'bottom:0', 'z-index:99999',
    'background:#4F46E5', 'color:#fff', 'font:500 13px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
    'padding:9px 16px', 'text-align:center', 'box-shadow:0 -2px 14px rgba(0,0,0,.22)',
  ].join(';'));
  const a = el.querySelector('a');
  a.setAttribute('style', 'color:#fff;font-weight:700;margin-left:10px;text-decoration:underline');
  document.body.appendChild(el);
  document.body.style.paddingBottom = '44px';
}

/* ----------------------------------------------------------------- instalador */

export default function installDemoApi() {
  if (!activo() || typeof window === 'undefined') return;

  const original = window.fetch.bind(window);

  window.fetch = async (entrada, opciones = {}) => {
    const url = typeof entrada === 'string' ? entrada : (entrada && entrada.url) || '';
    const i = url.indexOf('/api/');
    if (i === -1) return original(entrada, opciones);

    const ruta = url.slice(i);
    const metodo = (opciones.method || 'GET').toUpperCase();
    let cuerpo = null;
    try { cuerpo = opciones.body ? JSON.parse(opciones.body) : null; } catch (_) {}

    // pequeño retardo para que se vean los estados de carga
    await new Promise((r) => setTimeout(r, 120 + Math.random() * 200));

    const datos = resolver(ruta, metodo, cuerpo);
    return new Response(JSON.stringify(datos), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', banner);
  else banner();
}
