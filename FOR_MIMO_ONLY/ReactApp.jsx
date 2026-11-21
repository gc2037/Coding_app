import React from 'react';

export function MimoApp() {
  const [count, setCount] = React.useState(0);

  return (
    <main>
      <h1>Mimo React App</h1>
      <button onClick={() => setCount((value) => value + 1)}>
        Count: {count}
      </button>
    </main>
  );
}
