import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Map() {
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    axios.get('/api/levels').then(res => setLevels(res.data)).catch(console.error);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Noesis Levels</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {levels.map(level => (
          <div key={level._id} style={{ opacity: level.isUnlocked ? 1 : 0.5, border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <h2>Level {level.number}: {level.title}</h2>
            <p>{level.description}</p>
            {level.isUnlocked ? (
              <Link to={`/level/${level._id}`}><button>Go to Level</button></Link>
            ) : (
              <span>Locked</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
