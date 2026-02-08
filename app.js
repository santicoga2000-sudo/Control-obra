// app.js - CHECKLIST JOIN (localStorage)
let zonas = JSON.parse(localStorage.getItem("zonas")) || [];

function guardar() {
  localStorage.setItem("zonas", JSON.stringify(zonas));
}

function crearZona() {
  const nombre = document.getElementById("zonaNombre").value.trim();
  if (!nombre) return alert("Ingresa el nombre de la zona");
  zonas.push({ nombre, actividades: [] });
  document.getElementById("zonaNombre").value = "";
  guardar(); render();
}

function crearActividad(zIndex, inputId) {
  const nombre = document.getElementById(inputId).value.trim();
  if (!nombre) return;
  const acts = zonas[zIndex].actividades;
  acts.push({
    nombre,
    peso: 0,
    avance: 0,
    estado: "NC",       // NC | OBS | OK
    comentario: "",
    foto: null,
    fecha: new Date().toLocaleDateString()
  });
  // Recalcular pesos iguales
  const peso = Math.round(100 / acts.length);
  acts.forEach(a => a.peso = peso);
  document.getElementById(inputId).value = "";
  guardar(); render();
}

function cambiarEstado(zIndex, aIndex, nuevoEstado) {
  const act = zonas[zIndex].actividades[aIndex];
  act.estado = nuevoEstado;
  if (nuevoEstado === "OK") act.avance = 100;
  else if (nuevoEstado === "OBS") act.avance = 50;
  else act.avance = 0;
  guardar(); render();
}

// abrir "camara" -> usamos input file con capture para móviles
function triggerFoto(zIndex, aIndex) {
  const fileId = `file-${zIndex}-${aIndex}`;
  let input = document.getElementById(fileId);
  if (!input) {
    input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // en móviles intenta abrir cámara
    input.id = fileId;
    input.style.display = "none";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        // guarda dataURL (cuidado con tamaño, es demo)
        zonas[zIndex].actividades[aIndex].foto = ev.target.result;
        // opcional: pedir comentario
        const c = prompt("Comentario relacionado con la foto (opcional):", zonas[zIndex].actividades[aIndex].comentario || "");
        if (c !== null) zonas[zIndex].actividades[aIndex].comentario = c;
        guardar(); render();
        // mostrar modal preview
        showFotoModal(ev.target.result, file.name);
      };
      reader.readAsDataURL(file);
    };
    document.body.appendChild(input);
  }
  input.click();
}

// modal preview
function showFotoModal(dataUrl, meta) {
  const modal = document.getElementById("fotoModal");
  const img = document.getElementById("fotoPreview");
  const metaP = document.getElementById("fotoMeta");
  img.src = dataUrl;
  metaP.textContent = meta || "";
  modal.style.display = "block";
}

document.getElementById && (document.getElementById("btnCrearZona").onclick = crearZona);
document.getElementById && (document.getElementById("closeModal")?.addEventListener("click", () => {
  document.getElementById("fotoModal").style.display = "none";
}));
document.getElementById && (document.getElementById("modalCloseBtn")?.addEventListener("click", () => {
  document.getElementById("fotoModal").style.display = "none";
}));

function estadoPorAvance(avance) {
  if (avance >= 100) return "verde";
  if (avance >= 50) return "amarillo";
  return "rojo";
}

function render() {
  const cont = document.getElementById("zonas");
  cont.innerHTML = "";

  zonas.forEach((zona, zIndex) => {
    // calcular avance ponderado zona
    let avanceZona = 0;
    zona.actividades.forEach(a => {
      avanceZona += (a.avance * (a.peso || 0)) / 100;
    });

    const div = document.createElement("div");
    div.className = "card zona";

    // Header
    const header = document.createElement("div");
    header.className = "zona-header";
    header.innerHTML = `<h2>${zona.nombre}</h2><div class="zona-avance">${avanceZona.toFixed(1)}%</div>`;
    div.appendChild(header);

    // actividades (MANTENER EL ORDEN DE CREACION: NO HACER SORT)
    zona.actividades.forEach((a, i) => {
      const actDiv = document.createElement("div");
      actDiv.className = "actividad";

      const info = document.createElement("div");
      info.innerHTML = `<strong>${a.nombre}</strong><br><small class="small">${a.fecha}</small><br>
        <div class="small">Peso: ${a.peso}% · Avance: ${a.avance}%</div>`;

      // columna de checklist buttons
      const chContainer = document.createElement("div");
      chContainer.className = "checklist";

      const btnNC = document.createElement("button");
      btnNC.className = `chk nc ${a.estado === "NC" ? "activo" : ""}`;
      btnNC.textContent = "NC";
      btnNC.onclick = () => cambiarEstado(zIndex, i, "NC");

      const btnOBS = document.createElement("button");
      btnOBS.className = `chk obs ${a.estado === "OBS" ? "activo" : ""}`;
      btnOBS.textContent = "OBS";
      btnOBS.onclick = () => cambiarEstado(zIndex, i, "OBS");

      const btnOK = document.createElement("button");
      btnOK.className = `chk ok ${a.estado === "OK" ? "activo" : ""}`;
      btnOK.textContent = "OK";
      btnOK.onclick = () => cambiarEstado(zIndex, i, "OK");

      chContainer.appendChild(btnNC);
      chContainer.appendChild(btnOBS);
      chContainer.appendChild(btnOK);

      // columna de foto/obs button
      const photoCol = document.createElement("div");
      const btnPhoto = document.createElement("button");
      btnPhoto.className = "btn-photo";
      btnPhoto.textContent = a.foto ? "Ver Foto" : "Foto / Obs";
      btnPhoto.onclick = () => {
        if (a.foto) showFotoModal(a.foto, a.comentario || "");
        else triggerFoto(zIndex, i);
      };
      const btnTextObs = document.createElement("button");
      btnTextObs.style.marginLeft = "8px";
      btnTextObs.textContent = "Comentario";
      btnTextObs.onclick = () => {
        const c = prompt("Observación:", a.comentario || "");
        if (c !== null) {
          zonas[zIndex].actividades[i].comentario = c;
          guardar(); render();
        }
      };
      photoCol.appendChild(btnPhoto);
      photoCol.appendChild(btnTextObs);

      // columna semaforo/estado
      const estadoCol = document.createElement("div");
      const dot = document.createElement("span");
      dot.className = `semaforo ${estadoPorAvance(a.avance)}`;
      estadoCol.appendChild(dot);
      const txt = document.createElement("span");
      txt.textContent = a.avance >= 100 ? "Completado" : (a.avance >= 50 ? "Observado" : "Pendiente");
      estadoCol.appendChild(document.createElement("br"));
      estadoCol.appendChild(txt);

      actDiv.appendChild(info);
      actDiv.appendChild(chContainer);
      actDiv.appendChild(photoCol);
      actDiv.appendChild(estadoCol);

      div.appendChild(actDiv);
    });

    // Añadir input nuevo actividad
    const inId = `act-${zIndex}`;
    const addInput = document.createElement("input");
    addInput.id = inId;
    addInput.placeholder = "Nueva actividad";
    addInput.style.marginTop = "8px";
    const addBtn = document.createElement("button");
    addBtn.textContent = "Agregar actividad";
    addBtn.onclick = () => crearActividad(zIndex, inId);

    div.appendChild(addInput);
    div.appendChild(addBtn);

    cont.appendChild(div);
  });
}

// inicializar
render();
