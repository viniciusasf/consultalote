import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Divider,
  Paper,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentsIcon from '@mui/icons-material/Payments';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function LoteDetailModal({ lote, open, onClose }) {
  if (!lote) return null;

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: 'hidden' },
      }}
      id="modal-detalhes-lote"
    >
      {/* Cabeçalho do Modal */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          color: '#ffffff',
          py: 2.5,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>
            Detalhamento Completo • Gleba {lote.gleba || '1'}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'secondary.main', lineHeight: 1.2 }}>
            Quadra {lote.quadra} — Lote {lote.lote}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#ffffff' }} id="btn-fechar-modal-detalhes">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Status e Destaque Principal */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            icon={<CheckCircleIcon sx={{ '&&': { color: '#ffffff' } }} />}
            label="Lote Disponível para Venda"
            color="success"
            sx={{ fontWeight: 700, py: 0.5 }}
          />
          {lote.tamanho_categoria && (
            <Chip
              label={`Categoria ${lote.tamanho_categoria}m²`}
              color="secondary"
              variant="outlined"
            />
          )}
          {lote.ordem && (
            <Chip label={`Item #${lote.ordem}`} variant="outlined" />
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Card Preço à Vista */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: 'primary.light',
                color: '#ffffff',
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" sx={{ textTransform: 'uppercase', opacity: 0.9, fontWeight: 600 }}>
                Valor À Vista (1x Promocional)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, my: 0.5, fontFamily: 'Outfit, sans-serif' }}>
                {formatCurrency(lote.preco_vista)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Valor por m²: <strong>{formatCurrency(lote.preco_m2)}</strong>
              </Typography>
            </Paper>
          </Grid>

          {/* Card Financiamento */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: 'background.default',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Plano Financiado 180 Meses
              </Typography>
              <Typography variant="h4" color="text.primary" sx={{ fontWeight: 800, my: 0.5, fontFamily: 'Outfit, sans-serif' }}>
                180x {formatCurrency(lote.valor_parcela_180x)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Preço total financiado: <strong>{formatCurrency(lote.preco_financiado_180x)}</strong>
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Tabela de Especificações detalhadas */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Outfit, sans-serif' }}>
          Resumo de Valores e Taxas
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Área Total
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {lote.area_m2.toLocaleString('pt-BR')} m²
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Valor Base Tabela
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {formatCurrency(lote.valor_base)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Entrada Estimada (5%)
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {formatCurrency(lote.entrada_5pct)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Corretagem (6%)
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {formatCurrency(lote.corretagem_6pct)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                IPTU Mensal Estimado
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {formatCurrency(lote.iptu_mensal)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Identificador Único
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {lote.id}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
