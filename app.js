let zonas = JSON.parse(localStorage.getItem("zonas")) || [];

function guardar() {
  localStorage.setItem("zonas", JSON.stringify(zonas));
}

function crearZona() {
  const nombre = document.getElementById("zonaNombre").value;
  if (!nombre) return;

  zonas.push({
    nombre,
    actividades: []
  });

  document.getElementById("zonaNombre").value = "";
  guardar();
  render();
}

function crearActividad(zIndex, inputId) {
  const nombre = document.getElementById(inputId).value;
  if (!nombre) return;

  const acts = zonas[zIndex].actividades;

  acts.push({
    nombre,
    peso: 0,
    avance: 0,
    comentario: "",
    fecha: new Date().toLocaleDateString()
  });

  // PESOS IGUALES AUTOMÁTICOS
  const peso = Math.round(100 / acts.length);
  acts.forEach(a => a.peso = peso);

  guardar();
  render();
}

function estado(avance) {
  if (avance >= 100) return "verde";
  if (avance > 0) return "amarillo";
  return "rojo";
}

function render() {
  const cont = document.getElementById("zonas");
  cont.innerHTML = "";

  zonas.forEach((zona, zIndex) => {
    let avanceZona = 0;

    zona.actividades.forEach(a => {
      avanceZona += (a.avance * a.peso) / 100;
    });

    const div = document.createElement("div");
    div.className = "card zona";

    div.innerHTML = `
      <div class="zona-header">
        <h2>${zona.nombre}</h2>
        <div class="zona-avance">${avanceZona.toFixed(1)}%</div>
      </div>

      ${zona.actividades
        .sort((a,b)=>a.avance-b.avance)
        .map((a,i)=>`
        <div class="actividad">
          <div>
            <strong>${a.nombre}</strong><br>
            <small>${a.fecha}</small><br>
            <textarea placeholder="Observación"
              onchange="zonas[${zIndex}].actividades[${i}].comentario=this.value;guardar()">${a.comentario}</textarea>
          </div>

          <div>
            <input type="checkbox"
              ${a.avance>=100?"checked":""}
              onchange="
                zonas[${zIndex}].actividades[${i}].avance=this.checked?100:0;
                guardar();render();
              "> Hecho
          </div>

          <div>
            <span class="semaforo ${estado(a.avance)}"></span>
            ${a.avance>=100?"Completado":"Pendiente"}
          </div>
        </div>
      `).join("")}

      <input id="act-${zIndex}" placeholder="Nueva actividad">
      <button onclick="crearActividad(${zIndex}, 'act-${zIndex}')">Agregar actividad</button>
    `;

    cont.appendChild(div);
  });
}

render();
