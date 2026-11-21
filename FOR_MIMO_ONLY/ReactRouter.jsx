import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

export function MimoRouter() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/mimo">Mimo</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/mimo" element={<h1>Mimo Workspace</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
