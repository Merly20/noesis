import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MemoryVisualizer from '../components/MemoryVisualizer';
import TutorChat from '../components/TutorChat';

export default function Exam() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [memState, setMemState] = useState(null);

  useEffect(() => {
    axios.get(`/api/exams/${levelId}`).then(res => setTasks(res.data)).catch(console.error);
  }, [levelId]);

  if (tasks.length === 0) return <div>Loading exam...</div>;

  const currentTask = tasks[currentTaskIndex];

  const handleComplete = async (operations) => {
    try {
      const res = await axios.post(`/api/exams/${levelId}/submit`, {
        taskId: currentTask._id,
        operations
      });
      
      if (res.data.success) {
        setResult(`Success! You earned ${res.data.stars} stars using ${res.data.totalSteps} steps.`);
        if (currentTaskIndex < tasks.length - 1) {
          setTimeout(() => {
            setResult(null);
            setMemState(null);
            setCurrentTaskIndex(prev => prev + 1);
          }, 2000);
        } else {
          setTimeout(() => {
            alert(res.data.levelUnlocked ? 'Level Complete! Next level unlocked!' : 'Level Complete!');
            navigate('/');
          }, 2000);
        }
      } else {
        setResult(`Failed: ${res.data.message}`);
      }
    } catch (err) {
      setResult('Error submitting task');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to={`/level/${levelId}`}>← Back to Level</Link>
      <h1>Exam: Task {currentTaskIndex + 1} / {tasks.length}</h1>
      
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#e0e7ff', borderRadius: '8px' }}>
        <h3>Goal: Transform the array into [{currentTask.goalArray.join(', ')}]</h3>
        <p>Maximum allowed steps: {currentTask.maxSteps}</p>
        <p>Available points: {currentTask.points}</p>
      </div>

      {result && (
        <div style={{ margin: '1rem 0', padding: '1rem', background: result.startsWith('Success') ? '#d1fae5' : '#fee2e2', color: result.startsWith('Success') ? '#065f46' : '#991b1b', borderRadius: '8px', fontWeight: 'bold' }}>
          {result}
        </div>
      )}

      <MemoryVisualizer 
        key={currentTask._id} 
        startArray={currentTask.startArray} 
        onComplete={handleComplete} 
        onStateChange={(s) => setMemState(s)}
        mode="exam" 
      />

      <TutorChat 
        topicId={currentTask._id} // Using taskId as topicId for the scope of chat
        contextData={{
          examGoal: currentTask.goalArray,
          maxStepsAllowed: currentTask.maxSteps,
          currentArray: memState?.array || currentTask.startArray,
          operations: memState?.operations || [],
          stepsTaken: memState?.totalSteps || 0
        }}
        isExam={true}
      />
    </div>
  );
}
