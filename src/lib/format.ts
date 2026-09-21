export const brl = (v: number) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')
export const fmtDateTime = (d: string) => new Date(d).toLocaleString('pt-BR')