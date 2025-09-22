/* Definition of a line, copied from dotenv */
const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;
let envFile, envStr;

/* Read env file */
try {
  envFile = $os.readFile(".env")
  envStr = String.fromCharCode(...envFile).replace(/\r\n?/gm, "\n");
} catch (e) {
  console.error(e)
  // No .env file, noop
}

if (envFile && envStr) {
  /* Go through each line */
  let match;
  while ((match = LINE.exec(envStr)) != null) {
    const key = match[1];
    let value = (match[2] || "").trim();

    /* Check if double quoted */
    const maybeQuote = value[0];

    /* Remove surrounding quotes */
    value = value.replace(/^(['"`])([\s\S]*)\1$/gm, "$2");

    /* Expand newlines if double quoted */
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, "\n");
      value = value.replace(/\\r/g, "\r");
    }

    process.env[key] = value;
  }
}
