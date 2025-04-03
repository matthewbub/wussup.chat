import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StaticSidebar } from "@/components/sidebar";

const faq = [
  {
    question: "What counts as 1 message?",
    answer:
      "We treat 1 message as you're input plus the AI's output. We also don't count messages that fail or that get stopped.",
  },
  {
    question: "How many messages do i get in the pro plan?",
    answer: "1,500 messages on the Pro plan.",
  },
  {
    question: "Can I bring my own API keys?",
    answer:
      "You can use your own API keys for unlimited messages, and test experimental functionality while on the Pro plan.",
  },
  {
    question: "Are my API keys secure?",
    answer: "Yes we use end to end encryption to securely manage your sensitive data.",
  },
];
export default function Page() {
  return (
    <div className="flex h-full">
      {/* App navigation */}
      <div className="hidden md:block w-72 sticky top-0">
        <div className="inset-0 border-r border-border">
          <StaticSidebar />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-page-heading text-white">Support Center</h1>
            <Button size="lg">
              <Mail className="mr-2 h-5 w-5" />
              Contact Support
            </Button>
          </div>

          <div className="mb-8">
            <h2 className="text-section-heading text-white mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faq.map((item, index) => (
                <AccordionItem
                  key={`item-${index + 1}`}
                  value={`item-${index + 1}`}
                  className="bg-gray-900 rounded-lg border border-gray-800"
                >
                  <AccordionTrigger className="px-4 py-4 text-white hover:no-underline text-body font-bold">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-gray-300 text-body">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-section-heading text-white mb-4">Still need help?</h2>
            <p className="text-gray-300 mb-4 text-body">
              Our support team is available 24/7 to assist you with any questions or issues you may have.
            </p>
            <div className="flex gap-4">
              <Button size="lg">
                <Mail className="mr-2 h-5 w-5" />
                Contact Support
              </Button>
              <Button variant="outline" size="lg">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
