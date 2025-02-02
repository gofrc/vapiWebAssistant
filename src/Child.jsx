import { useEffect } from 'react';

function Child({ onVariableInit }) {
  const childVariable = '6476543213'; // Initialize your variable here

  useEffect(() => {
    onVariableInit(childVariable);
  }, [childVariable, onVariableInit]);

  return null;
}

export default Child;
