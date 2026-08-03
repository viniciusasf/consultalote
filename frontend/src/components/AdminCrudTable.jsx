import React from 'react';
import {
  Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Tabela + botões de admin (Novo/Editar/Excluir) — só sabe de
 * colunas/linhas/callbacks, sem conhecer os campos específicos de cada
 * recurso (Locais/Usuários/Perfis mantêm seus próprios formulários).
 */
export default function AdminCrudTable({
  titulo,
  colunas, // [{ key, label, render?: (row) => node }]
  linhas,
  onNovo,
  onEditar,
  onExcluir,
  podeExcluir = () => true,
  erro,
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
          {titulo}
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={onNovo} id="btn-admin-novo">
          Novo
        </Button>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erro}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {colunas.map((col) => (
                <TableCell key={col.key} sx={{ fontWeight: 700 }}>
                  {col.label}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {linhas.length === 0 && (
              <TableRow>
                <TableCell colSpan={colunas.length + 1} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
            {linhas.map((row) => (
              <TableRow key={row.id} hover>
                {colunas.map((col) => (
                  <TableCell key={col.key}>{col.render ? col.render(row) : row[col.key]}</TableCell>
                ))}
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEditar(row)} id={`btn-admin-editar-${row.id}`}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onExcluir(row)}
                    disabled={!podeExcluir(row)}
                    id={`btn-admin-excluir-${row.id}`}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
