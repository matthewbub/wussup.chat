import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitSupportForm } from "../actions/support";

export default function SupportForm() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-border">
        <form action={submitSupportForm}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Get Support</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              We&apos;ll get back to you within 48 hours of your submission.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                required
                name="email"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger id="category" className="bg-background">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                name="subject"
                id="subject"
                placeholder="Brief description of your issue"
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                name="message"
                id="message"
                placeholder="Please provide details about your issue..."
                required
                className="min-h-[150px] bg-background"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Send Message
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
