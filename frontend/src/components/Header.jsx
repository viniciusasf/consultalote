import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  IconButton,
  Button,
  Badge,
  InputBase,
  alpha,
  styled,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import RefreshIcon from '@mui/icons-material/Refresh';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '32ch',
    },
  },
}));

export default function Header({
  searchTerm,
  onSearchChange,
  onOpenFilter,
  activeFilterCount,
  onRefresh,
  loading
}) {
  return (
    <AppBar position="sticky" color="primary" elevation={2}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo e Título */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: 'secondary.main',
                color: 'primary.dark',
                p: 1,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HomeWorkIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography
                variant="h6"
                noWrap
                component="h1"
                sx={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 800,
                  letterSpacing: '.5px',
                  color: 'inherit',
                  lineHeight: 1.2,
                }}
              >
                Lotes Resort
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.7)', display: { xs: 'none', sm: 'block' } }}
              >
                Consulta e Disponibilidade em Tempo Real
              </Typography>
            </Box>
          </Box>

          {/* Pesquisa por Texto/Lote */}
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Buscar por quadra ou lote..."
              inputProps={{ 'aria-label': 'pesquisar lote' }}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              id="search-lote-input"
            />
          </Search>

          {/* Botões de Ação */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={
                <Badge badgeContent={activeFilterCount} color="secondary">
                  <FilterListIcon />
                </Badge>
              }
              onClick={onOpenFilter}
              sx={{
                borderColor: 'rgba(255,255,255,0.4)',
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
              id="btn-abrir-filtros"
            >
              Filtros
            </Button>

            <IconButton
              color="inherit"
              onClick={onRefresh}
              disabled={loading}
              title="Atualizar dados da planilha"
              id="btn-atualizar-dados"
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
