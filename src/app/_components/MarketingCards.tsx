import {
  ArrowsRightLeftIcon,
  CircleStackIcon,
  CreditCardIcon,
  DocumentTextIcon,
  KeyIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "A/B Model Testing",
    description: "Find the best model for your use-case by testing multiple AI models at once.",
    // href: "#",
    icon: ArrowsRightLeftIcon,
  },
  {
    name: "You Choose the Model",
    description: "Choose from a range of the latest and greatest AI models to find the best fit for your use-case.",
    // href: "#",
    icon: CircleStackIcon,
  },
  {
    name: "BYO API Keys (Coming Soon)",
    description: "Use your own API keys to power your AI models and we'll keep them safe via End-to-End Encryption.",
    // href: "#",
    icon: KeyIcon,
  },
  {
    name: "Customizable (Coming Soon)",
    description: "Customize your AI assistant and user interface to your liking.",
    // href: "#",
    icon: PencilIcon,
  },
  {
    name: "Chat with PDFs and Images",
    description: "Chat with PDFs and images using the latest and greatest AI models.",
    // href: "#",
    icon: DocumentTextIcon,
  },
  {
    name: "Free Forever Plan",
    description: "We're a bootstrapped startup and we're committed to providing a free forever plan.",
    // href: "#",
    icon: CreditCardIcon,
  },
] as const;

export default function MarketingCards() {
  return (
    <div className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            AI Chatbot Features
          </h2>
          <p className="mt-6 text-lg/8 text-gray-300">
            We're building a chatbot that is easy to use, easy to deploy, and easy to customize.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base/7 font-semibold text-white">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-teal-600">
                    <feature.icon aria-hidden="true" className="size-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base/7 text-gray-400">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
