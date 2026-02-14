const THEME_LABELS: Record<string, string> = {
  "Casa e Escritorio": "Casa e Escritório",
  "Casa e Escritório": "Casa e Escritório",
  "Beleza e Saude": "Beleza e Saúde",
  "Beleza e Saúde": "Beleza e Saúde",
}

export function formatThemeLabel(theme: string) {
  return THEME_LABELS[theme] ?? theme
}
