import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TableSortLabel, Paper, Typography, Chip, Box,
  IconButton, Tooltip,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const fmt = (val) => {
  if (val === null || val === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
};

const fmtArea = (val) => {
  if (!val) return '—';
  return `${val.toLocaleString('pt-BR')} m²`;
};

const COLS = [
  { id: 'quadra',            label: 'Quadra',          align: 'left',  width: 80  },
  { id: 'lote',              label: 'Lote',             align: 'left',  width: 70  },
  { id: 'gleba',             label: 'Gleba',            align: 'center',width: 70  },
  { id: 'tamanho_categoria', label: 'Cat.',             align: 'center',width: 70  },
  { id: 'area_m2',           label: 'Área (m²)',        align: 'right', width: 100 },
  { id: 'preco_m2',          label: 'R$/m²',            align: 'right', width: 100 },
  { id: 'valor_base',        label: 'À Vista',          align: 'right', width: 130 },
  { id: 'preco_financiado_180x', label: 'Total 180x',  align: 'right', width: 130 },
  { id: 'valor_parcela_180x',label: 'Parcela 180x',    align: 'right', width: 120 },
  { id: 'entrada_5pct',      label: 'Entrada (5%)',     align: 'right', width: 120 },
  { id: 'acoes',             label: '',                 align: 'center',width: 50  },
];

function descendingComparator(a, b, orderBy) {
  const va = a[orderBy] ?? -Infinity;
  const vb = b[orderBy] ?? -Infinity;
  if (vb < va) return -1;
  if (vb > va) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function LoteTable({ lotes, onSelect }) {
  const [order, setOrder]       = useState('asc');
  const [orderBy, setOrderBy]   = useState('valor_base');
  const [page, setPage]         = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const handleSort = (col) => {
    const isAsc = orderBy === col && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(col);
    setPage(0);
  };

  const sorted = [...lotes].sort(getComparator(order, orderBy));
  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ width: '100%', borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 260px)', overflowX: 'auto' }}>
        <Table stickyHeader size="small" id="tabela-lotes">
          <TableHead>
            <TableRow>
              {COLS.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sx={{
                    width: col.width,
                    minWidth: col.width,
                    bgcolor: '#1b4332',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    py: 1,
                    whiteSpace: 'nowrap',
                    borderBottom: '2px solid #d4af37',
                  }}
                >
                  {col.id !== 'acoes' ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : 'asc'}
                      onClick={() => handleSort(col.id)}
                      sx={{
                        color: '#fff !important',
                        '& .MuiTableSortLabel-icon': { color: '#d4af37 !important' },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.map((lote, idx) => (
              <TableRow
                key={lote.id}
                hover
                sx={{
                  bgcolor: idx % 2 === 0 ? '#fff' : '#f7f9f8',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#e8f5e9 !important' },
                }}
                onClick={() => onSelect(lote)}
                id={`row-${lote.id}`}
              >
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#1b4332' }}>
                  {lote.quadra}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  {lote.lote}
                </TableCell>
                <TableCell align="center">
                  {lote.gleba ? (
                    <Chip label={`G${lote.gleba}`} size="small" sx={{ fontSize: '0.68rem', height: 20, bgcolor: '#e8f5e9', color: '#1b4332', fontWeight: 700 }} />
                  ) : '—'}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '0.75rem', color: '#637381' }}>
                  {lote.tamanho_categoria ? `${lote.tamanho_categoria}m²` : '—'}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  {fmtArea(lote.area_m2)}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.78rem', color: '#637381' }}>
                  {lote.preco_m2 ? fmt(lote.preco_m2) : '—'}
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1b4332' }}>
                    {fmt(lote.valor_base)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.78rem', color: '#444' }}>
                  {fmt(lote.preco_financiado_180x)}
                </TableCell>
                <TableCell align="right">
                  {lote.valor_parcela_180x ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1b6435' }}>
                        {fmt(lote.valor_parcela_180x)}
                      </Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: '#999' }}>180x</Typography>
                    </Box>
                  ) : '—'}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.78rem', color: '#444' }}>
                  {fmt(lote.entrada_5pct)}
                </TableCell>
                <TableCell align="center" onClick={(e) => { e.stopPropagation(); onSelect(lote); }}>
                  <Tooltip title="Ver detalhes">
                    <IconButton size="small" color="primary" id={`info-${lote.id}`}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLS.length} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Nenhum lote encontrado com os filtros aplicados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={lotes.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
        rowsPerPageOptions={[25, 50, 100, 200]}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        sx={{ borderTop: '1px solid rgba(0,0,0,0.08)', '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '0.78rem' } }}
      />
    </Paper>
  );
}
