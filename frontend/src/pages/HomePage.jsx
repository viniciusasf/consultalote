import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Alert, Button, CircularProgress,
  TextField, InputAdornment, FormControl, Select, MenuItem,
  InputLabel, Grid, Chip, Divider, Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LoteTable from '../components/LoteTable';
import LoteDetailModal from '../components/LoteDetailModal';
import LoteFilterDrawer from '../components/LoteFilterDrawer';
import { fetchLotes } from '../api/client';
import { useAuth } from '../context/AuthContext';

const DEFAULT_FILTERS = {
  q: '',
  gleba: '',
  quadra: '',
  tamanho_categoria: null,
  area_min: null,
  area_max: null,
  preco_min: null,
  preco_max: null,
  order_by: 'lote_asc',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { isMaster, localNome, logout } = useAuth();
  const [filters, setFilters]           = useState(DEFAULT_FILTERS);
  const [lotes, setLotes]               = useState([]);
  const [glebas, setGlebas]             = useState([]);
  const [quadras, setQuadras]           = useState([]);
  const [totalCount, setTotalCount]     = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [draftFilters, setDraftFilters]         = useState(DEFAULT_FILTERS);
  const [selectedLote, setSelectedLote] = useState(null);
  const [detailModalOpen, setDetailModalOpen]   = useState(false);
  const [searchInput, setSearchInput]   = useState('');

  // Garante que apenas a resposta da requisição mais recente seja aplicada,
  // evitando que uma busca desatualizada (ex: dígito intermediário digitado
  // na Categoria) sobrescreva o resultado já filtrado ao chegar fora de ordem.
  const requestIdRef = useRef(0);

  const loadData = useCallback(async (currentFilters) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLotes(currentFilters || filters);
      if (requestId !== requestIdRef.current) return;
      setLotes(data.items || []);
      setTotalCount(data.count || 0);
      if (data.glebas_disponiveis) setGlebas(data.glebas_disponiveis);
      if (data.quadras_disponiveis) setQuadras(data.quadras_disponiveis);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 8000.');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData(filters);
  }, [filters]);

  // Debounce da busca textual
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, q: searchInput }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters(DEFAULT_FILTERS);
  };

  // Filtros do Drawer só são aplicados na tabela ao clicar em "Aplicar"
  const handleOpenFilterDrawer = () => {
    setDraftFilters(filters);
    setFilterDrawerOpen(true);
  };

  const handleDraftFilterChange = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDraftResetFilters = () => {
    setDraftFilters((prev) => ({ ...DEFAULT_FILTERS, q: prev.q }));
  };

  const handleApplyFilters = () => {
    setFilters(draftFilters);
    setFilterDrawerOpen(false);
  };

  const activeFilterCount = [
    filters.gleba, filters.quadra,
    filters.tamanho_categoria,
    filters.area_min, filters.area_max,
    filters.preco_min, filters.preco_max,
  ].filter(Boolean).length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      {/* Cabeçalho Compacto */}
      <Box sx={{ bgcolor: '#1b4332', color: '#fff', py: 1.5, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: 0.5 }}>
            🏡 Consulta de Lotes Resort
          </Typography>
          {!loading && (
            <Chip
              label={`${totalCount.toLocaleString('pt-BR')} lotes`}
              size="small"
              sx={{ bgcolor: '#d4af37', color: '#101010', fontWeight: 700, fontSize: '0.72rem' }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={isMaster ? 'Master' : `Local: ${localNome || '—'}`}
            size="small"
            variant="outlined"
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', fontWeight: 600 }}
          />
          {isMaster && (
            <Button
              size="small"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => navigate('/admin/locais')}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', border: '1px solid', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              id="btn-nav-admin"
            >
              Administração
            </Button>
          )}
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => loadData(filters)}
            disabled={loading}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', border: '1px solid', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            Atualizar
          </Button>
          <Button
            size="small"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', border: '1px solid', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            id="btn-logout"
          >
            Sair
          </Button>
        </Box>
      </Box>

      {/* Barra de Filtros */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e0e0', px: 3, py: 1.5 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Busca */}
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              id="input-busca"
              size="small"
              fullWidth
              placeholder="Buscar por quadra, lote, categoria, item..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#999' }} /></InputAdornment>,
              }}
            />
          </Grid>

          {/* Gleba */}
          <Grid item xs={6} sm={2} md={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel id="lb-gleba">Gleba</InputLabel>
              <Select
                labelId="lb-gleba"
                id="sel-gleba"
                value={filters.gleba}
                label="Gleba"
                onChange={(e) => handleFilterChange('gleba', e.target.value)}
              >
                <MenuItem value=""><em>Todas</em></MenuItem>
                {glebas.map((g) => <MenuItem key={g} value={g}>Gleba {g}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* Quadra */}
          <Grid item xs={6} sm={2} md={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel id="lb-quadra">Quadra</InputLabel>
              <Select
                labelId="lb-quadra"
                id="sel-quadra"
                value={filters.quadra}
                label="Quadra"
                onChange={(e) => handleFilterChange('quadra', e.target.value)}
              >
                <MenuItem value=""><em>Todas</em></MenuItem>
                {quadras.map((q) => <MenuItem key={q} value={q}>{q}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* Ordenação */}
          <Grid item xs={12} sm={3} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel id="lb-order">Ordenar por</InputLabel>
              <Select
                labelId="lb-order"
                id="sel-order"
                value={filters.order_by}
                label="Ordenar por"
                onChange={(e) => handleFilterChange('order_by', e.target.value)}
              >
                <MenuItem value="lote_asc">Quadra / Lote</MenuItem>
                <MenuItem value="preco_asc">Menor Preço</MenuItem>
                <MenuItem value="preco_desc">Maior Preço</MenuItem>
                <MenuItem value="area_asc">Menor Área</MenuItem>
                <MenuItem value="area_desc">Maior Área</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Filtros Avançados */}
          <Grid item>
            <Button
              id="btn-filtros-avancados"
              variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
              color="primary"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={handleOpenFilterDrawer}
            >
              Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
          </Grid>

          {/* Limpar */}
          {(activeFilterCount > 0 || searchInput) && (
            <Grid item>
              <Button size="small" onClick={handleResetFilters} color="error" variant="text">
                Limpar tudo
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Conteúdo Principal */}
      <Container maxWidth={false} sx={{ py: 2, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Erro */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} action={
            <Button color="inherit" size="small" onClick={() => loadData(filters)}>Tentar Novamente</Button>
          }>
            {error}
          </Alert>
        )}

        {/* Loading inicial */}
        {loading && (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <CircularProgress size={36} color="primary" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Carregando dados da planilha... (primeira carga pode levar alguns segundos)
            </Typography>
          </Paper>
        )}

        {/* Tabela */}
        {!loading && (
          <LoteTable
            lotes={lotes}
            onSelect={(lote) => { setSelectedLote(lote); setDetailModalOpen(true); }}
          />
        )}
      </Container>

      {/* Drawer de Filtros Avançados */}
      <LoteFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApply={handleApplyFilters}
        filters={draftFilters}
        onFilterChange={handleDraftFilterChange}
        onResetFilters={handleDraftResetFilters}
        glebasDisponiveis={glebas}
        quadrasDisponiveis={quadras}
        totalResultados={totalCount}
      />

      {/* Modal de Detalhes */}
      <LoteDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        lote={selectedLote}
      />
    </Box>
  );
}
