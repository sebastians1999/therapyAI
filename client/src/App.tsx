import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import JournalNew from "./pages/JournalNew";
import JournalEntry from "./pages/JournalEntry";
import Goals from "./pages/Goals";
import GoalNew from "./pages/GoalNew";
import GoalDetail from "./pages/GoalDetail";
import Analysis from "./pages/Analysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/signin" element={<Signin />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/journal" element={<PrivateRoute><Journal /></PrivateRoute>} />
              <Route path="/journal/new" element={<PrivateRoute><JournalNew /></PrivateRoute>} />
              <Route path="/journal/:id" element={<PrivateRoute><JournalEntry /></PrivateRoute>} />
              <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
              <Route path="/goals/new" element={<PrivateRoute><GoalNew /></PrivateRoute>} />
              <Route path="/goals/:id" element={<PrivateRoute><GoalDetail /></PrivateRoute>} />
              <Route path="/analysis" element={<PrivateRoute><Analysis /></PrivateRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
