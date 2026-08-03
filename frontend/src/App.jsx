import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';
import RequireMaster from './components/RequireMaster';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LocaisAdminPage from './pages/admin/LocaisAdminPage';
import UsuariosAdminPage from './pages/admin/UsuariosAdminPage';
import PerfisAdminPage from './pages/admin/PerfisAdminPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<RequireAuth />}>
              <Route path="/" element={<HomePage />} />

              <Route element={<RequireMaster />}>
                <Route path="/admin/locais" element={<LocaisAdminPage />} />
                <Route path="/admin/usuarios" element={<UsuariosAdminPage />} />
                <Route path="/admin/perfis" element={<PerfisAdminPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
