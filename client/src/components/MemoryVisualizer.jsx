import { useState } from 'react';
import { memoryOps } from '../utils/memoryOps';
import '../styles/Memory.css';

export default function MemoryVisualizer({ startArray, onComplete, onStateChange, mode = 'practice' }) {
  const [array, setArray] = useState([...startArray]);
  const [operations, setOperations] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null); // 'insert', 'update', 'delete', 'access'
  const [inputValue, setInputValue] = useState('');
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorText, setErrorText] = useState('');

  const handleCellClick = (index) => {
    if (!selectedTool) {
      setErrorText('Select a tool first!');
      return;
    }
    
    let op = { type: selectedTool, index };
    
    if (selectedTool === 'insert' || selectedTool === 'update') {
      const val = parseInt(inputValue, 10);
      if (isNaN(val)) {
        setErrorText('Enter a valid number value for this operation.');
        return;
      }
      op.value = val;
    }

    try {
      const newOps = [...operations, op];
      const result = memoryOps.applyOperations(startArray, newOps);
      setArray(result.finalArray);
      setOperations(newOps);
      setTotalSteps(result.totalSteps);
      setErrorText('');
      if (typeof onStateChange === 'function') {
        onStateChange({ array: result.finalArray, operations: newOps, totalSteps: result.totalSteps });
      }
    } catch (err) {
      setErrorText(err.message);
    }
  };

  const handleInsertEnd = () => {
    handleCellClick(array.length);
  };

  const reset = () => {
    setArray([...startArray]);
    setOperations([]);
    setTotalSteps(0);
    setErrorText('');
  };

  const checkAnswer = () => {
    if (onComplete) {
      onComplete(operations);
    }
  };

  return (
    <div className="memory-visualizer">
      <div className="memory-board">
        <div className="stats">
          <span>Steps: {totalSteps}</span>
          <span style={{ color: '#FF5D5D', marginLeft: '1rem' }}>{errorText}</span>
        </div>
        <div className="array-cells">
          {array.map((val, idx) => (
            <div key={idx} className="cell-container">
              <span className="address">0x{100 + idx * 4}</span>
              <div 
                className={`cell keycap-btn ${selectedTool ? 'selectable' : ''}`}
                onClick={() => handleCellClick(idx)}
              >
                {val}
              </div>
            </div>
          ))}
          {array.length < 8 && (
            <div className="cell-container empty-slot" onClick={handleInsertEnd}>
              <span className="address">0x{100 + array.length * 4}</span>
              <div className="cell dashed">+</div>
            </div>
          )}
        </div>
        <div className="log">
          <h4>Operation Log</h4>
          <ul>
            {operations.map((op, i) => (
              <li key={i}>{op.type} at index {op.index} {op.value !== undefined ? `with value ${op.value}` : ''}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="tools-panel">
        <h3>Tools</h3>
        <div className="tools">
          {['insert', 'update', 'delete', 'access'].map(tool => (
            <button 
              key={tool} 
              className={`tool-btn ${selectedTool === tool ? 'selected' : ''}`}
              onClick={() => setSelectedTool(tool)}
            >
              {tool.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="input-group">
          <label>Value:</label>
          <input 
            type="number" 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            placeholder="e.g. 42"
          />
        </div>
        <div className="actions">
          <button onClick={reset} className="secondary-btn">Reset</button>
          {mode === 'exam' && (
            <button onClick={checkAnswer} className="primary-btn">Check Answer</button>
          )}
        </div>
      </div>
    </div>
  );
}
