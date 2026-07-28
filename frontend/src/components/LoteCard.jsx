import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentsIcon from '@mui/icons-material/Payments';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function LoteCard({ lote, onSelect }) {
  const formatCurrency = (val) => {
    if (val === null || val === undefined) return 'N/I';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <Card
      id={`lote-card-${lote.id}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      {/* Faixa superior de destaque */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          color: '#ffffff',
          px: 2.5,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>
            Quadra {lote.quadra}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'secondary.main', lineHeight: 1 }}>
            Lote {lote.lote}
          </Typography>
        </Box>
        <Chip
          icon={<CheckCircleIcon sx={{ '&&': { color: '#ffffff' } }} />}
          label="Disponível"
          size="small"
          color="success"
          sx={{ fontWeight: 700, px: 0.5 }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1 }}>
        {/* Chips de Informações */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {lote.gleba && (
            <Chip
              label={`Gleba ${lote.gleba}`}
              size="small"
              variant="outlined"
              color="primary"
            />
          )}
          {lote.tamanho_categoria && (
            <Chip
              label={`Cat. ${lote.tamanho_categoria}m²`}
              size="small"
              variant="outlined"
              color="secondary"
            />
          )}
        </Stack>

        {/* Área m² */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <SquareFootIcon color="primary" />
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Área Total
            </Typography>
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
              {lote.area_m2.toLocaleString('pt-BR')} m²
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Preço À Vista */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Preço à Vista (1x)
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '-0.5px' }}
          >
            {formatCurrency(lote.preco_vista)}
          </Typography>
          {lote.preco_m2 && (
            <Typography variant="caption" color="text.secondary">
              ({formatCurrency(lote.preco_m2)} / m²)
            </Typography>
          )}
        </Box>

        {/* Parcela 180x */}
        {lote.valor_parcela_180x && (
          <Box
            sx={{
              bgcolor: 'background.default',
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentsIcon color="secondary" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                180x Parcela
              </Typography>
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {formatCurrency(lote.valor_parcela_180x)}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => onSelect(lote)}
          id={`btn-detalhes-${lote.id}`}
        >
          Ver Detalhes
        </Button>
      </CardActions>
    </Card>
  );
}
