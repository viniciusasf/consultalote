import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import { gerarOrcamentoPdf, baixarPdf, compartilharPdf } from '../utils/gerarOrcamentoPdf';
import { TAXAS_FIXAS, TOTAL_TAXAS_FIXAS } from '../utils/orcamentoCalculo';

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number.isFinite(val) ? val : 0
  );

// Componente controlado: o estado da simulação (percentuais, prazo e o
// resultado calculado) vive no LoteDetailModal, para que o card de
// financiamento no topo do modal e este simulador mostrem sempre os
// mesmos valores.
export default function OrcamentoSimulador({
  lote,
  open,
  percEntrada,
  onPercEntradaChange,
  taxaJurosMensal,
  onTaxaJurosMensalChange,
  prazoMeses,
  onPrazoMesesChange,
  calculo,
}) {
  const valorLote = lote.valor_base;
  const [gerandoPdf, setGerandoPdf] = useState(null); // null | 'baixar' | 'compartilhar'
  const [erroPdf, setErroPdf] = useState(null);

  const nomeArquivo = `orcamento-quadra-${lote.quadra}-lote-${lote.lote}.pdf`;

  const gerarDoc = () =>
    gerarOrcamentoPdf({
      lote,
      percEntrada,
      taxaJurosMensal,
      prazoMeses,
      valorLote,
      taxasFixas: TAXAS_FIXAS,
      totalTaxas: TOTAL_TAXAS_FIXAS,
      ...calculo,
    });

  const handleBaixarPdf = async () => {
    setErroPdf(null);
    setGerandoPdf('baixar');
    try {
      const doc = await gerarDoc();
      baixarPdf(doc, nomeArquivo);
    } catch (e) {
      setErroPdf('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGerandoPdf(null);
    }
  };

  const handleCompartilharPdf = async () => {
    setErroPdf(null);
    setGerandoPdf('compartilhar');
    try {
      const doc = await gerarDoc();
      await compartilharPdf(doc, nomeArquivo);
    } catch (e) {
      setErroPdf('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGerandoPdf(null);
    }
  };

  return (
    <Collapse in={open} unmountOnExit>
      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Outfit, sans-serif' }}>
        Simulador de Orçamento
      </Typography>

      {/* Campos de entrada */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="% Entrada"
            type="number"
            size="small"
            fullWidth
            value={percEntrada}
            onChange={(e) => onPercEntradaChange(e.target.value)}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            inputProps={{ min: 0, max: 100, step: 0.5 }}
            id="input-orcamento-perc-entrada"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Taxa de Juros Mensal"
            type="number"
            size="small"
            fullWidth
            value={taxaJurosMensal}
            onChange={(e) => onTaxaJurosMensalChange(e.target.value)}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            inputProps={{ min: 0, step: 0.0001 }}
            id="input-orcamento-taxa-juros"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Prazo, em Meses"
            type="number"
            size="small"
            fullWidth
            value={prazoMeses}
            onChange={(e) => onPrazoMesesChange(e.target.value)}
            inputProps={{ min: 1, step: 1 }}
            id="input-orcamento-prazo-meses"
          />
        </Grid>
      </Grid>

      {/* Resultado do cálculo */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Valor do Lote
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {formatCurrency(valorLote)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Valor Entrada
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {formatCurrency(calculo.valorEntrada)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Valor Financiado
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {formatCurrency(calculo.valorFinanciado)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Pagamento Mensal
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {formatCurrency(calculo.pagamentoMensal)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Número de Pagamentos
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {calculo.numeroPagamentos}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={0}
            sx={{ p: 2, bgcolor: 'primary.light', color: '#ffffff', borderRadius: 2 }}
          >
            <Typography variant="caption" sx={{ opacity: 0.9 }} display="block">
              Parcela + Taxas
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {formatCurrency(calculo.pagamentoComTaxas)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Detalhamento das taxas fixas mensais */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
          Taxas Mensais Fixas
        </Typography>
        <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
          {TAXAS_FIXAS.map((taxa) => (
            <Box key={taxa.label}>
              <Typography variant="caption" color="text.secondary" display="block">
                {taxa.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatCurrency(taxa.valor)}
              </Typography>
            </Box>
          ))}
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Total
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {formatCurrency(TOTAL_TAXAS_FIXAS)}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Exportação do orçamento em PDF */}
      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            color="primary"
            startIcon={gerandoPdf === 'baixar' ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
            onClick={handleBaixarPdf}
            disabled={!!gerandoPdf}
            id="btn-baixar-orcamento-pdf"
          >
            {gerandoPdf === 'baixar' ? 'Gerando PDF...' : 'Baixar PDF'}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={gerandoPdf === 'compartilhar' ? <CircularProgress size={18} color="inherit" /> : <ShareIcon />}
            onClick={handleCompartilharPdf}
            disabled={!!gerandoPdf}
            id="btn-compartilhar-orcamento-pdf"
          >
            {gerandoPdf === 'compartilhar' ? 'Gerando PDF...' : 'Compartilhar (WhatsApp e outros)'}
          </Button>
        </Stack>
        {erroPdf && (
          <Typography variant="caption" color="error">
            {erroPdf}
          </Typography>
        )}
      </Box>
    </Collapse>
  );
}
