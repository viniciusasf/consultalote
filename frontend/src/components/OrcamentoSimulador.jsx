import React, { useMemo, useState } from 'react';
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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { gerarOrcamentoPdf, exportarOuCompartilharPdf } from '../utils/gerarOrcamentoPdf';

// Taxas mensais fixas cobradas independente do valor financiado
// (conservação da área, serviço "Slim", melhoramentos e transporte)
const TAXAS_FIXAS = [
  { label: 'Conservação', valor: 440.03 },
  { label: 'Slim', valor: 107.0 },
  { label: 'Melhoramento', valor: 245.47 },
  { label: 'Transporte', valor: 13.0 },
];
const TOTAL_TAXAS_FIXAS = TAXAS_FIXAS.reduce((soma, t) => soma + t.valor, 0);

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number.isFinite(val) ? val : 0
  );

export default function OrcamentoSimulador({ lote, open }) {
  const valorLote = lote.valor_base;
  const [percEntrada, setPercEntrada] = useState(2);
  // 0,3312% a.m. é a taxa efetiva usada pela planilha oficial (o "0,33%" exibido lá é arredondado)
  const [taxaJurosMensal, setTaxaJurosMensal] = useState(0.3312);
  const [prazoMeses, setPrazoMeses] = useState(180);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [erroPdf, setErroPdf] = useState(null);

  const calculo = useMemo(() => {
    const entrada = Math.max(0, Math.min(100, Number(percEntrada) || 0)) / 100;
    const juros = Math.max(0, Number(taxaJurosMensal) || 0) / 100;
    const prazo = Math.max(0, Math.trunc(Number(prazoMeses) || 0));

    const valorEntrada = valorLote * entrada;
    const valorFinanciado = valorLote - valorEntrada;

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
      pagamentoComTaxas: pagamentoMensal + TOTAL_TAXAS_FIXAS,
    };
  }, [valorLote, percEntrada, taxaJurosMensal, prazoMeses]);

  const handleExportarPdf = async () => {
    setErroPdf(null);
    setGerandoPdf(true);
    try {
      const doc = await gerarOrcamentoPdf({
        lote,
        percEntrada,
        taxaJurosMensal,
        prazoMeses,
        valorLote,
        taxasFixas: TAXAS_FIXAS,
        totalTaxas: TOTAL_TAXAS_FIXAS,
        ...calculo,
      });
      await exportarOuCompartilharPdf(doc, `orcamento-quadra-${lote.quadra}-lote-${lote.lote}.pdf`);
    } catch (e) {
      setErroPdf('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGerandoPdf(false);
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
            onChange={(e) => setPercEntrada(e.target.value)}
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
            onChange={(e) => setTaxaJurosMensal(e.target.value)}
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
            onChange={(e) => setPrazoMeses(e.target.value)}
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
        <Button
          variant="contained"
          color="primary"
          startIcon={gerandoPdf ? <CircularProgress size={18} color="inherit" /> : <PictureAsPdfIcon />}
          onClick={handleExportarPdf}
          disabled={gerandoPdf}
          id="btn-exportar-orcamento-pdf"
        >
          {gerandoPdf ? 'Gerando PDF...' : 'Exportar / Enviar PDF'}
        </Button>
        {erroPdf && (
          <Typography variant="caption" color="error">
            {erroPdf}
          </Typography>
        )}
      </Box>
    </Collapse>
  );
}
