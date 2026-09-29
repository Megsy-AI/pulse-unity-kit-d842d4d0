import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import { NomiProvider, useNomi } from "@/nomi/store";
import { NomiShell } from "@/nomi/components/NomiShell";
import LandingPage from "@/nomi/pages/LandingPage";

const AuthPage = lazy(() => import("@/nomi/pages/AuthPage"));
const OnboardingPage = lazy(() => import("@/nomi/pages/OnboardingPage"));
const ChatPage = lazy(() => import("@/nomi/pages/ChatPage"));
const CallPage = lazy(() => import("@/nomi/pages/CallPage"));
const TasksPage = lazy(() => import("@/nomi/pages/TasksPage"));
const MemoryPage = lazy(() => import("@/nomi/pages/MemoryPage"));
const CharacterPage = lazy(() => import("@/nomi/pages/CharacterPage"));
const AbilitiesPage = lazy(() => import("@/nomi/pages/AbilitiesPage"));
const PrivacyPage = lazy(() => import("@/nomi/pages/PrivacyPage"));
const ProjectsPage = lazy(() => import("@/nomi/pages/ProjectsPage"));
const SettingsPage = lazy(() => import("@/nomi/pages/SettingsPage"));
const AccountsPage = lazy(() => import("@/nomi/pages/AccountsPage"));

function Guarded({ children }: { children: React.ReactNode }) {
  const { ready, companion } = useNomi();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !companion.onboarded) navigate("/onboarding", { replace: true, state: { from: pathname } });
  }, [ready, companion.onboarded, navigate, pathname]);
  if (!ready || !companion.onboarded) return null;
  return <NomiShell>{children}</NomiShell>;
}

function HomeRedirect() {
  const navigate = useNavigate();
  useEffect(() => navigate("/", { replace: true }), [navigate]);
  return null;
}

function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/chat"
          element={
            <Guarded>
              <ChatPage />
            </Guarded>
          }
        />
        <Route
          path="/call"
          element={
            <Guarded>
              <CallPage />
            </Guarded>
          }
        />
        <Route
          path="/tasks"
          element={
            <Guarded>
              <TasksPage />
            </Guarded>
          }
        />
        <Route
          path="/memory"
          element={
            <Guarded>
              <MemoryPage />
            </Guarded>
          }
        />
        <Route
          path="/character"
          element={
            <Guarded>
              <CharacterPage />
            </Guarded>
          }
        />
        <Route
          path="/abilities"
          element={
            <Guarded>
              <AbilitiesPage />
            </Guarded>
          }
        />
        <Route
          path="/privacy"
          element={
            <Guarded>
              <PrivacyPage />
            </Guarded>
          }
        />
        <Route
          path="/projects"
          element={
            <Guarded>
              <ProjectsPage />
            </Guarded>
          }
        />
        <Route
          path="/accounts"
          element={<Guarded><AccountsPage /></Guarded>}
        />
        <Route
          path="/settings"
          element={
            <Guarded>
              <SettingsPage />
            </Guarded>
          }
        />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <NomiProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-center" />
      </BrowserRouter>
    </NomiProvider>
  );
}
