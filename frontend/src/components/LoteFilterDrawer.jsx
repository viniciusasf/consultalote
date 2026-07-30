import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Stack,
  Slider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Mapeia um valor digitado para a centena inferior (ex: 450 → 400, 510 → 500)
function resolverCategoria(valor) {
  const n = parseInt(valor, 10);
  if (isNaN(n) || n <= 0) return null;
  return Math.floor(n / 100) * 100;
}

export default function LoteFilterDrawer({
  open,
  onClose,
  onApply,
  filters,
  onFilterChange,
  onResetFilters,
  glebasDisponiveis = [],
  quadrasDisponiveis = [],
  totalResultados = 0,
}) {
  // Valor bruto digitado pelo usuário (somente dentro do drawer)
  const [catInput, setCatInput] = React.useState(filters.tamanho_categoria ? String(filters.tamanho_categoria) : '');

  // Sincroniza o input quando o filtro externo for limpo
  React.useEffect(() => {
    if (!filters.tamanho_categoria) setCatInput('');
  }, [filters.tamanho_categoria]);

  const handleCatChange = (e) => {
    const raw = e.target.value;
    setCatInput(raw);
    const categoria = resolverCategoria(raw);
    onFilterChange('tamanho_categoria', categoria);
  };
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, p: 3 },
      }}
    >
      {/* Cabeçalho do Drawer */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
          Filtros de Busca
        </Typography>
        <IconButton onClick={onClose} edge="end" id="btn-fechar-drawer-filtros">
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Refine a listagem de lotes por quadra, área ou valor investido. ({totalResultados} lotes encontrados)
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3}>
        {/* Ordenação */}
        <FormControl fullWidth size="small">
          <InputLabel id="order-by-label">Ordenar Por</InputLabel>
          <Select
            labelId="order-by-label"
            id="select-ordenacao"
            value={filters.order_by || 'preco_asc'}
            label="Ordenar Por"
            onChange={(e) => onFilterChange('order_by', e.target.value)}
          >
            <MenuItem value="preco_asc">Menor Preço (à vista)</MenuItem>
            <MenuItem value="preco_desc">Maior Preço (à vista)</MenuItem>
            <MenuItem value="area_asc">Menor Área (m²)</MenuItem>
            <MenuItem value="area_desc">Maior Área (m²)</MenuItem>
            <MenuItem value="lote_asc">Quadra / Ordem</MenuItem>
          </Select>
        </FormControl>

        {/* Seleção de Gleba */}
        <FormControl fullWidth size="small">
          <InputLabel id="gleba-label">Gleba</InputLabel>
          <Select
            labelId="gleba-label"
            id="select-gleba"
            value={filters.gleba || ''}
            label="Gleba"
            onChange={(e) => onFilterChange('gleba', e.target.value)}
          >
            <MenuItem value="">Todas as Glebas</MenuItem>
            {glebasDisponiveis.map((g) => (
              <MenuItem key={g} value={g}>
                Gleba {g}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Seleção de Quadra */}
        <FormControl fullWidth size="small">
          <InputLabel id="quadra-label">Quadra</InputLabel>
          <Select
            labelId="quadra-label"
            id="select-quadra"
            value={filters.quadra || ''}
            label="Quadra"
            onChange={(e) => onFilterChange('quadra', e.target.value)}
          >
            <MenuItem value="">Todas as Quadras</MenuItem>
            {quadrasDisponiveis.map((q) => (
              <MenuItem key={q} value={q}>
                Quadra {q}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Filtro de Categoria (Cat.) */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
            Categoria (m²)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Digite o tamanho desejado. Ex: 400, 450, 510…
          </Typography>
          <TextField
            label="Ex: 400, 450, 500…"
            type="number"
            size="small"
            fullWidth
            value={catInput}
            onChange={handleCatChange}
            id="input-categoria"
            inputProps={{ min: 0, step: 50 }}
            helperText={
              catInput && resolverCategoria(catInput)
                ? `Filtrando categoria: ${resolverCategoria(catInput)} m²`
                : ' '
            }
            FormHelperTextProps={{
              sx: { color: '#1b6435', fontWeight: 600, minHeight: 20 },
            }}
          />
        </Box>

        {/* Filtros de Área (m²) */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Área Total (m²)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Mínima"
                type="number"
                size="small"
                fullWidth
                value={filters.area_min || ''}
                onChange={(e) => onFilterChange('area_min', e.target.value ? Number(e.target.value) : null)}
                id="input-area-min"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Máxima"
                type="number"
                size="small"
                fullWidth
                value={filters.area_max || ''}
                onChange={(e) => onFilterChange('area_max', e.target.value ? Number(e.target.value) : null)}
                id="input-area-max"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Filtros de Preço (R$) */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Preço à Vista (R$)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Mínimo"
                type="number"
                size="small"
                fullWidth
                value={filters.preco_min || ''}
                onChange={(e) => onFilterChange('preco_min', e.target.value ? Number(e.target.value) : null)}
                id="input-preco-min"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Máximo"
                type="number"
                size="small"
                fullWidth
                value={filters.preco_max || ''}
                onChange={(e) => onFilterChange('preco_max', e.target.value ? Number(e.target.value) : null)}
                id="input-preco-max"
              />
            </Grid>
          </Grid>
        </Box>
      </Stack>

      <Box sx={{ mt: 'auto', pt: 4, display: 'flex', gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<RestartAltIcon />}
          onClick={onResetFilters}
          id="btn-limpar-filtros"
        >
          Limpar
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={onApply}
          id="btn-aplicar-filtros"
        >
          Aplicar
        </Button>
      </Box>
    </Drawer>
  );
}
