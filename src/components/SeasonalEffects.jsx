import { useState, useEffect } from 'react';
import Snowfall from 'react-snowfall';

export default function SeasonalEffects({ forceWinter }) {
  const [season, setSeason] = useState(null);

  useEffect(() => {
    if (forceWinter) {
      setSeason('winter');
      return;
    }

    // Standardowe sprawdzanie daty
    const today = new Date();
    const month = today.getMonth();

    if (month === 11 || month === 0) {
      setSeason('winter');
    } else if (month === 3) {
      setSeason('easter');
    } else {
      setSeason(null);
    }
  }, [forceWinter]);

  if (!season) return null;

  if (season === 'winter') {
    return (
      <div className="absolute inset-0 pointer-events-none z-0">
        <Snowfall 
          color="#ffffff" 
          snowflakeCount={20}
          style={{ opacity: 0.99 }} 
        />
      </div>
    );
  }

  if (season === 'easter') {
    const easterEmojis = ['Liść', 'Liść', 'Liść', 'Liść', 'Liść'];
    const elements = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      emoji: easterEmojis[Math.floor(Math.random() * easterEmojis.length)],
      left: `${Math.random() * 100}%`,
      animationDuration: `${5 + Math.random() * 5}s`,
      animationDelay: `${Math.random() * 10}s`,
      fontSize: `${1 + Math.random() * 0.9}rem`
    }));

    return (
      <div className="absolute inset-0 pointer-events-none z-0">
        <style>
          {`
            @keyframes floatUpHeader {
              0% { transform: translateY(100px) rotate(0deg); opacity: 0; }
              15% { opacity: 0.8; }
              85% { opacity: 0.8; }
              100% { transform: translateY(-50px) rotate(360deg); opacity: 0; }
            }
          `}
        </style>
        {elements.map((el) => (
          <div
            key={el.id}
            className="absolute bottom-0 opacity-0"
            style={{
              left: el.left,
              fontSize: el.fontSize,
              animation: `floatUpHeader ${el.animationDuration} linear infinite`,
              animationDelay: el.animationDelay,
            }}
          >
            {el.emoji}
          </div>
        ))}
      </div>
    );
  }

  return null;
}