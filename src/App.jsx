import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const INITIAL_PLAYERS = ['SilverSunrise', 'RINS_RING', 'Nagasaki', 'yoxiyo'];
const BLOCK_COUNT = 4;
const ANIMATION_DURATION = 5000; 
const LAST_PLAYER_DELAY = 1000;

function App() {
  const [blocks, setBlocks] = useState(Array(BLOCK_COUNT).fill(null));
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedBlock, setHighlightedBlock] = useState(null);
  const [isWaitingForLastPlayer, setIsWaitingForLastPlayer] = useState(false);
  const animationRef = useRef(null);
  const lastHighlightedBlockRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSound = () => {
    if (audioContextRef.current) {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.1);
    }
  };

  const shufflePlayers = () => {
    setPlayers(prevPlayers => {
      const shuffled = [...prevPlayers];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  };

  const drawNextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setIsAnimating(true);
      animateDrawing();
    }
  };

  const animateDrawing = () => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / ANIMATION_DURATION, 1);
      
      const interval = 50 + (progress * 450); 
      
      if (progress < 1) {
        const emptyBlocks = blocks.map((b, i) => b === null ? i : null).filter(i => i !== null);
        const randomIndex = emptyBlocks[Math.floor(Math.random() * emptyBlocks.length)];
        setHighlightedBlock(randomIndex);
        lastHighlightedBlockRef.current = randomIndex;

        playSound();

        animationRef.current = setTimeout(() => {
          requestAnimationFrame(animate);
        }, interval);
      } else {
        setBlocks(prev => {
          const newBlocks = [...prev];
          newBlocks[lastHighlightedBlockRef.current] = { name: players[currentPlayerIndex], isNew: true };
          return newBlocks;
        });
        setCurrentPlayerIndex(prev => prev + 1);
        setHighlightedBlock(null);
        setIsAnimating(false);

        setTimeout(() => {
          setBlocks(prev => prev.map(block => 
            block && block.isNew ? { ...block, isNew: false } : block
          ));
        }, 1000);
      }
    };

    requestAnimationFrame(animate);
  };

  const placeLastPlayer = () => {
    setIsWaitingForLastPlayer(true);
    const lastEmptyIndex = blocks.findIndex(block => block === null);
    
    setTimeout(() => {
      setBlocks(prev => {
        const newBlocks = [...prev];
        newBlocks[lastEmptyIndex] = { name: players[currentPlayerIndex], isNew: true };
        return newBlocks;
      });
      setCurrentPlayerIndex(prev => prev + 1);
      setIsWaitingForLastPlayer(false);

      setTimeout(() => {
        setBlocks(prev => prev.map(block => 
          block && block.isNew ? { ...block, isNew: false } : block
        ));
      }, 1000);
    }, LAST_PLAYER_DELAY);
  };

  useEffect(() => {
    if (currentPlayerIndex === players.length - 1) {
      placeLastPlayer();
    }
  }, [currentPlayerIndex, players.length]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const resetGame = () => {
    setBlocks(Array(BLOCK_COUNT).fill(null));
    setCurrentPlayerIndex(0);
    setIsAnimating(false);
    setHighlightedBlock(null);
    setIsWaitingForLastPlayer(false);
    lastHighlightedBlockRef.current = null;
  };

  return (
    <div className="w-[1920px] h-[1080px] flex flex-col items-center justify-center overflow-hidden transition-all duration-300 text-white bg-gray-900 p-4">

      <div className="absolute h-[700px] top-[280px] left-[608px] flex flex-col space-y-[100px]  z-20">
        {blocks.map((block, index) => (
          <div 
            key={index} 
            className={` w-[210px] text-center h-[39px] flex flex-col items-center justify-center text-lg font-semibold rounded-full shadow-md transition-all duration-300
              ${highlightedBlock === index ? 'bg-blue-200/50' : 'bg-white/0'} 
              ${block && block.isNew ? ' animate-ping' : ''}
              ${!block && isWaitingForLastPlayer ? 'bg-gray-200' : ''}
            `}
          >
            {block && block.name}
            {!block && isWaitingForLastPlayer && (
              <div className="w-8 h-8 border-t-4 border-white-500 rounded-full animate-spin"></div>
            )}
          </div>
        ))}
      </div>
      <div className="absolute right-[150px] bg-white/5 border border-white/25 backdrop-blur-sm w-[220px] py-5 rounded-2xl flex flex-col justify-center items-center space-y-5 z-10">
        <h3 className="text-2xl font-bold mb-2 ">Игроки:</h3>
        <div className="list-decimal list-inside text-center text-lg font-semibold">
          {players.map((player, index) => (
            <div key={index} className={`${index === currentPlayerIndex ? 'text-blue-300 font-bold' : ''}`}>
              {player}
            </div>
          ))}
        </div>
        {currentPlayerIndex < players.length - 1 ? (
        <div className="flex transition-all duration-300 flex-col space-y-4 z-10">
          <button 
            onClick={drawNextPlayer} 
            disabled={isAnimating || isWaitingForLastPlayer}
            className="px-4 py-2 bg-gray-500/25 text-white rounded-full transition-all duration-300 hover:bg-gray-600/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Зарандомить игрока
          </button>
          <button 
            onClick={shufflePlayers} 
            disabled={isAnimating || isWaitingForLastPlayer || currentPlayerIndex > 0}
            className="px-4 py-2 bg-gray-500/25 text-white rounded-full transition-all duration-300 hover:bg-gray-600/80 disabled:hidden disabled:cursor-not-allowed"
          >
            Перемешать игроков
          </button>
        </div>
      ) : currentPlayerIndex === players.length ? (
        <button 
          onClick={resetGame}
          className="hidden px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reset Game
        </button>
      ) : null}
      </div>

      <img className='absolute h-[700px] z-10' src="./сетка.png" alt="" />
      <video autoPlay loop className='absolute left-0 top-0' src="./bracket_bg.mp4" muted></video>

    </div>
  );
}

export default App;