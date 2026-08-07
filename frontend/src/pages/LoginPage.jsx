import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Tabs, Tab, TextField, Button, Typography, MenuItem, Alert, CircularProgress,
} from '@mui/material';
import { fetchLocaisPublico, loginMaster, loginCorretor } from '../api/authClient';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [aba, setAba] = useState('corretor');
  const [locais, setLocais] = useState([]);
  const [localId, setLocalId] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchLocaisPublico()
      .then(setLocais)
      .catch(() => setErro('Não foi possível carregar a lista de locais.'));
  }, []);

  const handleAbaChange = (_e, novaAba) => {
    setAba(novaAba);
    setErro(null);
    setSenha('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const data = aba === 'master' ? await loginMaster(senha) : await loginCorretor(localId, senha);
      login(data);
      navigate('/', { replace: true });
    } catch (err) {
      setErro(err.response?.data?.detail || 'Não foi possível entrar. Verifique os dados e tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 420, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
            color: '#ffffff',
            py: 3,
            px: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
            🏡 Consulta de Lotes Resort
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
            Entre para continuar
          </Typography>
        </Box>

        <Tabs value={aba} onChange={handleAbaChange} variant="fullWidth" id="tabs-login">
          <Tab label="Corretor" value="corretor" id="tab-login-corretor" />
          <Tab label="Master" value="master" id="tab-login-master" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {aba === 'corretor' && (
            <TextField
              select
              label="Local"
              value={localId}
              onChange={(e) => setLocalId(e.target.value)}
              required
              fullWidth
              id="select-login-local"
            >
              {locais.map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.nome}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            fullWidth
            id="input-login-senha"
          />

          {erro && <Alert severity="error">{erro}</Alert>}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={carregando || (aba === 'corretor' && !localId)}
            id="btn-login-entrar"
          >
            {carregando ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>

          <Button
            variant="outlined"
            color="primary"
            size="large"
            fullWidth
            onClick={() => navigate('/orcamento-avulso')}
            id="btn-orcamento-avulso"
            sx={{ mt: 1 }}
          >
            Simulador de Orçamento
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
