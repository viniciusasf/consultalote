import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminCrudTable from '../../components/AdminCrudTable';
import AdminNavTabs from '../../components/AdminNavTabs';
import { perfisAdmin } from '../../api/adminClient';

const PERFIS_SEMENTE = ['master', 'corretor'];

export default function PerfisAdminPage() {
  const navigate = useNavigate();
  const [perfis, setPerfis] = useState([]);
  const [erro, setErro] = useState(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nome, setNome] = useState('');

  const carregar = () => {
    perfisAdmin.list().then(setPerfis).catch(() => setErro('Não foi possível carregar os perfis.'));
  };

  useEffect(carregar, []);

  const abrirNovo = () => {
    setEditando(null);
    setNome('');
    setDialogAberto(true);
  };

  const abrirEditar = (row) => {
    setEditando(row);
    setNome(row.nome);
    setDialogAberto(true);
  };

  const salvar = async () => {
    setErro(null);
    try {
      if (editando) {
        await perfisAdmin.update(editando.id, { nome });
      } else {
        await perfisAdmin.create({ nome });
      }
      setDialogAberto(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.detail || 'Não foi possível salvar o perfil.');
    }
  };

  const excluir = async (row) => {
    if (!window.confirm(`Excluir o perfil "${row.nome}"?`)) return;
    setErro(null);
    try {
      await perfisAdmin.remove(row.id);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.detail || 'Não foi possível excluir o perfil.');
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <IconButton onClick={() => navigate('/')} sx={{ mb: 1 }} id="btn-admin-voltar">
        <ArrowBackIcon />
      </IconButton>

      <AdminNavTabs />

      <AdminCrudTable
        titulo="Perfis"
        erro={erro}
        colunas={[{ key: 'nome', label: 'Nome' }]}
        linhas={perfis}
        onNovo={abrirNovo}
        onEditar={abrirEditar}
        onExcluir={excluir}
        podeExcluir={(row) => !PERFIS_SEMENTE.includes(row.nome)}
      />

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editando ? 'Editar Perfil' : 'Novo Perfil'}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            fullWidth
            autoFocus
            disabled={editando && PERFIS_SEMENTE.includes(editando.nome)}
            helperText={
              editando && PERFIS_SEMENTE.includes(editando.nome)
                ? 'Perfil padrão do sistema — não pode ser renomeado'
                : ' '
            }
            id="input-perfil-nome"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={salvar}
            disabled={!nome || (editando && PERFIS_SEMENTE.includes(editando.nome))}
            id="btn-perfil-salvar"
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
