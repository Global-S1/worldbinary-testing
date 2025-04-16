const hoy = new Date();
const annio = hoy.getFullYear();
const mes = String(hoy.getMonth() + 1).padStart(2, '0');
const dia = String(hoy.getDate()).padStart(2, '0');

export const fechaLocal = `${annio}-${mes}-${dia}`;
