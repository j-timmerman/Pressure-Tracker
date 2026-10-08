import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../app/AppLayout';
import { PlaceholderPage } from '../shared/components/PlaceholderPage';
import { ForecastPage } from '../features/forecast/pages/ForecastPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { JournalListPage } from '../features/journal/pages/JournalListPage';
import { JournalEntryPage } from '../features/journal/pages/JournalEntryPage';
import { JournalFormPage } from '../features/journal/pages/JournalFormPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { HomePage } from '../features/home/pages/HomePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/journal" element={<JournalListPage />} />
          <Route
            path="/journal/new"
            element={<JournalFormPage mode="create" />}
          />
          <Route path="/journal/:entryId" element={<JournalEntryPage />} />
          <Route
            path="/journal/:entryId/edit"
            element={<JournalFormPage mode="edit" />}
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="*"
            element={
              <PlaceholderPage title="Not Found" description="No such page." />
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}
