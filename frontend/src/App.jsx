import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SpeechApp from "./pages/SpeechInput";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip } from 'react-tooltip';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/app" element={<SpeechApp />} />
          </Routes>
        </BrowserRouter>
      <Tooltip id="tooltip" />
      <ToastContainer />
    </QueryClientProvider>
  );
};

export default App;
