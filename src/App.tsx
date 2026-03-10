import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import BoardPage from "./pages/BoardPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import {QueryProvider} from "./app/provider/QueryProvider.tsx";

function App() {

  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BoardPage/>} />
          <Route path="/settings" element={<SettingsPage/>} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  )
}

export default App;