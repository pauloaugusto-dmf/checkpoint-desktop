import { useState, useEffect, useCallback } from 'react';
import { releaseNotes } from '../js/releaseNotes';

export function useCheckpointData() {
  const [jogos, setJogos] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('violet');
  const [displayMode, setDisplayMode] = useState('dark');
  const [iconStyle, setIconStyle] = useState('status');
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      if (window.api) {
        const [dataJogos, dataGeneros, dataEventos] = await Promise.all([
          window.api.getJogos(),
          window.api.getGeneros(),
          window.api.getEventos ? window.api.getEventos() : []
        ]);
        setJogos(dataJogos);
        setGeneros(dataGeneros);
        setEventos(dataEventos);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyTheme = useCallback((themeName, themes) => {
    const theme = themes[themeName];
    if (!theme) return;
    document.documentElement.style.setProperty('--primary-500', theme.colors['500']);
    document.documentElement.style.setProperty('--primary-600', theme.colors['600']);
    localStorage.setItem('checkpoint-theme', themeName);
    setCurrentTheme(themeName);
  }, []);

  const applyDisplayMode = useCallback((mode) => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('checkpoint-display-mode', mode);
    setDisplayMode(mode);
  }, []);

  const applyIconStyle = useCallback((style) => {
    localStorage.setItem('checkpoint-icon-style', style);
    setIconStyle(style);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('checkpoint-theme') || 'violet';
    const savedDisplayMode = localStorage.getItem('checkpoint-display-mode') || 'dark';
    const savedIconStyle = localStorage.getItem('checkpoint-icon-style') || 'status';
    
    // We need to pass themes here or handle it differently. 
    // For now, let's just set the state and handle the CSS property in App or here if we import themes.
    setCurrentTheme(savedTheme);
    setDisplayMode(savedDisplayMode);
    setIconStyle(savedIconStyle);
    
    applyDisplayMode(savedDisplayMode);
    carregarDados();

    const lastVersion = localStorage.getItem('checkpoint-last-version');
    const currentVersion = releaseNotes[0].version;
    if (lastVersion !== currentVersion) {
      setIsReleaseNotesOpen(true);
      localStorage.setItem('checkpoint-last-version', currentVersion);
    }
  }, [carregarDados, applyDisplayMode]);

  return {
    jogos, setJogos,
    generos, setGeneros,
    eventos, setEventos,
    loading, setLoading,
    currentTheme, setCurrentTheme,
    displayMode, setDisplayMode,
    iconStyle, setIconStyle,
    isReleaseNotesOpen, setIsReleaseNotesOpen,
    carregarDados,
    applyTheme,
    applyDisplayMode,
    applyIconStyle
  };
}
