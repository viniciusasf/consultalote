import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminCrudTable from '../../components/AdminCrudTable';
import AdminNavTabs from '../../components/AdminNavTabs';
import { usuariosAdmin, locaisAdmin, perfisAdmin } from '../../api/adminClient';

export default function UsuariosAdminPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [locais, setLocais] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [erro, setErro] = useState(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome_login: '', sobrenome: '', local_id: '', perfil_id: '' });

  const carregar = () => {
    usuariosAdmin.list().then(setUsuarios).catch(() => setErro('Não foi possível carregar os usuários.'));
  };

  useEffect(() => {
    carregar();
    locaisAdmin.list().then(setLocais).catch(() => {});
    perfisAdmin.list().then(setPerfis).catch(() => {});
  }, []);

  const nomeLocal = (id) => locais.find((l) => l.id === id)?.nome || '—';
  const nomePerfil = (id) => perfis.find((p) => p.id === id)?.nome || '—';

  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome_login: '', sobrenome: '', local_id: '', perfil_id: '' });
    setDialogAberto(true);
  };

  const abrirEditar = (row) => {
    setEditando(row);
    setForm({
      nome_login: row.nome_login,
      sobrenome: row.sobrenome || '',
      local_id: row.local_id,
      perfil_id: row.perfil_id,
    });
    setDialogAberto(true);
  };

  const salvar = async () => {
    setErro(null);
    try {
      if (editando) {
        await usuariosAdmin.update(editando.id, form);
      } else {
        await usuariosAdmin.create(form);
      }
      setDialogAberto(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.detail || 'Não foi possível salvar o usuário.');
    }
  };

  const excluir = async (row) => {
    if (!window.confirm(`Excluir o usuário "${row.nome_login}"?`)) return;
    setErro(null);
    try {
      await usuariosAdmin.remove(row.id);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.detail || 'Não foi possível excluir o usuário.');
    }
  };

  const formValido = form.nome_login && form.local_id && form.perfil_id;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <IconButton onClick={() => navigate('/')} sx={{ mb: 1 }} id="btn-admin-voltar">
        <ArrowBackIcon />
      </IconButton>

      <AdminNavTabs />

      <AdminCrudTable
        titulo="Usuários"
        erro={erro}
        colunas={[
          { key: 'nome_login', label: 'Nome/login' },
          { key: 'sobrenome', label: 'Sobrenome' },
          { key: 'local_id', label: 'Local', render: (row) => nomeLocal(row.local_id) },
          { key: 'perfil_id', label: 'Perfil', render: (row) => nomePerfil(row.perfil_id) },
        ]}
        linhas={usuarios}
        onNovo={abrirNovo}
        onEditar={abrirEditar}
        onExcluir={excluir}
      />

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editando ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Nome/login"
            value={form.nome_login}
            onChange={(e) => setForm((f) => ({ ...f, nome_login: e.target.value }))}
            fullWidth
            autoFocus
            id="input-usuario-nome-login"
          />
          <TextField
            label="Sobrenome"
            value={form.sobrenome}
            onChange={(e) => setForm((f) => ({ ...f, sobrenome: e.target.value }))}
            fullWidth
            id="input-usuario-sobrenome"
          />
          <TextField
            select
            label="Local"
            value={form.local_id}
            onChange={(e) => setForm((f) => ({ ...f, local_id: e.target.value }))}
            fullWidth
            id="select-usuario-local"
          >
            {locais.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.nome}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Perfil"
            value={form.perfil_id}
            onChange={(e) => setForm((f) => ({ ...f, perfil_id: e.target.value }))}
            fullWidth
            id="select-usuario-perfil"
          >
            {perfis.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nome}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvar} disabled={!formValido} id="btn-usuario-salvar">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
