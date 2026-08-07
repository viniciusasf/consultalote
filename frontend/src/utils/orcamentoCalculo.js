// Taxas mensais fixas cobradas independente do valor financiado
// (conservação da área, serviço "Slim", melhoramentos e transporte)
export const TAXAS_FIXAS = [
  { label: 'Conservação', valor: 440.03 },
  { label: 'Slim', valor: 107.0 },
  { label: 'Melhoramento', valor: 245.47 },
  { label: 'Transporte', valor: 13.0 },
];
export const TOTAL_TAXAS_FIXAS = TAXAS_FIXAS.reduce((soma, t) => soma + t.valor, 0);

export const ORCAMENTO_DEFAULTS = {
  percEntrada: 2,
  // 0,3312% a.m. é a taxa efetiva usada pela planilha oficial (o "0,33%" exibido lá é arredondado)
  taxaJurosMensal: 0.3312,
  prazoMeses: 180,
};

// Fórmula compartilhada entre o Simulador de Orçamento e o card de
// financiamento do modal de detalhes — os dois precisam exibir exatamente
// o mesmo resultado a partir do mesmo estado.
export function calcularOrcamento({ valorLote, percEntrada, taxaJurosMensal, prazoMeses, totalTaxasFixas = TOTAL_TAXAS_FIXAS }) {
  const entrada = Math.max(0, Math.min(100, Number(percEntrada) || 0)) / 100;
  const juros = Math.max(0, Number(taxaJurosMensal) || 0) / 100;
  const prazo = Math.max(0, Math.trunc(Number(prazoMeses) || 0));
  const base = Number(valorLote) || 0;

  const valorEntrada = base * entrada;
  const valorFinanciado = base - valorEntrada;

  let pagamentoMensal = 0;
  if (prazo > 0) {
    pagamentoMensal =
      juros > 0
        ? (valorFinanciado * juros) / (1 - Math.pow(1 + juros, -prazo))
        : valorFinanciado / prazo;
  }

  return {
    valorEntrada,
    valorFinanciado,
    pagamentoMensal,
    numeroPagamentos: prazo,
    pagamentoComTaxas: pagamentoMensal + totalTaxasFixas,
  };
}
