import React, { memo, useCallback } from 'react';
import { Gamepad2 } from 'lucide-react';
import GameCard from './GameCard';

const GameGrid = memo(function GameGrid({ 
  loading, 
  jogos, 
  statusIcons,
  getIconColorClass, 
  onGameClick 
}) {
  const handleClick = useCallback((jogo) => {
    onGameClick(jogo);
  }, [onGameClick]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (jogos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Gamepad2 className="w-24 h-24 mb-4 opacity-20" />
        <p className="text-lg">Nenhum jogo encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {jogos.map(jogo => (
        <GameCard 
          key={jogo.id} 
          jogo={jogo} 
          icon={statusIcons[jogo.status]} 
          iconColorClass={getIconColorClass(jogo.status)}
          onClick={() => handleClick(jogo)} 
        />
      ))}
    </div>
  );
});

export default GameGrid;
