import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminCrudTable from '../../components/AdminCrudTable';
import AdminNavTabs from '../../components/AdminNavTabs';
import { locaisAdmin } from '../../api/adminClient';

export default function LocaisAdminPage() {
  const navigate = useNavigate();
  const [locais, setLocais] = useState([]);
  const [erro, setErro] = useState(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState(null); // null = novo
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');

  const carregar = () => {
    locaisAdmin.list().then(setLocais).catch(() => setErro('Não foi possível carregar os locais.'));
  };

  useEffect(carregar, []);

  const abrirNovo = () => {
    setEditando(null);
    setNome('');
    setSenha('');
    setDialogAberto(true);
  };

  const abrirEditar = (row) => {
    setEditando(row);
    setNome(row.nome);
    setSenha('');
    setDialogAberto(true);
  };

  const salvar = async () => {
    setErro(null);
    try {
      const payload = { nome };
      if (senha) payload.senha = senha;
      if (editando) {
        await locaisAdmin.update(editando.id, payload);
      } else {
        await locaisAdmin.create(payload);
      }
      setDialogAberto(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.detail || 'Não foi possível salvar o local.');
    }
  };

  const excluir = async (row) => {
    if (!window.confirm(`Excluir o local "${row.nome}"?`)) return;
    setErro(null);
    try {
      await locaisAdmin.remove(row.id);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.detail || 'Não foi possível excluir o local.');
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <IconButton onClick={() => navigate('/')} sx={{ mb: 1 }} id="btn-admin-voltar">
        <ArrowBackIcon />
      </IconButton>

      <AdminNavTabs />

      <AdminCrudTable
        titulo="Locais"
        erro={erro}
        colunas={[
          { key: 'nome', label: 'Nome' },
          {
            key: 'tem_senha',
            label: 'Senha configurada',
            render: (row) => (
              <Chip
                size="small"
                label={row.tem_senha ? 'Sim' : 'Não'}
                color={row.tem_senha ? 'success' : 'default'}
              />
            ),
          },
        ]}
        linhas={locais}
        onNovo={abrirNovo}
        onEditar={abrirEditar}
        onExcluir={excluir}
      />

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editando ? 'Editar Local' : 'Novo Local'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            fullWidth
            autoFocus
            id="input-local-nome"
          />
          <TextField
            label={editando ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            fullWidth
            id="input-local-senha"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvar} disabled={!nome} id="btn-local-salvar">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
