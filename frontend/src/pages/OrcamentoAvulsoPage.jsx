import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, TextField, InputAdornment, Button, Stack, CircularProgress, Divider, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import { calcularOrcamento, TAXAS_FIXAS, ORCAMENTO_DEFAULTS } from '../utils/orcamentoCalculo';
import { gerarOrcamentoPdf, baixarPdf, compartilharPdf } from '../utils/gerarOrcamentoPdf';

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number.isFinite(val) ? val : 0
  );

const formatToCurrencyInput = (value) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const number = Number(digits) / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const unmaskCurrency = (value) => {
  if (!value) return 0;
  const digits = value.replace(/\D/g, '');
  return Number(digits) / 100;
};

export default function OrcamentoAvulsoPage() {
  const navigate = useNavigate();

  // Informações do Lote
  const [quadra, setQuadra] = useState('');
  const [loteNum, setLoteNum] = useState('');
  const [gleba, setGleba] = useState('');
  const [metragem, setMetragem] = useState('');

  // Dados da Negociação
  const [valorLote, setValorLote] = useState('');
  const [percEntrada, setPercEntrada] = useState(ORCAMENTO_DEFAULTS.percEntrada);
  const [taxaJurosMensal, setTaxaJurosMensal] = useState(ORCAMENTO_DEFAULTS.taxaJurosMensal);
  const [prazoMeses, setPrazoMeses] = useState(ORCAMENTO_DEFAULTS.prazoMeses);

  // Estado local para as taxas fixas poderem ser editadas
  const [taxasFixas, setTaxasFixas] = useState([...TAXAS_FIXAS]);

  const [gerandoPdf, setGerandoPdf] = useState(null); // null | 'baixar' | 'compartilhar'
  const [erroPdf, setErroPdf] = useState(null);
  const [errosValidacao, setErrosValidacao] = useState({});

  const handleTaxaFixaChange = (index, novoValor) => {
    const novasTaxas = [...taxasFixas];
    novasTaxas[index].valor = Number(novoValor) || 0;
    setTaxasFixas(novasTaxas);
  };

  const handleValorLoteChange = (e) => {
    const formatado = formatToCurrencyInput(e.target.value);
    setValorLote(formatado);
  };

  const totalTaxas = taxasFixas.reduce((soma, t) => soma + t.valor, 0);
  const valorLoteNum = unmaskCurrency(valorLote);

  const calculo = useMemo(() => {
    return calcularOrcamento({
      valorLote: valorLoteNum,
      percEntrada,
      taxaJurosMensal,
      prazoMeses,
      totalTaxasFixas: totalTaxas,
    });
  }, [valorLoteNum, percEntrada, taxaJurosMensal, prazoMeses, totalTaxas]);

  const validarCampos = () => {
    const erros = {};
    if (percEntrada < 2 || percEntrada > 10) {
      erros.percEntrada = '% de entrada deve ser entre 2% e 10%';
    }
    if (prazoMeses <= 0) {
      erros.prazoMeses = 'Prazo deve ser maior que zero';
    }
    if (valorLoteNum <= 0) {
      erros.valorLote = 'Valor do lote inválido';
    }
    setErrosValidacao(erros);
    return Object.keys(erros).length === 0;
  };

  const gerarDoc = () =>
    gerarOrcamentoPdf({
      lote: { 
        quadra: quadra || 'Avulso', 
        lote: loteNum || 'Avulso',
        gleba: gleba || null,
        area_m2: metragem ? Number(metragem) : null
      },
      percEntrada,
      taxaJurosMensal,
      prazoMeses,
      valorLote: valorLoteNum,
      taxasFixas,
      totalTaxas,
      ...calculo,
    });

  const handleBaixarPdf = async () => {
    if (!validarCampos()) return;
    setErroPdf(null);
    setGerandoPdf('baixar');
    try {
      const doc = await gerarDoc();
      baixarPdf(doc, 'orcamento-avulso.pdf');
    } catch (e) {
      setErroPdf('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGerandoPdf(null);
    }
  };

  const handleCompartilharPdf = async () => {
    if (!validarCampos()) return;
    setErroPdf(null);
    setGerandoPdf('compartilhar');
    try {
      const doc = await gerarDoc();
      await compartilharPdf(doc, 'orcamento-avulso.pdf');
    } catch (e) {
      setErroPdf('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGerandoPdf(null);
    }
  };

  const handleLimpar = () => {
    setQuadra('');
    setLoteNum('');
    setGleba('');
    setMetragem('');
    setValorLote('');
    setPercEntrada(ORCAMENTO_DEFAULTS.percEntrada);
    setTaxaJurosMensal(ORCAMENTO_DEFAULTS.taxaJurosMensal);
    setPrazoMeses(ORCAMENTO_DEFAULTS.prazoMeses);
    setTaxasFixas([...TAXAS_FIXAS]);
    setErrosValidacao({});
  };

  const handleSair = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        pt: { xs: 4, md: 8 }
      }}
    >
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 800, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
            color: '#ffffff',
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <IconButton color="inherit" onClick={handleSair} aria-label="voltar">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              Simulador de Orçamento Avulso
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Simule orçamentos de forma rápida e prática
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 4 }}>
          {/* Informações do Lote */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Outfit, sans-serif' }}>
            Informações do Lote
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Quadra"
                type="text"
                size="small"
                fullWidth
                value={quadra}
                onChange={(e) => setQuadra(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Lote"
                type="text"
                size="small"
                fullWidth
                value={loteNum}
                onChange={(e) => setLoteNum(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Gleba"
                type="text"
                size="small"
                fullWidth
                value={gleba}
                onChange={(e) => setGleba(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Metragem (m²)"
                type="number"
                size="small"
                fullWidth
                value={metragem}
                onChange={(e) => setMetragem(e.target.value)}
                InputProps={{ endAdornment: <InputAdornment position="end">m²</InputAdornment> }}
              />
            </Grid>
          </Grid>

          {/* Campos Principais */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Outfit, sans-serif' }}>
            Dados da Negociação
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Valor do Lote (R$)"
                type="text"
                size="small"
                fullWidth
                value={valorLote}
                onChange={handleValorLoteChange}
                error={!!errosValidacao.valorLote}
                helperText={errosValidacao.valorLote}
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="% Entrada"
                type="number"
                size="small"
                fullWidth
                value={percEntrada}
                onChange={(e) => setPercEntrada(e.target.value)}
                error={!!errosValidacao.percEntrada}
                helperText={errosValidacao.percEntrada}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                inputProps={{ min: 2, max: 10, step: 0.5 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Taxa de Juros Mensal"
                type="number"
                size="small"
                fullWidth
                value={taxaJurosMensal}
                onChange={(e) => setTaxaJurosMensal(e.target.value)}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                inputProps={{ min: 0, step: 0.0001 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Prazo, em Meses"
                type="number"
                size="small"
                fullWidth
                value={prazoMeses}
                onChange={(e) => setPrazoMeses(e.target.value)}
                error={!!errosValidacao.prazoMeses}
                helperText={errosValidacao.prazoMeses}
                inputProps={{ min: 1, step: 1 }}
              />
            </Grid>
          </Grid>

          {/* Taxas Fixas Editáveis */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Outfit, sans-serif' }}>
            Taxas Mensais Fixas
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {taxasFixas.map((taxa, index) => (
              <Grid item xs={12} sm={6} md={3} key={taxa.label}>
                <TextField
                  label={taxa.label}
                  type="number"
                  size="small"
                  fullWidth
                  value={taxa.valor}
                  onChange={(e) => handleTaxaFixaChange(index, e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  inputProps={{ step: 0.01 }}
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ mb: 4 }} />

          {/* Resultado do cálculo */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Outfit, sans-serif' }}>
            Resultado da Simulação
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">Valor do Lote</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{formatCurrency(valorLoteNum)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">Valor Entrada</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{formatCurrency(calculo.valorEntrada)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">Valor Financiado</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{formatCurrency(calculo.valorFinanciado)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">Pagamento Mensal</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{formatCurrency(calculo.pagamentoMensal)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">Número de Pagamentos</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{calculo.numeroPagamentos}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.main', color: '#ffffff', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ opacity: 0.9 }} display="block">Parcela + Taxas</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{formatCurrency(calculo.pagamentoComTaxas)}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Ações / Exportação */}
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap justifyContent="space-between" width="100%">
              
              {/* Botões Esquerda */}
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={gerandoPdf === 'baixar' ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
                  onClick={handleBaixarPdf}
                  disabled={!!gerandoPdf}
                >
                  {gerandoPdf === 'baixar' ? 'Gerando...' : 'Baixar PDF'}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={gerandoPdf === 'compartilhar' ? <CircularProgress size={18} color="inherit" /> : <ShareIcon />}
                  onClick={handleCompartilharPdf}
                  disabled={!!gerandoPdf}
                >
                  {gerandoPdf === 'compartilhar' ? 'Gerando...' : 'Compartilhar (WhatsApp e outros)'}
                </Button>
              </Stack>
              
              {/* Botões Direita */}
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={handleLimpar}
                >
                  Limpar Dados
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleSair}
                >
                  Sair
                </Button>
              </Stack>

            </Stack>
            {erroPdf && (
              <Typography variant="caption" color="error">
                {erroPdf}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
