"use client";
import {
  FileText,
  PenToolIcon as Tool,
  Brain,
  XCircle,
  Upload,
} from "lucide-react";
import { StaticAnimatedSticker } from "./StaticAnimatedSticker";
import { useDarkReader } from "@/hooks/useDarkReader";
import { cn } from "@/lib/utils";
import Eyebrow from "./Eyebrow";

export default function PrivateSecureFinancialAnalysis() {
  const isDarkReader = useDarkReader();
  return (
    <div className="container mx-auto px-4 md:py-12 max-w-4xl relative">
      {true && (
        <div className="md:absolute md:-top-36 md:right-4 ">
          <StaticAnimatedSticker
            mainText="Limited Time Offer!"
            subText="100 Pages Free"
            additionalInfo={[
              "No credit card required",
              "Sign up instantly",
              "Cancel anytime",
            ]}
          />
        </div>
      )}
      <div>
        <Eyebrow />
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
          Private & Secure{" "}
          <span
            className={cn(
              "bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
              // the gradient is not visible in dark reader mode, this is a workaround
              isDarkReader && "text-white"
            )}
          >
            Financial Analysis
          </span>
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Your privacy comes first. Here's how it works:
        </p>
      </div>

      <ul className="mt-8 space-y-6">
        {[
          { icon: Upload, text: "Upload your financial document (PDF format)" },
          {
            icon: FileText,
            text: "Select specific pages from your financial documents",
          },
          {
            icon: Tool,
            text: "Use our Privacy Tool to redact sensitive information",
          },
          { icon: Brain, text: "AI-powered analysis with no data storage" },
          {
            icon: XCircle,
            text: "Automatic rejection of documents containing sensitive data",
          },
        ].map((item, index) => (
          <li key={index} className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <item.icon className="h-6 w-6 text-blue-500" />
            </div>

            <p className="text-lg text-gray-700">{item.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
