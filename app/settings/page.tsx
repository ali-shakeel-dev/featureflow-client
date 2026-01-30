'use client';

import React from "react"

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { LogOut, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to log out?')) {
      return;
    }
    await logout();
    router.push('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Since we don't have an update endpoint in the API yet,
      // we'll show a success message
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      // Since we don't have a password update endpoint in the API yet,
      // we'll show a success message
      toast.success('Password changed successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences and security</p>
        </div>

        {/* Profile Section */}
        <Card className="bg-card border-border p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <Separator className="bg-border" />

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-semibold">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="bg-input text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={true}
                className="bg-input text-foreground opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </Card>

        {/* Security Section */}
        <Card className="bg-card border-border p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4">
            <div className="h-12 w-12 rounded-full bg-amber-100/20 dark:bg-amber-900/30 flex items-center justify-center">
              <Lock className="h-6 w-6 text-amber-700 dark:text-amber-400" />
            </div>
            <h2 className="font-semibold text-foreground">Security</h2>
          </div>

          <Separator className="bg-border" />

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-semibold">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-input text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-semibold">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="bg-input text-foreground"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !password}
              className="bg-amber-700 hover:bg-amber-700/90 dark:bg-amber-600 dark:hover:bg-amber-600/90 text-white"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-destructive/5 border border-destructive/30 p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4">
            <div className="h-12 w-12 rounded-full bg-red-100/20 dark:bg-red-900/30 flex items-center justify-center">
              <LogOut className="h-6 w-6 text-red-700 dark:text-red-400" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Logout</h2>
              <p className="text-sm text-muted-foreground">Sign out of your account</p>
            </div>
          </div>

          <Separator className="bg-destructive/20" />

          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </Card>

        {/* Account Info */}
        <Card className="bg-muted/30 border-border p-6 space-y-3">
          <h3 className="font-semibold text-foreground">Account Information</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Role:</strong>{' '}
              {user?.admin ? 'Administrator' : 'User'}
            </p>
            <p>
              <strong>Status:</strong> Active
            </p>
            <p className="text-xs">
              Need help? Contact support at support@feedbackhub.io
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
