'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { User, Bell, Shield, Palette, Sun, Moon, Monitor, Volume2, Camera, Mic, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success('Settings saved successfully'); }, 800);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Settings</h1><p className="text-muted-foreground mt-1">Manage your account and preferences</p></div>
        <Button className="bg-gradient-primary shadow-glow gap-1" onClick={handleSave} disabled={saving}><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="profile" className="gap-1"><User className="w-3 h-3" /> Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1"><Bell className="w-3 h-3" /> Notifications</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1"><Palette className="w-3 h-3" /> Appearance</TabsTrigger>
          <TabsTrigger value="audio-video" className="gap-1"><Camera className="w-3 h-3" /> Audio & Video</TabsTrigger>
          <TabsTrigger value="security" className="gap-1"><Shield className="w-3 h-3" /> Security</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card className="bg-card/50 border-border/50"><CardHeader><CardTitle className="text-lg">Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold">{user?.displayName?.charAt(0) || 'U'}</div>
                <div><Button variant="outline" size="sm">Change Avatar</Button><p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p></div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Full Name</Label><Input defaultValue={user?.displayName || ''} /></div>
                <div className="space-y-2"><Label>Email</Label><Input defaultValue={user?.email || ''} type="email" /></div>
                <div className="space-y-2"><Label>Role</Label><div className="flex items-center gap-2 pt-2"><Badge className="capitalize">{user?.role?.replace('_', ' ') || 'student'}</Badge></div></div>
                <div className="space-y-2"><Label>Organization</Label><Input defaultValue="ExceliBoard Inc." /></div>
              </div>
              <div className="space-y-2"><Label>Bio</Label><Textarea placeholder="A short bio about yourself..." /></div>
              <Separator />
              <div className="space-y-2"><Label>Language</Label>
                <Select defaultValue="en"><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="en">English</SelectItem><SelectItem value="es">Spanish</SelectItem><SelectItem value="fr">French</SelectItem><SelectItem value="de">German</SelectItem><SelectItem value="ja">Japanese</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Timezone</Label>
                <Select defaultValue="utc-5"><SelectTrigger className="w-64"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="utc-8">(UTC-8) Pacific Time</SelectItem><SelectItem value="utc-5">(UTC-5) Eastern Time</SelectItem><SelectItem value="utc+0">(UTC+0) GMT</SelectItem><SelectItem value="utc+1">(UTC+1) Central European</SelectItem><SelectItem value="utc+5:30">(UTC+5:30) India Standard</SelectItem><SelectItem value="utc+9">(UTC+9) Japan Standard</SelectItem>
                </SelectContent></Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="bg-card/50 border-border/50"><CardHeader><CardTitle className="text-lg">Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: 'Meeting reminders', desc: 'Get notified before scheduled meetings', default: true },
                { label: 'Interview alerts', desc: 'Alerts for upcoming interviews', default: true },
                { label: 'Lecture notifications', desc: 'Reminders for scheduled lectures', default: true },
                { label: 'Board activity', desc: 'Activity updates on your boards', default: false },
                { label: 'Chat messages', desc: 'New message notifications', default: true },
                { label: 'AI insights', desc: 'AI-generated insights and suggestions', default: true },
                { label: 'Email digest', desc: 'Daily email summary of activities', default: false },
                { label: 'Sound alerts', desc: 'Play sound for notifications', default: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between"><div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div><Switch defaultChecked={item.default} /></div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card className="bg-card/50 border-border/50"><CardHeader><CardTitle className="text-lg">Appearance</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3"><Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {([{ value: 'dark' as Theme, label: 'Dark', icon: <Moon className="w-5 h-5" /> }, { value: 'light' as Theme, label: 'Light', icon: <Sun className="w-5 h-5" /> }, { value: 'system' as Theme, label: 'System', icon: <Monitor className="w-5 h-5" /> }]).map((t) => (
                    <button key={t.value} onClick={() => setTheme(t.value)} className={`p-4 rounded-lg border text-center space-y-2 transition-all ${theme === t.value ? 'border-primary bg-primary/10 ring-2 ring-primary/30' : 'border-border/50 hover:border-border hover:bg-muted/30'}`}>
                      <div className="flex justify-center">{t.icon}</div><p className="text-sm font-medium">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Compact mode</p><p className="text-xs text-muted-foreground">Reduce padding and spacing</p></div><Switch /></div>
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Animations</p><p className="text-xs text-muted-foreground">Enable UI animations</p></div><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Sidebar collapsed by default</p><p className="text-xs text-muted-foreground">Start with a collapsed sidebar</p></div><Switch /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio & Video */}
        <TabsContent value="audio-video">
          <Card className="bg-card/50 border-border/50"><CardHeader><CardTitle className="text-lg">Audio & Video Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2"><Label className="flex items-center gap-2"><Camera className="w-4 h-4" /> Camera</Label>
                <Select defaultValue="default"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Default Camera</SelectItem><SelectItem value="external">External Webcam</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label className="flex items-center gap-2"><Mic className="w-4 h-4" /> Microphone</Label>
                <Select defaultValue="default"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Default Microphone</SelectItem><SelectItem value="headset">Headset</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label className="flex items-center gap-2"><Volume2 className="w-4 h-4" /> Speaker</Label>
                <Select defaultValue="default"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Default Speaker</SelectItem><SelectItem value="headset">Headset</SelectItem></SelectContent></Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Noise cancellation</p><p className="text-xs text-muted-foreground">AI-powered background noise removal</p></div><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Mirror camera</p><p className="text-xs text-muted-foreground">Show mirrored self-view</p></div><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">HD video</p><p className="text-xs text-muted-foreground">Stream at 720p or higher</p></div><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Virtual background</p><p className="text-xs text-muted-foreground">Use blur or custom backgrounds</p></div><Switch /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card className="bg-card/50 border-border/50"><CardHeader><CardTitle className="text-lg">Security & Privacy</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2"><Label>Change Password</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3"><Input type="password" placeholder="Current password" /><Input type="password" placeholder="New password" /><Input type="password" placeholder="Confirm new password" /></div>
              </div>
              <Separator />
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Two-factor authentication</p><p className="text-xs text-muted-foreground">Add an extra layer of security</p></div><Button variant="outline" size="sm">Enable</Button></div>
              <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Session timeout</p><p className="text-xs text-muted-foreground">Auto-logout after inactivity</p></div>
                <Select defaultValue="30"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15 minutes</SelectItem><SelectItem value="30">30 minutes</SelectItem><SelectItem value="60">1 hour</SelectItem><SelectItem value="never">Never</SelectItem></SelectContent></Select>
              </div>
              <Separator />
              <div className="space-y-3"><h4 className="text-sm font-medium">Active Sessions</h4>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3"><Monitor className="w-4 h-4 text-green-400" /><div><p className="text-sm font-medium">Windows — Chrome</p><p className="text-xs text-muted-foreground">Current session</p></div></div>
                  <Badge variant="outline" className="text-green-400 border-green-500/30 text-[10px]">Active</Badge>
                </div>
              </div>
              <Separator />
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"><h4 className="text-sm font-medium text-destructive">Danger Zone</h4><p className="text-xs text-muted-foreground mt-1 mb-3">Permanently delete your account and all data</p><Button variant="destructive" size="sm">Delete Account</Button></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
