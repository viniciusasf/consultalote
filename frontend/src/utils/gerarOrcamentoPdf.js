import { jsPDF } from 'jspdf';
import logoUrl from '../../pics/logo.jpg';

const VERDE_PRIMARIO = [27, 67, 50]; // #1b4332
const DOURADO = [212, 175, 55]; // #d4af37
const CINZA_TEXTO = [99, 110, 123]; // text.secondary
const CINZA_CLARO = [244, 246, 248]; // background.default
const BRANCO = [255, 255, 255];

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number.isFinite(val) ? val : 0
  );

function carregarImagem(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function desenharCard(doc, x, y, w, h, rotulo, valor, destaque = false) {
  doc.setFillColor(...(destaque ? VERDE_PRIMARIO : CINZA_CLARO));
  doc.roundedRect(x, y, w, h, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...(destaque ? BRANCO : CINZA_TEXTO));
  doc.text(rotulo.toUpperCase(), x + 4, y + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(destaque ? 14 : 11);
  doc.setTextColor(...(destaque ? BRANCO : VERDE_PRIMARIO));
  doc.text(String(valor), x + 4, y + (destaque ? 16.5 : 14.5));
}

/**
 * Monta o PDF do orçamento simulado para um lote e retorna a instância jsPDF.
 */
export async function gerarOrcamentoPdf({
  lote,
  percEntrada,
  taxaJurosMensal,
  prazoMeses,
  valorLote,
  valorEntrada,
  valorFinanciado,
  pagamentoMensal,
  numeroPagamentos,
  taxasFixas,
  totalTaxas,
  pagamentoComTaxas,
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const largura = doc.internal.pageSize.getWidth();
  const margem = 15;
  const largContent = largura - margem * 2;
  let y = 16;

  // Cabeçalho: logo + título
  try {
    const img = await carregarImagem(logoUrl);
    const larguraLogo = 40;
    const alturaLogo = (img.naturalHeight / img.naturalWidth) * larguraLogo;
    doc.addImage(img, 'JPEG', margem, y - 4, larguraLogo, alturaLogo);
  } catch {
    // Segue sem o logo caso não seja possível carregar
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...VERDE_PRIMARIO);
  doc.text('Simulação de Orçamento', largura - margem, y + 2, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...CINZA_TEXTO);
  const dataGeracao = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());
  doc.text(`Gerado em ${dataGeracao}`, largura - margem, y + 8, { align: 'right' });

  y += 20;
  doc.setDrawColor(...DOURADO);
  doc.setLineWidth(0.8);
  doc.line(margem, y, largura - margem, y);
  y += 10;

  // Identificação do lote
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...VERDE_PRIMARIO);
  doc.text(`Quadra ${lote.quadra} — Lote ${lote.lote}`, margem, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...CINZA_TEXTO);
  const infoLote = [
    lote.gleba ? `Gleba ${lote.gleba}` : null,
    lote.area_m2 ? `${lote.area_m2.toLocaleString('pt-BR')} m²` : null,
    lote.tamanho_categoria ? `Categoria ${lote.tamanho_categoria}m²` : null,
  ]
    .filter(Boolean)
    .join('   •   ');
  doc.text(infoLote, margem, y);
  y += 10;

  // Condições utilizadas na simulação
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...VERDE_PRIMARIO);
  doc.text('Condições da Simulação', margem, y);
  y += 5;

  const gap = 5;
  const largCard3 = (largContent - gap * 2) / 3;
  const altCard = 18;

  desenharCard(doc, margem, y, largCard3, altCard, '% Entrada', `${percEntrada}%`);
  desenharCard(
    doc,
    margem + largCard3 + gap,
    y,
    largCard3,
    altCard,
    'Taxa de Juros Mensal',
    `${taxaJurosMensal}%`
  );
  desenharCard(
    doc,
    margem + (largCard3 + gap) * 2,
    y,
    largCard3,
    altCard,
    'Prazo, em Meses',
    prazoMeses
  );
  y += altCard + 10;

  // Resultado do cálculo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...VERDE_PRIMARIO);
  doc.text('Resultado', margem, y);
  y += 5;

  desenharCard(doc, margem, y, largCard3, altCard, 'Valor do Lote', formatCurrency(valorLote));
  desenharCard(
    doc,
    margem + largCard3 + gap,
    y,
    largCard3,
    altCard,
    'Valor Entrada',
    formatCurrency(valorEntrada)
  );
  desenharCard(
    doc,
    margem + (largCard3 + gap) * 2,
    y,
    largCard3,
    altCard,
    'Valor Financiado',
    formatCurrency(valorFinanciado)
  );
  y += altCard + gap;

  desenharCard(
    doc,
    margem,
    y,
    largCard3,
    altCard,
    'Pagamento Mensal',
    formatCurrency(pagamentoMensal)
  );
  desenharCard(
    doc,
    margem + largCard3 + gap,
    y,
    largCard3,
    altCard,
    'Número de Pagamentos',
    numeroPagamentos
  );
  desenharCard(
    doc,
    margem + (largCard3 + gap) * 2,
    y,
    largCard3,
    altCard,
    'Total de Taxas Mensais',
    formatCurrency(totalTaxas)
  );
  y += altCard + gap;

  // Destaque: parcela + taxas
  const altDestaque = 22;
  desenharCard(
    doc,
    margem,
    y,
    largContent,
    altDestaque,
    'Pagamento Mensal (Parcela + Taxas)',
    formatCurrency(pagamentoComTaxas),
    true
  );
  y += altDestaque + 10;

  // Detalhamento das taxas fixas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...VERDE_PRIMARIO);
  doc.text('Detalhamento das Taxas Mensais Fixas', margem, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...CINZA_TEXTO);
  taxasFixas.forEach((taxa) => {
    doc.text(taxa.label, margem, y);
    doc.text(formatCurrency(taxa.valor), largura - margem, y, { align: 'right' });
    y += 5.5;
  });
  doc.setDrawColor(...CINZA_CLARO);
  doc.setLineWidth(0.3);
  doc.line(margem, y, largura - margem, y);
  y += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...VERDE_PRIMARIO);
  doc.text('Total', margem, y);
  doc.text(formatCurrency(totalTaxas), largura - margem, y, { align: 'right' });
  y += 14;

  // Rodapé / disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...CINZA_TEXTO);
  const disclaimer =
    'Simulação gerada automaticamente para fins de referência, sem valor contratual. ' +
    'Valores sujeitos a confirmação e alteração conforme condições comerciais vigentes no momento da contratação.';
  doc.text(doc.splitTextToSize(disclaimer, largContent), margem, 280);

  return doc;
}

/**
 * Baixa o PDF ou, quando suportado (principalmente em celulares), abre o menu
 * nativo de compartilhamento — permitindo enviar direto pelo WhatsApp.
 */
export async function exportarOuCompartilharPdf(doc, nomeArquivo) {
  const blob = doc.output('blob');
  const arquivo = new File([blob], nomeArquivo, { type: 'application/pdf' });

  if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
    try {
      await navigator.share({
        files: [arquivo],
        title: 'Orçamento — Consulta de Lotes Resort',
        text: 'Segue o orçamento simulado para o lote.',
      });
      return;
    } catch (erro) {
      if (erro?.name === 'AbortError') return; // usuário cancelou o compartilhamento
      // Se o compartilhamento falhar por outro motivo, cai para o download abaixo
    }
  }

  doc.save(nomeArquivo);
}
