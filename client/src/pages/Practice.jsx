import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import MemoryVisualizer from '../components/MemoryVisualizer';
import TutorChat from '../components/TutorChat';

export default function Practice() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [memState, setMemState] = useState(null);

  useEffect(() => {
    axios.get(`/api/topics/${topicId}`).then(res => setTopic(res.data)).catch(console.error);
  }, [topicId]);

  if (!topic) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to={`/level/${topic.levelId}`}>← Back to Level</Link>
      <h1>Practice: {topic.title}</h1>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ flex: 1, background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3>Learn</h3>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{topic.learnContent}</div>
        </div>
        
        <div style={{ flex: 2 }}>
          <div style={{ marginBottom: '1rem', padding: '1rem', background: '#e0e7ff', borderRadius: '8px', color: '#1B2340', fontWeight: 'bold' }}>
            Mission: {topic.missionText}
          </div>
          <MemoryVisualizer 
            startArray={topic.startArray} 
            mode="practice" 
            onStateChange={(s) => setMemState(s)} 
          />
        </div>
      </div>

      <TutorChat 
        topicId={topic._id} 
        contextData={{
          topicTitle: topic.title,
          mission: topic.missionText,
          currentArray: memState?.array || topic.startArray,
          operations: memState?.operations || [],
          steps: memState?.totalSteps || 0
        }}
        isExam={false}
      />
    </div>
  );
}
