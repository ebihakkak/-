import { useState, useEffect } from "react";
import { FaBrain } from "react-icons/fa";

export default function MemoryGame() {
  const [mode, setMode] = useState(null);
  const [level, setLevel] = useState(1);
  const [shuffled, setShuffled] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [turn, setTurn] = useState("user");
  const [memory, setMemory] = useState({});
  const [score, setScore] = useState({ user: 0, system: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mode) return;
    const maxDots = level + 2;
    const patterns = [];
    for (let i = 2; i <= maxDots; i++) patterns.push(i, i);
    const shuffledCards = patterns.map((dots, index) => ({ id: index, dots })).sort(() => Math.random() - 0.5);
    setShuffled(shuffledCards);
    setSelected([]);
    setMatched([]);
    setTurn("user");
    setMemory({});
    setIsProcessing(false);
  }, [level, mode]);

  const processMatch = (first, second, currentTurn) => {
    setIsProcessing(true);
    const match = first.dots === second.dots;
    if (match) {
      setMatched(prev => [...prev, first.id, second.id]);
      if (currentTurn === 'user') setScore(s => ({ ...s, user: s.user + 1 }));
      else setScore(s => ({ ...s, system: s.system + 1 }));
    } else {
      setMemory(m => ({ ...m, [first.id]: first.dots, [second.id]: second.dots }));
    }

    if (!match && currentTurn === 'user' && mode === '2') {
      setTimeout(() => {
        setSelected([]);
        setTimeout(() => setTurn('system'), 1200);
        setIsProcessing(false);
      }, 800);
    } else {
      setTimeout(() => {
        setSelected([]);
        setIsProcessing(false);
        if (match && currentTurn === 'system' && mode === '2') {
          const remainingPairs = shuffled.filter(c => !matched.includes(c.id));
          if (remainingPairs.length >= 2) setTurn('system');
          else setTurn('user');
        } else if (match && currentTurn === 'user' && mode === '2') {
          setTurn('user');
        } else {
          setTurn(currentTurn === 'user' && mode === '2' ? 'system' : 'user');
        }
      }, 1000);
    }
  };

  const handleClick = (card, forcedTurn = turn) => {
    if (selected.length === 2 || selected.find(c => c.id === card.id) || matched.includes(card.id) || isProcessing) return;
    const newSelected = [...selected, card];
    setSelected(newSelected);
    if (newSelected.length === 2) {
      setTimeout(() => processMatch(newSelected[0], newSelected[1], forcedTurn), 600);
    }
  };

  const getSystemChoice = () => {
    const memoryEntries = Object.entries(memory);
    let choice = [];
    for (let i = 0; i < memoryEntries.length; i++) {
      for (let j = i + 1; j < memoryEntries.length; j++) {
        if (memoryEntries[i][1] === memoryEntries[j][1] && !matched.includes(parseInt(memoryEntries[i][0])) && !matched.includes(parseInt(memoryEntries[j][0]))) {
          choice = [parseInt(memoryEntries[i][0]), parseInt(memoryEntries[j][0])];
          break;
        }
      }
      if (choice.length) break;
    }
    if (choice.length === 0) {
      const unseen = shuffled.filter(c => !matched.includes(c.id));
      choice = unseen.sort(() => Math.random() - 0.5).slice(0, 2).map(c => c.id);
    }
    return shuffled.filter(c => choice.includes(c.id));
  };

  useEffect(() => {
    if (turn === 'system' && mode === '2' && !isProcessing) {
      const nextCards = getSystemChoice();
      if (nextCards.length === 2) {
        setTimeout(() => {
          setSelected(nextCards);
          setTimeout(() => processMatch(nextCards[0], nextCards[1], 'system'), 700);
        }, 1200);
      }
    }
  }, [turn, isProcessing, shuffled, matched, memory, mode]);

  useEffect(() => {
    if (shuffled.length > 0 && matched.length === shuffled.length) setTimeout(() => setLevel(prev => prev + 1), 1500);
  }, [matched, shuffled]);

  if (showIntro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-6">
        <h1 className="text-5xl text-white font-bold">Game Maker</h1>
        <h2 className="text-3xl text-white font-bold">Ebi Hakkak</h2>
        <FaBrain className="text-8xl mt-6 text-blue-600" />
      </div>
    );
  }

  if (!mode) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-200 to-pink-200 gap-6">
      <h1 className="text-4xl font-bold">🧩 Select Game Mode</h1>
      <button onClick={() => setMode('1')} className="px-6 py-3 text-xl bg-green-500 text-white rounded-xl shadow-lg">Single Player</button>
      <button onClick={() => setMode('2')} className="px-6 py-3 text-xl bg-blue-500 text-white rounded-xl shadow-lg">Two Players (You vs System)</button>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-200 to-blue-200 p-4">
      <div className="absolute top-4 left-4 text-blue-600 text-2xl font-bold">LEVEL: {level}</div>
      <h1 className="text-3xl font-bold mb-2">🧩 Memory Game with Dots</h1>
      {mode === '2' && <div className="text-center mb-4">
        <p className="text-xl font-bold text-gray-700">Score</p>
        <p className="mb-4 text-2xl font-bold text-red-600">You: {score.user} | System: {score.system}</p>
      </div>}
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${Math.min(6, Math.ceil(shuffled.length / 2))}, 1fr)` }}>
        {shuffled.map(card => {
          const isFlipped = selected.find(c => c.id === card.id) || matched.includes(card.id);
          return (
            <div key={card.id} className={`w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center cursor-pointer transform transition-transform duration-300 ${isFlipped ? 'rotate-y-180' : ''}`} onClick={() => turn === 'user' && handleClick(card)}>
              {isFlipped ? (
                <div className="flex flex-wrap gap-2 justify-center items-center">
                  {Array.from({ length: card.dots }).map((_, i) => <div key={i} className="w-4 h-4 bg-black rounded-full"></div>)}
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-400 rounded-lg"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
