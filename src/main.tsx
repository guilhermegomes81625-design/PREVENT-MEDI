import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import Panel from './Panel';
import './style.css';

createRoot(document.getElementById('root')!).render(window.location.pathname.replace(/\/+$/, '') === '/painel' ? <Panel /> : <App />);
