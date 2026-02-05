let zonas = JSON.parse(localStorage.getItem("zonas")) || [];

function saveData() {
  localStorage.setItem("zonas", JSON.stringify(zonas));
}

function addZona() {
  const nombre = prompt("Nombre de la zona:");
  if (!nombre) return;

  zonas.push({
    nombre,
    actividades: []
  });

  saveData();
  render();
}

function addActividad(zIndex) {
  const nombre = prompt("Nombre de la actividad:");
  if (!nombre) return;

  const acts = zonas[zIndex].actividades;

  acts.push({
    nombre,
    peso: 0,
    avance: 0,
    estado: "Pendiente",
    comentario: ""
  });

  // 🔑 REPARTO AUTOMÁTICO DE PESOS
  const pesoIgual = Math.round(100 / acts.length);
  acts.forEach(a => a.peso = pesoIgual);

  saveData();
  render();
}

function semaforoEstado(avance) {
  if (avance >= 100) return "verde";
  if (avance > 0) return "amarillo";
  return "rojo";
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  zonas.forEach((zona, zIndex) => {
    let avanceZona = 0;

    zona.actividades.forEach(a => {
      avanceZona += (a.avance * a.peso) / 100;
    });

    const zonaDiv = document.createElement("div");
    zonaDiv.className = "zona";

    zonaDiv.innerHTML = `
      <div class="zona-header">
        <h2>${zona.nombre}</h2>
        <div class="zona-avance">${avanceZona.toFixed(1)}%</div>
      </div>

      ${zona.actividades.map((a, i) => `
        <div class="actividad">
          <div>
            <strong>${a.nombre}</strong><br>
            <textarea placeholder="Comentario"
              onchange="zonas[${zIndex}].actividades[${i}].comentario=this.value;saveData()">${a.comentario}</textarea>
          </div>

          <input type="number" value="${a.peso}"
            onchange="zonas[${zIndex}].actividades[${i}].peso=this.value;saveData();render()">

          <input type="number" value="${a.avance}"
            onchange="zonas[${zIndex}].actividades[${i}].avance=this.value;saveData();render()">

          <div class="estado">
            <span class="semaforo ${semaforoEstado(a.avance)}"></span>
            ${a.avance >= 100 ? "Hecho" : "En proceso"}
          </div>
        </div>
      `).join("")}

      <button class="btn-small" onclick="addActividad(${zIndex})">+ Agregar actividad</button>
    `;

    app.appendChild(zonaDiv);
  });
}

render();
