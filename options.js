// Opciones de la extensión: servidor, token, hora de la ronda, prueba de conexión y estado de la última ronda.
const $ = id => document.getElementById(id);

function aviso(texto, ok) {
  $("msg").textContent = texto;
  $("msg").className = ok ? "ok" : "err";
}

function normalizar(url) {
  const u = new URL(url.trim());
  if (u.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(u.hostname)) throw new Error("Tiene que ser https://");
  return u.origin;
}

const BASES = ["compra", "alquiler"];

async function cargar() {
  const c = await chrome.storage.local.get({ servidor: "", token: "", hora: "03:30", activa: true, bases: BASES });
  for (const b of BASES) $(`base-${b}`).checked = c.bases.includes(b);
  $("servidor").value = c.servidor;
  $("token").value = c.token;
  $("hora").value = c.hora;
  $("activa").checked = c.activa;
  mostrarEstado();
}

async function mostrarEstado() {
  const { ultima, ultimas, ronda } = await chrome.storage.local.get({ ultima: null, ultimas: {}, ronda: null });
  const alarma = await chrome.alarms.get("diaria");
  const lineas = [];
  if (ronda) lineas.push(`▶ Ronda ${ronda.id}${ronda.base ? ` (${ronda.base})` : ""} en curso · página actual: ${ronda.url}`);
  const porBase = BASES.filter(b => ultimas[b]);
  for (const b of porBase) {
    const u = ultimas[b];
    lineas.push(`Último resultado de ${b} (${new Date(u.fecha).toLocaleString()}): ${u.estado}\n${u.mensaje}`);
  }
  if (!porBase.length && ultima) lineas.push(`Último resultado (${new Date(ultima.fecha).toLocaleString()}): ${ultima.estado}\n${ultima.mensaje}`);
  lineas.push(alarma ? `Próxima ronda: ${new Date(alarma.scheduledTime).toLocaleString()}` : "No hay ronda programada.");
  $("estado").textContent = lineas.join("\n\n");
}

$("guardar").addEventListener("click", async () => {
  let servidor;
  try { servidor = normalizar($("servidor").value); } catch (e) { return aviso(`Servidor no válido: ${e.message}`, false); }
  // Permiso para hablar con el servidor de Inmo (se pide acá porque requiere un clic del usuario).
  const ok = await chrome.permissions.request({ origins: [`${servidor}/*`] });
  if (!ok) return aviso("Sin permiso para conectarse al servidor: no se guardó.", false);
  const bases = BASES.filter(b => $(`base-${b}`).checked);
  if (!bases.length) return aviso("Elegí al menos una base (compra o alquiler).", false);
  await chrome.storage.local.set({ servidor, token: $("token").value.trim(), hora: $("hora").value || "03:30", activa: $("activa").checked, bases });
  $("servidor").value = servidor;
  aviso("Guardado.", true);
  setTimeout(mostrarEstado, 300);
});

$("probar").addEventListener("click", async () => {
  const { servidor, token } = await chrome.storage.local.get({ servidor: "", token: "" });
  if (!servidor || !token) return aviso("Primero guardá el servidor y el token.", false);
  try {
    const r = await fetch(`${servidor}/api/navegador/ping`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) aviso(`Conectado como «${(await r.json()).usuario}».`, true);
    else aviso(r.status === 401 ? "El servidor respondió, pero el token no es válido." : `El servidor respondió ${r.status}.`, false);
  } catch (e) {
    aviso(`No se pudo conectar: ${e.message}`, false);
  }
});

$("correr").addEventListener("click", async () => {
  aviso("Pidiendo una ronda al servidor…", true);
  await chrome.runtime.sendMessage("correr");
  aviso("Listo: mirá el estado abajo.", true);
  mostrarEstado();
});

$("cancelar").addEventListener("click", async () => {
  await chrome.runtime.sendMessage("cancelar");
  aviso("Ronda cancelada.", true);
  mostrarEstado();
});

chrome.storage.onChanged.addListener(mostrarEstado);
$("version").textContent = chrome.runtime.getManifest().version;
cargar();
