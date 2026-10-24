function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export function buildVerificationEmail(name: string, url: string) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(url);
  return {
    subject: "Verifica tu correo en EntregaPyme",
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#172033"><h1 style="color:#175cd3">EntregaPyme</h1><p>Hola, ${safeName}.</p><p>Confirma que este correo te pertenece para activar las operaciones de tu cuenta.</p><p><a href="${safeUrl}" style="display:inline-block;background:#175cd3;color:white;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">Verificar correo</a></p><p style="font-size:13px;color:#667085">El enlace vence en una hora. Si no creaste esta cuenta, ignora este mensaje.</p></div>`,
  };
}
