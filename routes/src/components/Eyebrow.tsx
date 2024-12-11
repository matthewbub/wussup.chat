import { LockIcon } from "lucide-react";

const Eyebrow: React.FC = () => {
  return (
    <div className="mb-6 inline-block rounded-full bg-blue-100 px-4 py-2 w-full md:w-auto border border-blue-300">
      <div className="flex items-center space-x-2 text-blue-700">
        <LockIcon className="h-5 w-5" />
        <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
          <p className="text-sm font-semibold">
            Your data stays yours, unless you say otherwise
          </p>
          <a
            href="#learn-more"
            className="text-sm font-medium underline hover:text-blue-900"
          >
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
};

export default Eyebrow;
