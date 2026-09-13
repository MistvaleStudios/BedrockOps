// prettier-ignore
const minecraftColours: Record<string, string> = {
  '0': '\x1b[38;2;0;0;0m',       // Black
  '1': '\x1b[38;2;0;0;170m',     // Dark Blue
  '2': '\x1b[38;2;0;170;0m',     // Dark Green
  '3': '\x1b[38;2;0;170;170m',   // Dark Aqua
  '4': '\x1b[38;2;170;0;0m',     // Dark Red
  '5': '\x1b[38;2;170;0;170m',   // Dark Purple
  '6': '\x1b[38;2;255;170;0m',   // Gold
  '7': '\x1b[38;2;170;170;170m', // Gray
  '8': '\x1b[38;2;85;85;85m',    // Dark Gray
  '9': '\x1b[38;2;85;85;255m',   // Blue
  'a': '\x1b[38;2;85;255;85m',   // Bright Green
  'b': '\x1b[38;2;85;255;255m',  // Aqua
  'c': '\x1b[38;2;255;85;85m',   // Red
  'd': '\x1b[38;2;255;85;255m',  // Light Purple
  'e': '\x1b[38;2;255;255;85m',  // Yellow
  'f': '\x1b[38;2;255;255;255m', // White
  'g': '\x1b[38;2;221;214;5m',   // Minecoin Gold
  'h': '\x1b[38;2;227;212;209m', // Quartz
  'i': '\x1b[38;2;206;202;202m', // Iron
  'j': '\x1b[38;2;68;58;59m',    // Netherite
  'm': '\x1b[38;2;151;22;7m',    // Redstone
  'n': '\x1b[38;2;180;104;77m',  // Copper
  'p': '\x1b[38;2;222;177;45m',  // Gold Material
  'q': '\x1b[38;2;71;160;54m',   // Emerald
  's': '\x1b[38;2;44;171;169m',  // Diamond
  't': '\x1b[38;2;33;73;123m',   // Lapis
  'u': '\x1b[38;2;154;92;198m',  // Amethyst
  'l': '\x1b[1m',                // Bold
  'o': '\x1b[3m',                // Italic
  'r': '\x1b[0m'                 // Reset
};

export function applyMinecraftColours(text: string): string {
	const fixedText = text.replace(/\. Please check that the command exists/g, '§r. Please check that the command exists');
	const formatted = fixedText.replace(/(?:\xC2)?\xA7([0-9a-z])/gi, (_, code) => {
		return minecraftColours[code.toLowerCase()] || '';
	});
	const cleaned = formatted.replace(/(?:\xC2)?\xA7[kmn]/gi, '');

	return cleaned.includes('\x1b') ? cleaned + '\x1b[0m' : cleaned;
}
