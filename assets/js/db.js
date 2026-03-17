// ============================================
// VERDES POR ACCIÓN — db.js
// Base de datos compartida (localStorage)
// Usada por: admin-panel.html, pages/parques.html
// ============================================

const DB = {
  // ---- PARQUES ----
  getParques() {
    const data = localStorage.getItem('vpa_parques');
    if (data) return JSON.parse(data);
    // Datos iniciales si no hay nada guardado
    const iniciales = [
      { id:1, nombre:'Parque El Tunal', localidad:'Tunjuelito', area:'17.8', estado:'activo', tipo:'Metropolitano', descripcion:'Gran parque metropolitano al sur de Bogotá con lago, canchas y zonas verdes.', empresa:'Jardín Botánico', emoji:'🌳', lat:'4.5697', lng:'-74.1361', barrio:'Tunal', fecha:'2024-01-15' },
      { id:2, nombre:'Parque Simón Bolívar', localidad:'Teusaquillo', area:'113', estado:'activo', tipo:'Metropolitano', descripcion:'El parque más grande de Bogotá. Cuenta con lago, senderos y espacios culturales.', empresa:'Secretaría de Ambiente', emoji:'🌲', lat:'4.6585', lng:'-74.0938', barrio:'Teusaquillo', fecha:'2024-01-10' },
      { id:3, nombre:'Parque El Virrey', localidad:'Chapinero', area:'13.5', estado:'activo', tipo:'Zonal', descripcion:'Parque lineal ideal para ciclismo y trote en el norte de Bogotá.', empresa:'EcoVerde S.A.S', emoji:'🌿', lat:'4.6767', lng:'-74.0524', barrio:'El Virrey', fecha:'2024-02-01' },
      { id:4, nombre:'Parque La Florida', localidad:'Engativá', area:'102', estado:'mantenimiento', tipo:'Metropolitano', descripcion:'Reserva natural con humedal. Actualmente en mantenimiento por obras de restauración.', empresa:'Aguas Bogotá', emoji:'🍀', lat:'4.7089', lng:'-74.1447', barrio:'La Florida', fecha:'2024-02-10' },
      { id:5, nombre:'Parque Timiza', localidad:'Kennedy', area:'14.2', estado:'activo', tipo:'Zonal', descripcion:'Parque zonal con amplias zonas deportivas y recreativas para la comunidad.', empresa:'EcoVerde S.A.S', emoji:'🌱', lat:'4.5928', lng:'-74.1540', barrio:'Timiza', fecha:'2024-03-01' },
      { id:6, nombre:'Jardín Botánico', localidad:'Barrios Unidos', area:'19.5', estado:'activo', tipo:'Metropolitano', descripcion:'Centro de investigación y conservación de flora colombiana con más de 4.500 especies.', empresa:'Jardín Botánico', emoji:'🌸', lat:'4.6620', lng:'-74.1005', barrio:'La Esmeralda', fecha:'2024-01-05' },
    ];
    DB.setParques(iniciales);
    return iniciales;
  },
  setParques(parques) {
    localStorage.setItem('vpa_parques', JSON.stringify(parques));
  },
  agregarParque(parque) {
    const parques = DB.getParques();
    parque.id = Date.now();
    parque.fecha = new Date().toISOString().split('T')[0];
    parques.push(parque);
    DB.setParques(parques);
    return parque;
  },
  editarParque(id, datos) {
    const parques = DB.getParques().map(p => p.id == id ? { ...p, ...datos } : p);
    DB.setParques(parques);
  },
  eliminarParque(id) {
    const parques = DB.getParques().filter(p => p.id != id);
    DB.setParques(parques);
  },

  // ---- UBICACIONES ----
  getUbicaciones() {
    const data = localStorage.getItem('vpa_ubicaciones');
    if (data) return JSON.parse(data);
    const iniciales = [
      { id:1, nombre:'Suba', codigo:'LOC-11', lat:'4.7614', lng:'-74.0832', area:'100.56', estado:'activa', parques:23, descripcion:'Localidad con mayor número de parques de Bogotá.' },
      { id:2, nombre:'Kennedy', codigo:'LOC-08', lat:'4.5928', lng:'-74.1540', area:'38.65', estado:'activa', parques:17, descripcion:'Gran localidad al suroccidente con parques zonales y metropolitanos.' },
      { id:3, nombre:'Engativá', codigo:'LOC-10', lat:'4.7089', lng:'-74.1128', area:'35.88', estado:'activa', parques:15, descripcion:'Localidad occidental con humedales y reservas naturales importantes.' },
      { id:4, nombre:'Usaquén', codigo:'LOC-01', lat:'4.7026', lng:'-74.0322', area:'65.31', estado:'activa', parques:12, descripcion:'Localidad norte con parques de bolsillo y cerros orientales.' },
      { id:5, nombre:'Chapinero', codigo:'LOC-02', lat:'4.6488', lng:'-74.0623', area:'38.15', estado:'activa', parques:9, descripcion:'Localidad central con parques lineales y zonas verdes urbanas.' },
      { id:6, nombre:'Teusaquillo', codigo:'LOC-13', lat:'4.6270', lng:'-74.0884', area:'14.06', estado:'activa', parques:8, descripcion:'Hogar del Parque Simón Bolívar, el más grande de Bogotá.' },
      { id:7, nombre:'Bosa', codigo:'LOC-07', lat:'4.6198', lng:'-74.1985', area:'24.04', estado:'activa', parques:6, descripcion:'Localidad suroccidental en expansión con nuevas áreas verdes.' },
      { id:8, nombre:'Tunjuelito', codigo:'LOC-06', lat:'4.5697', lng:'-74.1361', area:'10.65', estado:'activa', parques:5, descripcion:'Localidad con el Parque El Tunal, uno de los más visitados.' },
    ];
    DB.setUbicaciones(iniciales);
    return iniciales;
  },
  setUbicaciones(ubs) {
    localStorage.setItem('vpa_ubicaciones', JSON.stringify(ubs));
  },
  agregarUbicacion(ub) {
    const ubs = DB.getUbicaciones();
    ub.id = Date.now();
    ubs.push(ub);
    DB.setUbicaciones(ubs);
    return ub;
  },
  editarUbicacion(id, datos) {
    const ubs = DB.getUbicaciones().map(u => u.id == id ? { ...u, ...datos } : u);
    DB.setUbicaciones(ubs);
  },
  eliminarUbicacion(id) {
    const ubs = DB.getUbicaciones().filter(u => u.id != id);
    DB.setUbicaciones(ubs);
  },

  // ---- RESET ----
  resetTodo() {
    localStorage.removeItem('vpa_parques');
    localStorage.removeItem('vpa_ubicaciones');
  }
};
