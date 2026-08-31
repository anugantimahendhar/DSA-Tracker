import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProblemExplorer } from '../features/problems/ProblemExplorer';
import { ProblemWorkspace } from '../features/problems/ProblemWorkspace';
import { UserDashboard } from '../features/dashboard/UserDashboard';
import { RevisionQueue } from '../features/revision/RevisionQueue';
import { UserAnalytics } from '../features/analytics/UserAnalytics';
import { BookmarkedProblems } from '../features/bookmarks/BookmarkedProblems';
import { AdminDashboard } from '../features/admin/AdminDashboard';
import { Leaderboard } from '../features/leaderboard/Leaderboard';
import { Profile } from '../features/profile/Profile';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { AdminRoute } from '../features/auth/AdminRoute';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/problems" replace />} />
      <Route path="/problems" element={<ProblemExplorer />} />
      <Route path="/problems/:id" element={<ProblemWorkspace />} />

      {/* Authenticated User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/revision"
        element={
          <ProtectedRoute>
            <RevisionQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <UserAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <BookmarkedProblems />
          </ProtectedRoute>
        }
      />


      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Admin Route */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/problems" replace />} />
    </Routes>
  );
};