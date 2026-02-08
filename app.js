// JOIN · Control de Obra
let data = JSON.parse(localStorage.getItem("joinData")) || [];

function guardar() {
  localStorage.setItem("joinData", JSON.stringify(data));
}

/* ========= SECTORES ========= */
function crearSector() {
  const nombre = prompt("Nombre del sector (ej: Piso 3 / Áreas Generales)");
  if (!nombre) return;
  data.push({ nombre, zonas: [] });
  guardar(); render();
}

function borrarSector(i) {
  if (!confirm("¿Eliminar sector completo?")) return;
  data.splice(i, 1);
  guardar(); render();
}

/* ========= ZONAS ========= */
function crearZona(sectorIndex) {
  const nombre = prompt("Nombre de la zona");
  if (!nombre) return;
  data[sectorIndex].zonas.push({ nombre, actividades: [] });
  guardar(); render();
}

function borrarZona(sectorIndex, zonaIndex) {
  if (!confirm("¿Eliminar zona y actividades?")) return;
  data[sectorIndex].zonas.splice(zonaIndex, 1);
  guardar(); render();
}

/* ========= ACTIVIDADES ========= */
function crearActividad(s, z) {
  const nombre = prompt("Nombre de la actividad");
  if (!nombre) return;

  const acts = data[s].zonas[z].actividades;
  acts.push({
    nombre,
    estado: "PE",
    avance: 0,
    comentario: "",
    foto: null,
    fecha: new Date().toLocaleDateString()
  });

  guardar(); render();
}

function borrarActividad(s, z, a) {
  if (!confirm("¿Eliminar actividad?")) return;
  data[s].zonas[z].actividades.splice(a, 1);
  guardar(); render();
}

function cambiarEstado(s, z, a, estado) {
  const act = data[s].zonas[z].actividades[a];
  act.estado = estado;
  act.avance = estado === "OK" ? 100 : estado === "OBS" ? 50 : 0;
  guardar(); render();
}

/* ========= FOTO ========= */
function triggerFoto(s, z, a) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment";
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      data[s].zonas[z].actividades[a].foto = ev.target.result;
      guardar(); render();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

/* ========= UI ========= */
function estadoClase(av) {
  if (av >= 100) return "verde";
  if (av >= 50) return "amarillo";
  return "rojo";
}

function render() {
  const cont = document.getElementById("zonas");
  cont.innerHTML = "";

  data.forEach((sector, s) => {
    const sec = document.createElement("div");
    sec.className = "card";
    sec.innerHTML = `
      <h2>${sector.nombre}</h2>
      <button onclick="crearZona(${s})">➕ Zona</button>
      <button onclick="borrarSector(${s})">🗑 Sector</button>
      <hr>
    `;

    sector.zonas.forEach((zona, z) => {
      const zDiv = document.createElement("div");
      zDiv.className = "zona";
      zDiv.innerHTML = `
        <h3>${zona.nombre}</h3>
        <button onclick="crearActividad(${s},${z})">➕ Actividad</button>
        <button onclick="borrarZona(${s},${z})">🗑 Zona</button>
      `;

      zona.actividades.forEach((a, i) => {
        zDiv.innerHTML += `
          <div class="actividad">
            <div>
              <strong>${a.nombre}</strong><br>
              <small>${a.fecha}</small>
            </div>

            <div class="checklist">
              <button class="chk nc ${a.estado==="PE"?"activo":""}"
                onclick="cambiarEstado(${s},${z},${i},'PE')">PE</button>
              <button class="chk obs ${a.estado==="OBS"?"activo":""}"
                onclick="cambiarEstado(${s},${z},${i},'OBS')">OBS</button>
              <button class="chk ok ${a.estado==="OK"?"activo":""}"
                onclick="cambiarEstado(${s},${z},${i},'OK')">OK</button>
            </div>

            <div>
              <button onclick="triggerFoto(${s},${z},${i})">📷 Obs</button>
              <button onclick="borrarActividad(${s},${z},${i})">🗑</button>
            </div>

            <div>
              <span class="semaforo ${estadoClase(a.avance)}"></span>
              ${a.estado === "OBS" ? "Observaciones" : a.estado}
            </div>
          </div>
        `;
      });

      sec.appendChild(zDiv);
    });

    cont.appendChild(sec);
  });
}

render();
