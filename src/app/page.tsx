import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/HeadersAreCool";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-900">
            ✨ Powered by GPT-4.1 & Advanced AI
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Chat with AI that
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}actually gets it
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Have natural conversations, get instant answers, and upload images for analysis. 
            No complicated setup, no technical jargon—just smart AI that works.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Chatting Free
              </Button>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">5 free messages daily • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need in one simple chat
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            No learning curve, no complicated interfaces. Just type and get the help you need.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Natural Conversations</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Ask questions like you would a friend. Get detailed answers, explanations, and help with any topic.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📸</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Upload & Analyze Images</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Share photos, documents, or screenshots. Get instant analysis, explanations, or help with what you see.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Instant Responses</h3>
            <p className="text-gray-600 dark:text-gray-300">
              No waiting around. Get fast, accurate responses powered by the latest AI technology.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Perfect for everyday questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              From simple curiosities to complex problems, Wussup Chat has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Learning & Education</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Explain concepts, help with homework, or learn something new</p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Work & Productivity</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Draft emails, brainstorm ideas, or solve work challenges</p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Creative Projects</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Get writing help, design ideas, or creative inspiration</p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Daily Life</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Recipe suggestions, travel planning, or general advice</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border-2 border-gray-200 dark:border-gray-600">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">$0</div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Perfect for trying out Wussup Chat</p>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="dark:text-gray-300">5 messages per day</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="dark:text-gray-300">Image uploads & analysis</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="dark:text-gray-300">Chat history</span>
                </li>
              </ul>
              
              <Link href="/sign-up">
                <Button variant="outline" className="w-full">Get Started Free</Button>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-lg border-2 border-blue-200 dark:border-blue-700 relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
              Most Popular
            </Badge>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">$9<span className="text-lg">/month</span></div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">For power users who chat frequently</p>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="dark:text-gray-300">500 messages per day</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="dark:text-gray-300">Priority support</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="dark:text-gray-300">Advanced AI models</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="dark:text-gray-300">Everything in Free</span>
                </li>
              </ul>
              
              <Link href="/pricing">
                <Button className="w-full">Upgrade to Pro</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start chatting?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already getting smarter answers with Wussup Chat.
          </p>
          
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Get Started Free Today
            </Button>
          </Link>
          
          <p className="text-blue-100 dark:text-blue-200 mt-4 text-sm">No credit card required • 5 free messages daily</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl font-bold mb-4">Wussup Chat</div>
              <p className="text-gray-400 text-sm">
                Smart AI conversations made simple for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/sign-up" className="hover:text-white">Sign Up</Link></li>
                <li><Link href="/sign-in" className="hover:text-white">Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/settings" className="hover:text-white">Settings</Link></li>
                <li><Link href="/account" className="hover:text-white">Account</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 Wussup Chat. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
