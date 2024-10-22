import React from "react";
import { GlobalFooter } from "./components/GlobalFooter";
import { GlobalHeader } from "./components/GlobalHeader";
import { create } from "zustand";
import { useForm } from "react-hook-form";

export const useStore = create<{
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
}>((set) => ({
  isLoading: false,
  setIsLoading: (value: boolean) => set({ isLoading: value }),
  errorMessage: null,
  setErrorMessage: (message: string | null) => set({ errorMessage: message }),
}));

function App() {
  return (
    <>
      <GlobalHeader />
      <main>
        <div>
          <AutoUploadForm />

          <div className="zc-or-manual-upload-container">
            <button
              type="button"
              className="secondary-button zc-manual-upload-button"
              id="manual-upload-button"
            >
              Manual Upload
            </button>
          </div>
        </div>
      </main>
      <GlobalFooter />
    </>
  );
}

function AutoUploadForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ image: FileList }>();

  const isLoading = useStore((state) => state.isLoading);
  const setIsLoading = useStore((state) => state.setIsLoading);
  const errorMessage = useStore((state) => state.errorMessage);
  const setErrorMessage = useStore((state) => state.setErrorMessage);

  const onSubmit = async (data: { image: FileList }) => {
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("image", data.image[0]);

    try {
      const response = await fetch("/api/v1/finances/receipts/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Handle error response from the server
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const result = await response.json();
      // Process the result as needed
      // For now, we'll just log it
      console.log("Upload successful:", result);
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="zc-receipt-upload">
      <form
        className="receipt-upload-container"
        id="imageUploadForm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2>Upload Receipt</h2>
        <label htmlFor="image">
          Drag and drop your receipt image here, or click to select a file
        </label>
        <input
          id="zc-receipt-upload"
          type="file"
          accept="image/*"
          {...register("image", { required: true })}
        />
        {errors.image && <span className="error">This field is required</span>}

        <span className="info-text">
          Supported file types: .png, .jpeg, .jpg, .webp, .gif
        </span>
        <button type="submit" className="primary-button">
          {isLoading ? "Uploading..." : "Upload"}
        </button>
        {isLoading && (
          <div>Processing your request. This may take a few moments...</div>
        )}
        {errorMessage && <div className="error">{errorMessage}</div>}
      </form>
    </div>
  );
}

export default App;
