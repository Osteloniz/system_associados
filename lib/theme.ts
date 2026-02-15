const THEME_LABELS: Record<string, string> = {
  "Casa e Escritorio": "Casa e Escritório",
  "Casa e Escritório": "Casa e Escritório",
  "Beleza e Saude": "Beleza e Saúde",
  "Beleza e Saúde": "Beleza e Saúde",
  Viagem: "Infantil (Bebês)",
  "Infantil (bebes)": "Infantil (Bebês)",
  "Infantil (Bebes)": "Infantil (Bebês)",
  "Infantil (Bebês)": "Infantil (Bebês)",
}

export function formatThemeLabel(theme: string) {
  return THEME_LABELS[theme] ?? theme
}
