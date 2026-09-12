import React, { useRef, useEffect } from 'react';

export default function SpectrumCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const render = () => {
      // Simulación de espectro basada en el pulso si el analyzer no está conectado
      // En producción, aquí leeríamos dataArray de useAudioAnalyzer
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = 4;
      let x = 0;

      for (let i = 0; i < 40; i++) {
        const barHeight = Math.random() * 50;
        ctx.fillStyle = `rgba(99, 102, 241, ${barHeight / 100 + 0.1})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} width="300" height="60" className="opacity-50" />;
}
