import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { DirectoriesPage } from '@/pages/Directories/DirectoriesPage';
import { DocumentationPage } from '@/pages/Documentation/DocumentationPage';
import { KnowledgeExplorerPage } from '@/pages/KnowledgeExplorer/KnowledgeExplorerPage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="explorer" element={<KnowledgeExplorerPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/directories" element={<DirectoriesPage />} />
        <Route path="documentation" element={<DocumentationPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
