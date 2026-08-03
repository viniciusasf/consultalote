import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, Tab } from '@mui/material';

const ROTAS = ['/admin/locais', '/admin/usuarios', '/admin/perfis'];

export default function AdminNavTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const aba = ROTAS.includes(location.pathname) ? location.pathname : ROTAS[0];

  return (
    <Tabs value={aba} onChange={(_e, rota) => navigate(rota)} sx={{ mb: 2 }} id="tabs-admin-nav">
      <Tab label="Locais" value="/admin/locais" />
      <Tab label="Usuários" value="/admin/usuarios" />
      <Tab label="Perfis" value="/admin/perfis" />
    </Tabs>
  );
}
