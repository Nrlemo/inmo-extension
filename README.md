# Inmo · ronda por navegador

Extensión para Vivaldi, Chrome, Edge o cualquier navegador basado en Chromium. Una vez por día abre tus búsquedas
de Zonaprop en una ventana minimizada de **tu propio navegador**, página por página, y las carga en tu servidor de
[Inmo](https://github.com/Nrlemo/inmo-scrapper). Es **la forma de traer avisos a Inmo**: el servidor no pide páginas
a los portales, porque la protección anti-bots (Cloudflare) bloquea a los clientes que no son un navegador real.

- **El servidor conduce la ronda:** la extensión sólo abre, espera, lee y envía. Qué búsquedas recorrer, qué página
  sigue y cuánto esperar lo decide Inmo según su `profiles.yaml`, así que los cambios de configuración no requieren
  tocar la extensión.
- **Cortés con el portal:** tope de 5 páginas por búsqueda (`robots.txt`), pausas aleatorias de 30 s a 2,5 min,
  una ronda por día como máximo (intervalo mínimo de 20 h) y 24 h de espera tras un bloqueo.
- **Sólo da de baja** un aviso después de una ronda completa.

Requiere Inmo **1.0.0** o posterior.

## Instalación

1. Descargá `inmo-extension-X.Y.Z.zip` de la [última release](https://github.com/Nrlemo/inmo-extension/releases/latest)
   y descomprimilo en una carpeta **que no vayas a borrar** (por ejemplo `~/inmo-extension`). El navegador carga la
   extensión desde ahí cada vez que arranca.
   También podés clonar el repo: `git clone https://github.com/Nrlemo/inmo-extension.git`.
2. En Inmo: **Estado → Ronda por navegador → Generar token**. Copialo: se muestra una sola vez.
3. En Vivaldi, abrí `vivaldi://extensions` (en Chrome, `chrome://extensions`; en Edge, `edge://extensions`) y activá
   **Modo de desarrollador**.
4. **Cargar extensión descomprimida** y elegí la carpeta del paso 1 (la que tiene `manifest.json`).
5. Se abre la pantalla de opciones. Si no, tocá el ícono de Inmo en la barra. Completá:
   - **Servidor:** la dirección con la que abrís Inmo, por ejemplo `https://inmo.midominio.com`. Al guardar, el
     navegador pide permiso para conectarse a ese servidor.
   - **Token:** el del paso 2.
   - **Hora de la ronda diaria:** por defecto 03:30, más una demora aleatoria de hasta 20 min.
6. **Probar conexión** tiene que responder «Conectado como …».
7. Opcional: **Correr ronda ahora** para ver la primera ronda. El avance aparece también en Inmo → Estado.
   A mano no hace falta esperar las 20 h desde la última ronda, pero sí las 24 h de espera tras un bloqueo del portal.

## Cómo se comporta

- Necesita el **navegador abierto**. Si a la hora programada estaba cerrado, la ronda corre unos minutos después de
  abrirlo. Si se cerró a mitad de una ronda, la retoma donde estaba. Si pasan más de 30 min sin noticias, el servidor
  la da por interrumpida.
- Abre las páginas en una **ventana minimizada**, que se cierra sola al terminar. Podés seguir usando el navegador,
  pero no cierres esa ventana mientras corre.
- Si Zonaprop muestra la verificación de Cloudflare, espera hasta ~30 s a que se resuelva sola. Si no se resuelve, la
  ronda se registra como **bloqueada** y no se reintenta hasta que pase el cooldown (24 h). Si esto pasa seguido,
  entrá a Zonaprop a mano desde este navegador y resolvé la verificación.
- Una ronda completa tarda entre 30 y 60 min según la cantidad de zonas.
- Una ronda se puede cancelar desde las opciones de la extensión o desde Inmo → Estado. Lo recibido queda guardado,
  pero no se da de baja ningún aviso.

## Actualizar

1. Descargá el `.zip` de la versión nueva y descomprimilo **en la misma carpeta**, reemplazando los archivos (con
   git: `git pull`).
2. En `vivaldi://extensions` tocá **Recargar** (↻) en la tarjeta de Inmo.

La configuración se conserva. Si en cambio cargás la extensión desde otra carpeta, el navegador la toma como una
extensión nueva y hay que volver a completar servidor y token. La versión instalada figura al pie de las opciones.

## Detrás de authentik

Si Inmo está protegido con authentik (forward auth), `/api/navegador/` tiene que saltear el forward auth: la
extensión no tiene sesión de authentik y se autentica con su token. El `docker-compose.authentik.yml` de Inmo ya lo
hace; con otro proxy, ver [`deploy/authentik.md`](https://github.com/Nrlemo/inmo-scrapper/blob/main/deploy/authentik.md).
