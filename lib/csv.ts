function escapeCsvValue(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function stringifyCsv(rows: string[][]) {
  const content = rows.map((row) => row.map((value) => escapeCsvValue(value ?? "")).join(",")).join("\n")
  return `\uFEFF${content}`
}

function detectDelimiter(text: string) {
  let commas = 0
  let semicolons = 0
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === "\n") break

    if (inQuotes) {
      if (char === '"' && next === '"') {
        i += 1
      } else if (char === '"') {
        inQuotes = false
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === ",") commas += 1
    if (char === ";") semicolons += 1
  }

  return semicolons > commas ? ";" : ","
}

export function parseCsv(text: string) {
  const rows: string[][] = []
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/^\uFEFF/, "")
  const delimiter = detectDelimiter(normalized)

  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i]
    const next = normalized[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === delimiter) {
      row.push(field)
      field = ""
      continue
    }

    if (char === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
      continue
    }

    field += char
  }

  row.push(field)
  rows.push(row)

  while (rows.length > 0 && rows[rows.length - 1].every((value) => value.trim() === "")) {
    rows.pop()
  }

  return rows
}
