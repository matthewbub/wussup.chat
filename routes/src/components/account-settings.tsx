import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mail,
  Lock,
  Download,
  Trash2,
  FileText,
  Palette,
  Shield,
} from "lucide-react";

export function AccountSettingsComponent() {
  const [email, setEmail] = useState("user@example.com");
  const [securityQuestion1, setSecurityQuestion1] = useState("");
  const [securityQuestion2, setSecurityQuestion2] = useState("");
  const [useMarkdown, setUseMarkdown] = useState(true);
  const [colorTheme, setColorTheme] = useState("light");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sectionRefs = {
    profile: useRef<HTMLDivElement>(null),
    security: useRef<HTMLDivElement>(null),
    preferences: useRef<HTMLDivElement>(null),
    dataManagement: useRef<HTMLDivElement>(null),
  };

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement email update logic here
    console.log("Email updated to:", email);
  };

  const handleUpdateSecurityQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement security questions update logic here
    console.log("Security questions updated");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement password reset logic here
    console.log("Password reset initiated");
  };

  const handleBulkExport = () => {
    // Implement bulk export logic here
    console.log("Bulk export initiated");
  };

  const handleDeleteAccount = () => {
    // Implement account deletion logic here
    console.log("Account deletion initiated");
  };

  const scrollToSection = (sectionName: keyof typeof sectionRefs) => {
    sectionRefs[sectionName].current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="container mx-auto p-4 flex gap-8">
      <aside className="w-64 flex-shrink-0">
        <ScrollArea className="h-[calc(100vh-2rem)] border border-stone-200 p-4 dark:border-stone-800">
          <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            <button
              onClick={() => scrollToSection("profile")}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Profile
            </button>
            <button
              onClick={() => scrollToSection("security")}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Security
            </button>
            <button
              onClick={() => scrollToSection("preferences")}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Preferences
            </button>
            <button
              onClick={() => scrollToSection("dataManagement")}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Data Management
            </button>
          </nav>
        </ScrollArea>
      </aside>

      <main className="flex-grow space-y-8">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

        <section ref={sectionRefs.profile}>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your new email"
                  />
                </div>
                <Button type="submit">
                  <Mail className="mr-2 h-4 w-4" /> Update Email
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section ref={sectionRefs.security}>
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                  />
                </div>
                <Button type="submit">
                  <Shield className="mr-2 h-4 w-4" /> Reset Password
                </Button>
              </form>

              <form
                onSubmit={handleUpdateSecurityQuestions}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="question1">Security Question 1</Label>
                  <Input
                    id="question1"
                    value={securityQuestion1}
                    onChange={(e) => setSecurityQuestion1(e.target.value)}
                    placeholder="Enter your first security question"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question2">Security Question 2</Label>
                  <Input
                    id="question2"
                    value={securityQuestion2}
                    onChange={(e) => setSecurityQuestion2(e.target.value)}
                    placeholder="Enter your second security question"
                  />
                </div>
                <Button type="submit">
                  <Lock className="mr-2 h-4 w-4" /> Update Security Questions
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section ref={sectionRefs.preferences}>
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your editing experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="markdown-toggle">Use Markdown</Label>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Toggle between Markdown and WYSIWYG editor
                  </p>
                </div>
                <Switch
                  id="markdown-toggle"
                  checked={useMarkdown}
                  onCheckedChange={setUseMarkdown}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color-theme">Color Theme</Label>
                <Select value={colorTheme} onValueChange={setColorTheme}>
                  <SelectTrigger id="color-theme">
                    <SelectValue placeholder="Select a color theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Palette className="mr-2 h-4 w-4" /> Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </section>

        <section ref={sectionRefs.dataManagement}>
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your account data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button onClick={handleBulkExport}>
                  <Download className="mr-2 h-4 w-4" /> Export All Documents
                </Button>
              </div>
              <div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount}>
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
