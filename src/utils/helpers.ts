export function formatPhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');

  if (raw.endsWith('@g.us')) {
    return raw;
  }

  // Handle international format with +
  if (raw.startsWith('+')) {
    return `${digits}@s.whatsapp.net`;
  }

  // Convert local number to international WhatsApp ID (assuming Indonesia as default)
  let formatted = digits;
  if (formatted.startsWith('0')) {
    formatted = '62' + formatted.slice(1);
  } else if (formatted.startsWith('8')) {
    formatted = '62' + formatted;
  }

  return `${formatted}@s.whatsapp.net`;
}