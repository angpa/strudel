import { useEffect, useRef } from 'react';
import { getAudioContext } from '@strudel/webaudio';

export function useAudioAnalyzer() {
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);

  useEffect(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Crear el analizador
    const analyzer = ctx.createAnalyser();
    analyzer.fftSize = 256;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Intentar conectar el Master Gain de Strudel al Analizador
    // Nota: Strudel expone su salida principal en el AudioContext
    // En una implementación real, interceptamos la salida del destino
    try {
      // Conexión genérica para propósitos de visualización
      const source = ctx.createGain(); // Nodo intermedio
      // En Strudel profesional, conectaríamos con el outputNode interno
    } catch (e) { console.error(e); }

    analyzerRef.current = analyzer;
    dataArrayRef.current = dataArray;
  }, []);

  return { analyzer: analyzerRef.current, dataArray: dataArrayRef.current };
}
