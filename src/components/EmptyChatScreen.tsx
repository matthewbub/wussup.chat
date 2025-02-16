export function EmptyChatScreen({
  setNewMessage,
}: {
  setNewMessage: (message: string) => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="max-w-2xl w-full p-8">
        <div className="flex flex-col items-center justify-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 text-center">
            Start a New Conversation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            Don&apos;t know what to ask? Try one of these prompts:
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Write a song about cats",
            "Suggest names for my business",
            "Briefly summarize gulliver's travels",
            "Suggest dinner ideas for 2 people",
          ].map((prompt) => (
            <button
              key={prompt}
              className="px-4 py-2 text-center rounded-full border border-gray-200 dark:border-gray-700
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                           text-gray-700 dark:text-gray-300"
              onClick={() => {
                setNewMessage(prompt);
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
