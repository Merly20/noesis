import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function Level() {
  const { levelId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`/api/levels/${levelId}`).then(res => setData(res.data)).catch(console.error);
  }, [levelId]);

  if (!data) return <div>Loading...</div>;

  const { level, topics, practisedTopics } = data;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/">← Back to Map</Link>
      <h1>Level {level.number}: {level.title}</h1>
      <p>{level.description}</p>
      
      <div style={{ margin: '2rem 0' }}>
        <h3>Topics</h3>
        {topics.map(topic => {
          const isPractised = practisedTopics.includes(topic._id);
          return (
            <div key={topic._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{topic.title} {isPractised && '✅'}</h4>
                <span style={{ fontSize: '0.85rem', color: '#666', background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
                  {topic.complexityNotes}
                </span>
              </div>
              
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Link to={`/practice/${topic._id}`} style={{ textDecoration: 'none' }}>
                  <button style={{ padding: '0.5rem 1rem', background: '#2F6BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Practice & Learn
                  </button>
                </Link>
                {topic.leetcodeLinks && topic.leetcodeLinks.map((lc, i) => (
                  <a key={i} href={lc.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <button style={{ padding: '0.5rem 1rem', background: '#FFC93C', color: '#1B2340', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Solve: {lc.title}
                    </button>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', borderTop: '2px dashed #ccc' }}>
        <h2>Ready to prove yourself?</h2>
        <Link to={`/exam/${level._id}`}>
          <button style={{ padding: '1rem 2rem', fontSize: '1.2rem', background: '#17B26A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 0 #10804b' }}>
            Take the Level Exam
          </button>
        </Link>
      </div>
    </div>
  );
}
