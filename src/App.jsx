import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { jsPDF } from 'jspdf';

// Generate PDF ballot
const generateBallotPDF = (name, picks, isBlank = false) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });
  
  const pageWidth = 612;
  const pageHeight = 792;
  
  // Adjusted margins
  const marginLeft = 22;
  const marginRight = 15;
  const colGap = 12;
  const colWidth = (pageWidth - marginLeft - marginRight - colGap * 2) / 3;
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('OSCAR BALLOT 2026', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('98th Academy Awards', pageWidth / 2, 44, { align: 'center' });
  
  // Name line
  doc.setFontSize(10);
  if (isBlank) {
    doc.text('Name: ___________________', marginLeft, 60);
  } else {
    doc.text('Name: ' + name, marginLeft, 60);
  }
  
  // Categories data for PDF (shortened for space)
  const PDF_CATEGORIES = {
    'Best Picture': ['Bugonia', 'F1', 'Frankenstein', 'Hamnet', 'Marty Supreme', 'One Battle After Another', 'The Secret Agent', 'Sentimental Value', 'Sinners', 'Train Dreams'],
    'Best Director': ['Chloe Zhao - Hamnet', 'Josh Safdie - Marty Supreme', 'Paul Thomas Anderson - One Battle...', 'Joachim Trier - Sentimental Value', 'Ryan Coogler - Sinners'],
    'Best Actress': ['Jessie Buckley - Hamnet', 'Rose Byrne - If I Had Legs...', 'Kate Hudson - Song Sung Blue', 'Renate Reinsve - Sentimental Value', 'Emma Stone - Bugonia'],
    'Best Actor': ['Timothee Chalamet - Marty Supreme', 'Leonardo DiCaprio - One Battle...', 'Ethan Hawke - Blue Moon', 'Michael B. Jordan - Sinners', 'Wagner Moura - The Secret Agent'],
    'Best Supporting Actress': ['Elle Fanning - Sentimental Value', 'Inga Ibsdotter Lilleaas - Sentim...', 'Amy Madigan - Weapons', 'Wunmi Mosaku - Sinners', 'Teyana Taylor - One Battle...'],
    'Best Supporting Actor': ['Benicio Del Toro - One Battle...', 'Jacob Elordi - Frankenstein', 'Delroy Lindo - Sinners', 'Sean Penn - One Battle...', 'Stellan Skarsgard - Sentimental...'],
    'Best Original Screenplay': ['Blue Moon', 'It Was Just an Accident', 'Marty Supreme', 'Sentimental Value', 'Sinners'],
    'Best Adapted Screenplay': ['Bugonia', 'Frankenstein', 'Hamnet', 'One Battle After Another', 'Train Dreams'],
    'Best Animated Feature': ['Arco', 'Elio', 'KPop Demon Hunters', 'Little Amelie', 'Zootopia 2'],
    'Best International Feature': ['It Was Just an Accident (France)', 'The Secret Agent (Brazil)', 'Sentimental Value (Norway)', 'Sirat (Spain)', 'Voice of Hind Rajab (Tunisia)'],
    'Best Documentary Feature': ['The Alabama Solution', 'Come See Me in the Good Light', 'Cutting Through Rocks', 'Mr. Nobody Against Putin', 'The Perfect Neighbor'],
    'Best Original Score': ['Bugonia', 'Frankenstein', 'Hamnet', 'One Battle After Another', 'Sinners'],
    'Best Original Song': ['"Dear Me" - Diane Warren...', '"Golden" - KPop Demon Hunters', '"I Lied To You" - Sinners', '"Sweet Dreams of Joy" - Viva Verdi', '"Train Dreams" - Train Dreams'],
    'Best Cinematography': ['Bugonia', 'Hamnet', 'One Battle After Another', 'Sinners', 'Train Dreams'],
    'Best Film Editing': ['Bugonia', 'F1', 'Marty Supreme', 'One Battle After Another', 'Sinners'],
    'Best Production Design': ['Bugonia', 'Frankenstein', 'Hamnet', 'One Battle After Another', 'Sinners'],
    'Best Costume Design': ['Frankenstein', 'Hamnet', 'Marty Supreme', 'One Battle After Another', 'Sinners'],
    'Best Makeup and Hairstyling': ['Frankenstein', 'Hamnet', 'Marty Supreme', 'One Battle After Another', 'Sinners'],
    'Best Sound': ['Bugonia', 'F1', 'One Battle After Another', 'Sinners', 'Train Dreams'],
    'Best Visual Effects': ['Bugonia', 'F1', 'Frankenstein', 'One Battle After Another', 'Sinners']
  };
  
  const categoryOrder = [
    'Best Picture', 'Best Director', 'Best Actress', 'Best Actor',
    'Best Supporting Actress', 'Best Supporting Actor', 'Best Original Screenplay',
    'Best Adapted Screenplay', 'Best Animated Feature', 'Best International Feature',
    'Best Documentary Feature', 'Best Original Score', 'Best Original Song',
    'Best Cinematography', 'Best Film Editing', 'Best Production Design',
    'Best Costume Design', 'Best Makeup and Hairstyling', 'Best Sound', 'Best Visual Effects'
  ];
  
  // Split into 3 columns: 7, 7, 6
  const colCategories = [
    categoryOrder.slice(0, 7),
    categoryOrder.slice(7, 14),
    categoryOrder.slice(14, 20)
  ];
  
  colCategories.forEach((colCats, colIndex) => {
    const x = marginLeft + colIndex * (colWidth + colGap);
    let y = 80; // Start from top
    
    colCats.forEach((category) => {
      // Category name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      const shortCat = category.replace('Best ', '');
      doc.text(shortCat, x, y);
      y += 11;
      
      // Nominees
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const nominees = PDF_CATEGORIES[category] || [];
      
      nominees.forEach((nominee) => {
        const maxLen = 35;
        const display = nominee.length > maxLen ? nominee.substring(0, maxLen - 3) + '...' : nominee;
        
        // Check if this nominee matches user's pick
        const userPick = picks[category] || {};
        // Match by checking if the pick starts with the same name
        const pickName = userPick.willWin ? userPick.willWin.split(' – ')[0].split(' - ')[0] : '';
        const wantName = userPick.wantWin ? userPick.wantWin.split(' – ')[0].split(' - ')[0] : '';
        const nomineeName = nominee.split(' - ')[0];
        const willWin = !isBlank && pickName && nomineeName.includes(pickName);
        const wantWin = !isBlank && wantName && nomineeName.includes(wantName);
        
        // Draw circle
        const circleX = x + 4;
        const circleY = y - 2.5;
        const radius = 3.5;
        
        if (willWin) {
          doc.setFillColor(0, 0, 0);
          doc.circle(circleX, circleY, radius, 'F');
        } else {
          doc.setDrawColor(0, 0, 0);
          doc.circle(circleX, circleY, radius, 'S');
        }
        
        // Nominee text
        doc.text(display, x + 12, y);
        
        // Heart for want to win - use text since Unicode may not work
        if (wantWin) {
          const textWidth = doc.getTextWidth(display);
          doc.setFont('zapfdingbats', 'normal');
          doc.text('v', x + 14 + textWidth, y); // heart in zapfdingbats
          doc.setFont('helvetica', 'normal');
        }
        
        y += 10;
      });
      
      y += 5;
    });
  });
  
  // Legend for filled ballots at bottom
  if (!isBlank) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setFillColor(0, 0, 0);
    doc.circle(pageWidth / 2 - 70, pageHeight - 25, 3.5, 'F');
    doc.text('Will Win', pageWidth / 2 - 62, pageHeight - 22);
    doc.setFont('zapfdingbats', 'normal');
    doc.text('v', pageWidth / 2 + 5, pageHeight - 22);
    doc.setFont('helvetica', 'normal');
    doc.text('Want to Win', pageWidth / 2 + 15, pageHeight - 22);
  }
  
  // Save
  const filename = isBlank ? 'oscar-ballot-blank.pdf' : `oscar-ballot-${name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  doc.save(filename);
};

const CATEGORIES = {
  'Best Picture': [
    'Bugonia', 'F1', 'Frankenstein', 'Hamnet', 'Marty Supreme',
    'One Battle After Another', 'The Secret Agent', 'Sentimental Value', 'Sinners', 'Train Dreams'
  ],
  'Best Director': [
    'Chloé Zhao – Hamnet', 'Josh Safdie – Marty Supreme', 'Paul Thomas Anderson – One Battle After Another',
    'Joachim Trier – Sentimental Value', 'Ryan Coogler – Sinners'
  ],
  'Best Actress': [
    'Jessie Buckley – Hamnet', 'Rose Byrne – If I Had Legs I\'d Kick You', 'Kate Hudson – Song Sung Blue',
    'Renate Reinsve – Sentimental Value', 'Emma Stone – Bugonia'
  ],
  'Best Actor': [
    'Timothée Chalamet – Marty Supreme', 'Leonardo DiCaprio – One Battle After Another',
    'Ethan Hawke – Blue Moon', 'Michael B. Jordan – Sinners', 'Wagner Moura – The Secret Agent'
  ],
  'Best Supporting Actress': [
    'Elle Fanning – Sentimental Value', 'Inga Ibsdotter Lilleaas – Sentimental Value',
    'Amy Madigan – Weapons', 'Wunmi Mosaku – Sinners', 'Teyana Taylor – One Battle After Another'
  ],
  'Best Supporting Actor': [
    'Benicio Del Toro – One Battle After Another', 'Jacob Elordi – Frankenstein',
    'Delroy Lindo – Sinners', 'Sean Penn – One Battle After Another', 'Stellan Skarsgård – Sentimental Value'
  ],
  'Best Original Screenplay': [
    'Blue Moon', 'It Was Just an Accident', 'Marty Supreme', 'Sentimental Value', 'Sinners'
  ],
  'Best Adapted Screenplay': [
    'Bugonia', 'Frankenstein', 'Hamnet', 'One Battle After Another', 'Train Dreams'
  ],
  'Best Animated Feature': [
    'Arco', 'Elio', 'KPop Demon Hunters', 'Little Amélie or the Character of Rain', 'Zootopia 2'
  ],
  'Best International Feature': [
    'It Was Just an Accident (France)', 'The Secret Agent (Brazil)', 'Sentimental Value (Norway)',
    'Sirāt (Spain)', 'The Voice of Hind Rajab (Tunisia)'
  ],
  'Best Documentary Feature': [
    'The Alabama Solution', 'Come See Me in the Good Light', 'Cutting Through Rocks',
    'Mr. Nobody Against Putin', 'The Perfect Neighbor'
  ],
  'Best Original Score': [
    'Bugonia', 'Frankenstein', 'Hamnet', 'One Battle After Another', 'Sinners'
  ],
  'Best Original Song': [
    '"Dear Me" – Diane Warren: Relentless', '"Golden" – KPop Demon Hunters',
    '"I Lied To You" – Sinners', '"Sweet Dreams of Joy" – Viva Verdi', '"Train Dreams" – Train Dreams'
  ],
  'Best Cinematography': [
    'Frankenstein', 'Marty Supreme', 'One Battle After Another', 'Sinners', 'Train Dreams'
  ],
  'Best Film Editing': [
    'F1', 'Marty Supreme', 'One Battle After Another', 'Sentimental Value', 'Sinners'
  ],
  'Best Production Design': [
    'Frankenstein', 'Hamnet', 'Marty Supreme', 'One Battle After Another', 'Sinners'
  ],
  'Best Costume Design': [
    'Avatar: Fire and Ash', 'Frankenstein', 'Hamnet', 'Marty Supreme', 'Sinners'
  ],
  'Best Makeup and Hairstyling': [
    'Frankenstein', 'Kokuho', 'Sinners', 'The Smashing Machine', 'The Ugly Stepsister'
  ],
  'Best Sound': [
    'F1', 'Frankenstein', 'One Battle After Another', 'Sinners', 'Sirāt'
  ],
  'Best Visual Effects': [
    'Avatar: Fire and Ash', 'F1', 'Jurassic World Rebirth', 'The Lost Bus', 'Sinners'
  ]
};

const CATEGORY_ORDER = [
  'Best Picture', 'Best Director', 'Best Actress', 'Best Actor',
  'Best Supporting Actress', 'Best Supporting Actor', 'Best Original Screenplay', 'Best Adapted Screenplay',
  'Best Animated Feature', 'Best International Feature', 'Best Documentary Feature',
  'Best Original Score', 'Best Original Song', 'Best Cinematography', 'Best Film Editing',
  'Best Production Design', 'Best Costume Design', 'Best Makeup and Hairstyling', 'Best Sound', 'Best Visual Effects'
];

const generateId = () => Math.random().toString(36).substring(2, 10);

function OscarStatuette({ className = "h-7 text-amber-500" }) {
  return (
    <svg viewBox="0 0 100 300" className={className} fill="currentColor">
      <ellipse cx="50" cy="290" rx="30" ry="10" />
      <rect x="35" y="250" width="30" height="40" rx="2" />
      <rect x="42" y="200" width="16" height="50" />
      <ellipse cx="50" cy="200" rx="20" ry="8" />
      <ellipse cx="50" cy="160" rx="18" ry="25" />
      <circle cx="50" cy="100" r="22" />
      <rect x="20" y="120" width="25" height="8" rx="4" />
      <rect x="55" y="120" width="25" height="8" rx="4" />
      <rect x="10" y="115" width="15" height="18" rx="3" />
      <rect x="75" y="115" width="15" height="18" rx="3" />
    </svg>
  );
}

function NomineeRow({ nominee, currentPicks, onPick }) {
  const isWillWin = currentPicks.willWin === nominee;
  const isWishWin = currentPicks.wantWin === nominee;
  
  return (
    <div 
      onClick={() => {
        if (isWillWin) {
          onPick('willWin', null);
        } else {
          onPick('willWin', nominee);
        }
      }}
      className={`relative flex items-center p-4 rounded-xl cursor-pointer transition-all ${
        isWillWin 
          ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-400 shadow-sm' 
          : 'bg-amber-50/50 border-2 border-transparent hover:bg-amber-100/50'
      }`}
    >
      {isWillWin && (
        <span className="text-amber-500 text-lg mr-3">🏆</span>
      )}
      
      <span className={`flex-1 text-sm font-medium leading-relaxed ${
        isWillWin ? 'text-amber-900' : 'text-amber-800'
      }`}>
        {nominee}
      </span>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isWishWin) {
            onPick('wantWin', null);
          } else {
            onPick('wantWin', nominee);
          }
        }}
        className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-all text-sm ${
          isWishWin
            ? 'bg-rose-100 text-rose-500'
            : 'text-amber-400 hover:text-rose-400 hover:bg-rose-50'
        }`}
      >
        {isWishWin ? '★' : '☆'}
      </button>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('home');
  const [ballotId, setBallotId] = useState(null);
  const [voterName, setVoterName] = useState('');
  const [picks, setPicks] = useState({});
  const [winners, setWinners] = useState({});
  const [isOwner, setIsOwner] = useState(false);
  const [ballotData, setBallotData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set(CATEGORY_ORDER));
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const [highlightIncomplete, setHighlightIncomplete] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [shakeSaveButton, setShakeSaveButton] = useState(false);
  const [myBallots, setMyBallots] = useState([]);
  const [sharedBallots, setSharedBallots] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [scoreboardData, setScoreboardData] = useState([]);
  const [scoreboardMismatches, setScoreboardMismatches] = useState([]);
  const [scoreboardSource, setScoreboardSource] = useState(null);
  const [previousView, setPreviousView] = useState(null);

  // Load saved ballots from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('myBallots');
    if (saved) {
      setMyBallots(JSON.parse(saved));
    }
    const shared = localStorage.getItem('sharedBallots');
    if (shared) {
      setSharedBallots(JSON.parse(shared));
    }
  }, []);

  // Save ballot to myBallots list
  const saveToMyBallots = (id, name) => {
    const existing = myBallots.filter(b => b.id !== id);
    const updated = [...existing, { id, name, savedAt: new Date().toISOString() }];
    setMyBallots(updated);
    localStorage.setItem('myBallots', JSON.stringify(updated));
  };

  // Save ballot to sharedBallots list (ballots shared with me)
  const saveToSharedBallots = (id, name) => {
    // Don't save if it's one of my own ballots - read directly from localStorage to avoid stale state
    const myBallotsFromStorage = JSON.parse(localStorage.getItem('myBallots') || '[]');
    if (myBallotsFromStorage.some(b => b.id === id)) return;
    const existing = sharedBallots.filter(b => b.id !== id);
    const updated = [...existing, { id, name, savedAt: new Date().toISOString() }];
    setSharedBallots(updated);
    localStorage.setItem('sharedBallots', JSON.stringify(updated));
  };

  // Delete ballot from myBallots list
  const deleteFromMyBallots = async (id) => {
    if (!confirm('Delete this ballot? This cannot be undone.')) return;
    const updated = myBallots.filter(b => b.id !== id);
    setMyBallots(updated);
    localStorage.setItem('myBallots', JSON.stringify(updated));
    // Also delete from database
    try {
      await supabase.from('ballots').delete().eq('id', id);
    } catch (e) {
      console.error('Error deleting ballot:', e);
    }
  };

  // Remove ballot from sharedBallots list (just local, doesn't delete from db)
  const removeFromSharedBallots = (id) => {
    const updated = sharedBallots.filter(b => b.id !== id);
    setSharedBallots(updated);
    localStorage.setItem('sharedBallots', JSON.stringify(updated));
  };

  // Navigate to home and clear URL
  const goHome = () => {
    window.history.pushState({}, '', window.location.pathname);
    setBallotId(null);
    setBallotData(null);
    setVoterName('');
    setPicks({});
    setWinners({});
    setView('home');
  };

  useEffect(() => {
    const loadBallot = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('ballot');
      if (id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('ballots')
            .select('*')
            .eq('id', id)
            .single();
          
          if (data && !error) {
            setBallotData({
              name: data.voter_name,
              picks: data.picks
            });
            setBallotId(id);
            setView('view');
            // Save to shared ballots if not one of mine
            saveToSharedBallots(id, data.voter_name);
            // Load winners from Supabase
            if (data.winners) {
              setWinners(data.winners);
            }
          } else {
            setView('home');
          }
        } catch (e) {
          console.log('Ballot not found');
          setView('home');
        }
        setLoading(false);
      }
    };
    loadBallot();
  }, []);

  const startNewBallot = () => {
    setPicks({});
    setVoterName('');
    setBallotId(null);
    setIsOwner(true);
    setView('create');
  };

  const handlePick = (category, nominee, type, value) => {
    setPicks(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: value
      }
    }));
  };

  const saveBallot = async (forcesSave = false) => {
    if (!voterName.trim()) {
      setNameError(true);
      return;
    }
    
    const incompleteCategories = CATEGORY_ORDER.filter(cat => !picks[cat]?.willWin);
    
    if (incompleteCategories.length > 0 && !forcesSave) {
      setShowIncompleteWarning(true);
      return;
    }

    const id = ballotId || generateId();
    const ballotPayload = {
      id,
      voter_name: voterName,
      picks,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('ballots')
        .upsert(ballotPayload, { onConflict: 'id' });
      
      if (error) throw error;
      
      setBallotId(id);
      setBallotData({ name: voterName, picks });
      saveToMyBallots(id, voterName);
      setView('share');
    } catch (e) {
      console.error('Error saving ballot:', e);
      alert('Error saving ballot. Please try again.');
    }
  };

  const handleGoBackAndFinish = () => {
    setShowIncompleteWarning(false);
    setHighlightIncomplete(true);
    const incompleteCategories = CATEGORY_ORDER.filter(cat => !picks[cat]?.willWin);
    setExpandedCategories(new Set(incompleteCategories));
  };

  const markWinner = async (category, nominee) => {
    const newWinners = { ...winners, [category]: nominee };
    setWinners(newWinners);
    if (ballotId) {
      // Save to Supabase
      try {
        await supabase
          .from('ballots')
          .update({ winners: newWinners })
          .eq('id', ballotId);
      } catch (e) {
        console.error('Error saving winner:', e);
      }
    }
  };

  const removeWinner = async (category) => {
    const newWinners = { ...winners };
    delete newWinners[category];
    setWinners(newWinners);
    if (ballotId) {
      try {
        await supabase
          .from('ballots')
          .update({ winners: newWinners })
          .eq('id', ballotId);
      } catch (e) {
        console.error('Error removing winner:', e);
      }
    }
  };

  // Load scoreboard data
  const loadScoreboard = async () => {
    const allBallotIds = [
      ...myBallots.map(b => b.id),
      ...sharedBallots.map(b => b.id)
    ];
    
    if (allBallotIds.length === 0) {
      setScoreboardData([]);
      setScoreboardSource(null);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('ballots')
        .select('id, voter_name, picks, winners')
        .in('id', allBallotIds);
      
      if (error) throw error;
      
      // Find the ballot with the most winners marked
      let sourceBallot = null;
      let maxWinners = 0;
      data.forEach(ballot => {
        const winnerCount = Object.keys(ballot.winners || {}).length;
        if (winnerCount > maxWinners) {
          maxWinners = winnerCount;
          sourceBallot = ballot;
        }
      });
      
      if (!sourceBallot || maxWinners === 0) {
        setScoreboardData([]);
        setScoreboardSource(null);
        return;
      }
      
      const sourceWinners = sourceBallot.winners || {};
      setScoreboardSource({ name: sourceBallot.voter_name, count: maxWinners });
      
      // Calculate scores for each ballot based on source ballot's winners
      const scores = data.map(ballot => {
        let correct = 0;
        let heartCorrect = 0;
        const total = Object.keys(sourceWinners).length;
        
        Object.entries(sourceWinners).forEach(([category, winner]) => {
          if (ballot.picks[category]?.willWin === winner) {
            correct++;
          }
          if (ballot.picks[category]?.wantWin === winner) {
            heartCorrect++;
          }
        });
        
        return {
          id: ballot.id,
          name: ballot.voter_name,
          correct,
          heartCorrect,
          total,
          winners: ballot.winners || {}
        };
      });
      
      // Sort by correct picks descending, then by hearts
      scores.sort((a, b) => {
        if (b.correct !== a.correct) return b.correct - a.correct;
        return b.heartCorrect - a.heartCorrect;
      });
      setScoreboardData(scores);
      
      // Find mismatches
      const mismatches = [];
      Object.entries(sourceWinners).forEach(([category, winner]) => {
        data.forEach(ballot => {
          if (ballot.id === sourceBallot.id) return; // Skip source ballot
          const theirWinner = ballot.winners?.[category];
          if (theirWinner && theirWinner !== winner) {
            mismatches.push({
              category,
              thisWinner: winner,
              otherBallotName: ballot.voter_name,
              otherWinner: theirWinner,
              otherBallotId: ballot.id
            });
          }
        });
      });
      setScoreboardMismatches(mismatches);
      
    } catch (e) {
      console.error('Error loading scoreboard:', e);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?ballot=${ballotId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculateScore = () => {
    if (!ballotData) return { correct: 0, heartCorrect: 0, total: 0 };
    let correct = 0;
    let heartCorrect = 0;
    let total = Object.keys(winners).length;
    
    Object.entries(winners).forEach(([category, winner]) => {
      if (ballotData.picks[category]?.willWin === winner) {
        correct++;
      }
      if (ballotData.picks[category]?.wantWin === winner) {
        heartCorrect++;
      }
    });
    
    return { correct, heartCorrect, total };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-2xl font-medium text-amber-800 animate-pulse">Loading ballot...</div>
      </div>
    );
  }

  // Home Screen
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md w-full">
          <div className="text-8xl mb-4">🏆</div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 mb-2" style={{ fontFamily: 'system-ui' }}>
            Oscar Ballot
          </h1>
          <p className="text-lg text-amber-800/70 mb-8">98th Academy Awards • 2026</p>
          
          <button
            onClick={startNewBallot}
            className="w-full py-4 px-8 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-xl font-bold rounded-2xl shadow-lg shadow-orange-300/50 hover:shadow-xl hover:shadow-orange-300/60 transform hover:-translate-y-1 transition-all duration-200"
          >
            Create Your Ballot
          </button>
          
          {myBallots.length > 0 && (
            <div className="mt-8 w-full text-left">
              <p className="text-sm text-amber-700/60 mb-3 font-medium">My Ballots</p>
              <div className="space-y-2">
                {myBallots.map((ballot) => (
                  <div 
                    key={ballot.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 flex items-center justify-between"
                  >
                    <span className="font-medium text-amber-900">{ballot.name}'s Ballot</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          window.location.href = `${window.location.origin}${window.location.pathname}?ballot=${ballot.id}`;
                        }}
                        className="text-xs px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteFromMyBallots(ballot.id)}
                        className="text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {sharedBallots.length > 0 && (
            <div className="mt-8 w-full text-left">
              <p className="text-sm text-amber-700/60 mb-3 font-medium">Shared with me</p>
              <div className="space-y-2">
                {sharedBallots.map((ballot) => (
                  <div 
                    key={ballot.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 flex items-center justify-between"
                  >
                    <span className="font-medium text-amber-900">{ballot.name}'s Ballot</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          window.location.href = `${window.location.origin}${window.location.pathname}?ballot=${ballot.id}`;
                        }}
                        className="text-xs px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => removeFromSharedBallots(ballot.id)}
                        className="text-xs px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-500 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {myBallots.length === 0 && sharedBallots.length === 0 && (
            <p className="mt-8 text-sm text-amber-700/60">
              Make your picks, share with friends, score as you watch!
            </p>
          )}
          
          <div className="mt-8 text-center">
            <button
              onClick={() => generateBallotPDF('', {}, true)}
              className="text-sm text-amber-600 hover:text-amber-800 underline underline-offset-2"
            >
              Old school? Print blank ballot.
            </button>
            <p className="text-xs text-amber-500/70 mt-1">
              You can also download a filled-in PDF from any completed ballot.
            </p>
          </div>
        </div>
        
        <a 
          href="https://buymeacoffee.com/patheticle" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-medium py-2 px-4 rounded-full transition-colors flex items-center gap-2"
        >
          ☕ Buy me a coffee
        </a>
      </div>
    );
  }

  // Create Ballot Screen
  if (view === 'create') {
    const completedCount = Object.keys(picks).filter(cat => picks[cat]?.willWin).length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pb-32">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-amber-200/50 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <button onClick={goHome} className="text-amber-700 hover:text-amber-900 font-medium text-sm mb-2">
              ← My Ballots
            </button>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-500">
              Your Ballot
            </h1>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Your name"
                value={voterName}
                onChange={(e) => {
                  setVoterName(e.target.value);
                  if (nameError) setNameError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    e.target.blur();
                  }
                }}
                className={`w-full px-4 py-2 bg-white border-2 rounded-xl text-amber-900 placeholder:text-amber-400 focus:outline-none transition-colors ${
                  nameError 
                    ? 'border-red-400 shake' 
                    : 'border-amber-200 focus:border-orange-400'
                }`}
              />
              {nameError && (
                <p className="text-red-500 text-xs mt-1 font-medium">Please enter your name</p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {CATEGORY_ORDER.map((category) => {
            const nominees = CATEGORIES[category];
            const isExpanded = expandedCategories.has(category);
            const currentPicks = picks[category] || {};
            const hasWillWin = !!currentPicks.willWin;
            
            const toggleCategory = () => {
              setExpandedCategories(prev => {
                const next = new Set(prev);
                if (next.has(category)) {
                  next.delete(category);
                } else {
                  next.add(category);
                }
                return next;
              });
            };

            const isIncomplete = !hasWillWin && highlightIncomplete;
            
            return (
              <div 
                key={category}
                id={`category-${category}`}
                className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all duration-200 ${
                  hasWillWin ? 'border-green-300' : isIncomplete ? 'border-orange-400 glow-pulse' : 'border-amber-100'
                }`}
              >
                <button
                  onClick={toggleCategory}
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    {hasWillWin && <span className="text-green-500 text-xl">✓</span>}
                    <span className="font-bold text-amber-900">{category}</span>
                  </div>
                  <span className={`text-lg text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    ⌄
                  </span>
                </button>
                
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-amber-700 font-medium">Tap to pick winner</p>
                      <p className="text-xs text-amber-700 font-medium">☆ wish they'd win</p>
                    </div>
                    {nominees.map((nominee) => (
                      <NomineeRow 
                        key={nominee}
                        nominee={nominee}
                        currentPicks={currentPicks}
                        onPick={(type, value) => handlePick(category, nominee, type, value)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-amber-200">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => saveBallot(false)}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg hover:shadow-xl ${shakeSaveButton ? 'shake' : ''}`}
            >
              Save & Get Share Link
            </button>
          </div>
        </div>

        {/* Floating progress counter */}
        {completedCount > 0 && (
          <div className="fixed bottom-32 left-4 bg-white/90 px-3 py-1 rounded-full z-10">
            <span className="text-base font-bold text-amber-700">{completedCount}</span>
            <span className="text-xs font-medium text-amber-600"> / {CATEGORY_ORDER.length}</span>
          </div>
        )}

        {/* Incomplete Warning Modal */}
        {showIncompleteWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="text-4xl mb-3 text-center">🤔</div>
              <h2 className="text-xl font-bold text-amber-900 text-center mb-2">Not quite done!</h2>
              <p className="text-amber-700 text-center mb-4">
                You haven't picked "Will Win" for {CATEGORY_ORDER.filter(cat => !picks[cat]?.willWin).length} categories.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleGoBackAndFinish}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                >
                  Go Back & Finish
                </button>
                <button
                  onClick={() => {
                    setShowIncompleteWarning(false);
                    saveBallot(true);
                  }}
                  className="w-full py-3 rounded-xl font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  Save Anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Share Screen
  if (view === 'share') {
    const url = `${window.location.origin}${window.location.pathname}?ballot=${ballotId}`;
    const shareText = `Check out my Oscar ballot! ${url}`;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-amber-200/50 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <button onClick={goHome} className="text-amber-700 hover:text-amber-900 font-medium text-sm">
              ← My Ballots
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-6 min-h-[calc(100vh-60px)]">
          <div className="text-center max-w-md bg-white rounded-3xl p-8 shadow-xl">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-black text-amber-900 mb-2">Ballot Saved!</h1>
            <p className="text-amber-700 mb-6">Share with friends to let them score your picks!</p>
            
            <div className="bg-amber-50 rounded-xl p-4 mb-4 break-all text-sm text-amber-800 font-mono">
              {url}
            </div>
            
            <p className="text-sm text-amber-600 mb-3 font-medium">Ways to share:</p>
            <div className="flex gap-2 mb-6">
              <button
                onClick={copyLink}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <a
                href={`sms:?body=${encodeURIComponent(shareText)}`}
                className="flex-1 py-2 px-4 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium transition-colors text-center"
              >
                Text
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent('My Oscar Ballot')}&body=${encodeURIComponent(shareText)}`}
                className="flex-1 py-2 px-4 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition-colors text-center"
              >
                Email
              </a>
            </div>
            
            <button
              onClick={() => {
                setBallotData({ name: voterName, picks });
                setView('view');
              }}
              className="w-full py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg transition-all"
            >
              View My Ballot
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View/Score Ballot Screen
  if (view === 'view' && ballotData) {
    const score = calculateScore();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pb-8">
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-amber-200/50 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <button onClick={goHome} className="text-amber-700 hover:text-amber-900 font-medium text-sm">
                ← My Ballots
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-2xl text-amber-700 hover:text-amber-900 px-2"
                >
                  ☰
                </button>
                {showMenu && (
                  <>
                    {/* Overlay to close menu when clicking outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowMenu(false)}
                    />
                    {/* Menu dropdown */}
                    <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-amber-100 py-2 min-w-[160px] z-50">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setPreviousView('view');
                          loadScoreboard();
                          setView('scoreboard');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-amber-800 hover:bg-amber-50"
                      >
                        🏆 Scoreboard
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setVoterName(ballotData.name);
                          setPicks(ballotData.picks);
                          setIsOwner(true);
                          setView('create');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-amber-800 hover:bg-amber-50"
                      >
                        ✏️ Edit Ballot
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          generateBallotPDF(ballotData.name, ballotData.picks, false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-amber-800 hover:bg-amber-50"
                      >
                        📄 Download PDF
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          copyLink();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-amber-800 hover:bg-amber-50"
                      >
                        🔗 {copied ? 'Link Copied!' : 'Share Link'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-amber-900">{ballotData.name}'s Ballot</h1>
                <p className="text-sm text-amber-600">Tap winners as they're announced</p>
              </div>
              {score.total > 0 && (
                <div className="text-right">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl">
                    <span className="text-2xl font-black">{score.correct}</span>
                    <span className="text-sm font-medium">/{score.total}</span>
                  </div>
                  {score.total > 0 && score.heartCorrect > 0 && (
                    <div className="text-xs text-rose-500 mt-1">
                      ❤️ {score.heartCorrect} heart pick{score.heartCorrect !== 1 ? 's' : ''} won
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {CATEGORY_ORDER.map((category, index) => {
            const nominees = CATEGORIES[category];
            const userPicks = ballotData.picks[category] || {};
            const winner = winners[category];
            const isCorrect = winner && userPicks.willWin === winner;
            const isWrong = winner && userPicks.willWin && userPicks.willWin !== winner;
            const heartCorrect = isWrong && userPicks.wantWin === winner;
            
            return (
              <div 
                key={category}
                className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all ${
                  isCorrect ? 'border-green-400 bg-green-50/30' : 
                  isWrong ? 'border-rose-300 bg-rose-50/30' : 
                  'border-amber-100'
                }`}
              >
                <div className="px-5 py-4 border-b border-amber-100/50 flex items-center justify-between">
                  <span className="font-bold text-amber-900">
                    <span className="text-amber-400 mr-2">{index + 1}.</span>
                    {category}
                  </span>
                  {isCorrect && <span className="text-green-500 text-xl">✓ Correct!</span>}
                  {isWrong && !heartCorrect && <span className="text-rose-400 text-sm">✗ Wrong</span>}
                  {heartCorrect && <span className="text-rose-400 text-sm">✗ Wrong, but your heart was right! ❤️</span>}
                </div>
                
                <div className="p-4 space-y-2">
                  {userPicks.willWin && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl ${
                      isCorrect ? 'bg-green-100' : isWrong ? 'bg-rose-100' : 'bg-amber-100'
                    }`}>
                      <span className="text-lg">🏆</span>
                      <span className="font-semibold text-amber-900 flex-1">{userPicks.willWin}</span>
                      <span className="text-xs text-amber-600 uppercase tracking-wide">Will Win</span>
                    </div>
                  )}
                  {userPicks.wantWin && userPicks.wantWin !== userPicks.willWin && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50">
                      <span className="text-lg">❤️</span>
                      <span className="font-medium text-amber-800 flex-1">{userPicks.wantWin}</span>
                      <span className="text-xs text-rose-500 uppercase tracking-wide">Want to Win</span>
                    </div>
                  )}
                  
                  {!winner && (
                    <div className="pt-3 border-t border-amber-200 mt-3">
                      <p className="text-xs text-stone-500 uppercase tracking-wide mb-2 font-semibold">Mark the winner:</p>
                      <div className="flex flex-wrap gap-2">
                        {nominees.map((nominee) => (
                          <button
                            key={nominee}
                            onClick={() => markWinner(category, nominee)}
                            className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full transition-colors truncate max-w-[150px]"
                            title={nominee}
                          >
                            {nominee.length > 20 ? nominee.substring(0, 20) + '...' : nominee}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {winner && (
                    <div className="pt-3 border-t border-amber-200 mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500">🎬</span>
                        <span className="text-sm text-amber-700"><span className="font-semibold">Winner:</span> {winner}</span>
                      </div>
                      <button
                        onClick={() => removeWinner(category)}
                        className="text-xs text-stone-400 hover:text-stone-600"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-2xl mx-auto px-4 mt-8 space-y-3">
          <button
            onClick={() => {
              setVoterName(ballotData.name);
              setPicks(ballotData.picks);
              setIsOwner(true);
              setView('create');
            }}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg transition-all"
          >
            Edit Ballot
          </button>
          <button
            onClick={() => generateBallotPDF(ballotData.name, ballotData.picks, false)}
            className="w-full py-3 rounded-xl font-medium bg-white border-2 border-amber-300 text-amber-700 hover:bg-amber-50 transition-all"
          >
            Download PDF
          </button>
          <button
            onClick={copyLink}
            className="w-full py-3 rounded-xl font-medium bg-amber-50 border-2 border-amber-200 text-amber-600 hover:bg-amber-100 transition-all"
          >
            {copied ? '✓ Link Copied!' : 'Share This Ballot'}
          </button>
        </div>
      </div>
    );
  }

  // Scoreboard View
  if (view === 'scoreboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 pb-8">
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-amber-200/50 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => setView(previousView || 'home')} 
              className="text-amber-700 hover:text-amber-900 font-medium text-sm"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-amber-900">🏆 Scoreboard</h1>
            {scoreboardSource ? (
              <p className="text-sm text-amber-600 mt-1">
                {scoreboardSource.count}/20 announced • Winners from {scoreboardSource.name}'s ballot
              </p>
            ) : (
              <p className="text-sm text-amber-600 mt-1">No winners marked yet</p>
            )}
          </div>

          {scoreboardData.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-amber-600">
                {scoreboardSource === null 
                  ? "No winners have been marked yet. View a ballot and start marking winners!"
                  : "No shared ballots yet. Share your ballot with friends to see the scoreboard!"}
              </p>
            </div>
          ) : (
            <>
              {/* Score table */}
              <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-amber-600 uppercase tracking-wide bg-amber-50">
                      <th className="px-4 py-3"></th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3 text-center">Picks</th>
                      <th className="px-4 py-3 text-center">❤️</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreboardData.map((entry, index) => (
                      <tr key={entry.id} className={`border-t border-amber-50 ${index === 0 ? 'bg-amber-50/50' : ''}`}>
                        <td className="px-4 py-4 text-amber-400 font-bold">{index + 1}.</td>
                        <td className="px-4 py-4 font-medium text-amber-900">{entry.name}</td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-amber-900">{entry.correct}</span>
                          <span className="text-amber-400">/{entry.total}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-rose-500">{entry.heartCorrect}</span>
                          <span className="text-rose-300">/{entry.total}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mismatches */}
              {scoreboardMismatches.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-4">
                  <h3 className="text-sm font-bold text-amber-900 mb-3">⚠️ Winner Mismatches</h3>
                  <div className="space-y-2">
                    {scoreboardMismatches.map((m, i) => (
                      <div key={i} className="text-sm bg-amber-50 rounded-lg p-3">
                        <span className="font-medium text-amber-900">{m.category}:</span>
                        <span className="text-amber-700"> "{m.thisWinner}" vs </span>
                        <span className="text-amber-900 font-medium">{m.otherBallotName}'s</span>
                        <span className="text-amber-700"> "{m.otherWinner}"</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-500 mt-3">
                    To fix: go to My Ballots and update the winner on the mismatched ballot
                  </p>
                </div>
              )}
            </>
          )}

          <button 
            onClick={loadScoreboard}
            className="w-full mt-6 py-3 rounded-xl font-medium bg-white border-2 border-amber-200 text-amber-600 hover:bg-amber-50 transition-all"
          >
            ↻ Refresh Scores
          </button>
        </div>
      </div>
    );
  }

  return null;
}
