import React from "react";
import { GlobalFooter } from "./components/GlobalFooter";
import { GlobalHeader } from "./components/GlobalHeader";
import { create } from "zustand";
import { useFieldArray, useForm } from "react-hook-form";

enum Steps {
  AUTO_UPLOAD = "AUTO_UPLOAD",
  MANUAL_UPLOAD = "MANUAL_UPLOAD",
  AUTO_EDIT = "AUTO_EDIT",
  CONFIRM_UPLOAD = "CONFIRM_UPLOAD",
}

interface ReceiptItem {
  name: string;
  price: string;
}

interface Receipt {
  merchant: string;
  date: string;
  total: string;
  items: ReceiptItem[];
}

interface ReceiptData {
  receipt: Receipt;
  image: string;
}

interface ManualFormData {
  merchant: string;
  date: string;
  total: string;
  items: { name: string; price: string }[];
  image?: string;
}

export const useStore = create<{
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
  currentStep: Steps;
  setCurrentStep: (step: Steps) => void;
  receiptData: ReceiptData | null;
  setReceiptData: (data: ReceiptData) => void;
}>((set) => ({
  isLoading: false,
  setIsLoading: (value: boolean) => set({ isLoading: value }),
  errorMessage: null,
  setErrorMessage: (message: string | null) => set({ errorMessage: message }),
  currentStep: Steps.AUTO_UPLOAD,
  setCurrentStep: (step: Steps) => set({ currentStep: step }),
  receiptData: null,
  setReceiptData: (data: ReceiptData) => set({ receiptData: data }),
}));

function App() {
  const currentStep = useStore((state) => state.currentStep);
  const setCurrentStep = useStore((state) => state.setCurrentStep);
  const setErrorMessage = useStore((state) => state.setErrorMessage);
  return (
    <>
      <GlobalHeader />
      <main>
        <div>
          {currentStep === Steps.AUTO_UPLOAD && <AutoUploadForm />}
          {currentStep === Steps.AUTO_EDIT && <ManualUploadForm />}
          {currentStep === Steps.MANUAL_UPLOAD && <ManualUploadForm />}
          {currentStep === Steps.CONFIRM_UPLOAD && <ConfirmUploadForm />}

          <AutoOrManualToggleButton />
        </div>
      </main>
      <GlobalFooter />
    </>
  );
}

function AutoOrManualToggleButton() {
  const currentStep = useStore((state) => state.currentStep);
  const setCurrentStep = useStore((state) => state.setCurrentStep);
  const setErrorMessage = useStore((state) => state.setErrorMessage);

  // Only show the button if the current step is either AUTO_UPLOAD or MANUAL_UPLOAD
  if (
    currentStep !== Steps.AUTO_UPLOAD &&
    currentStep !== Steps.MANUAL_UPLOAD
  ) {
    return null;
  }

  return (
    <div className="zc-or-manual-upload-container">
      <button
        type="button"
        className="secondary-button zc-manual-upload-button"
        id="manual-upload-button"
        onClick={() => {
          if (currentStep === Steps.AUTO_UPLOAD) {
            setCurrentStep(Steps.MANUAL_UPLOAD);
            setErrorMessage(null);
          } else if (currentStep === Steps.MANUAL_UPLOAD) {
            setCurrentStep(Steps.AUTO_UPLOAD);
            setErrorMessage(null);
          }
        }}
      >
        {currentStep === Steps.AUTO_UPLOAD && "Manual Upload"}
        {currentStep === Steps.MANUAL_UPLOAD && "Image Upload"}
      </button>
    </div>
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
  const setReceiptData = useStore((state) => state.setReceiptData);
  const setCurrentStep = useStore((state) => state.setCurrentStep);

  const onSubmit = async (data: { image: FileList }) => {
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("image", data.image[0]);

    try {
      const response = await fetch("/api/v1/finances/receipts/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Handle error response from the server
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const result = await response.json();
      const transformedResult: ReceiptData = {
        receipt: result.Receipt,
        image: result.image,
      };

      setReceiptData(transformedResult);
      setCurrentStep(Steps.AUTO_EDIT);
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

function ManualUploadForm() {
  const receiptData = useStore((state) => state.receiptData);
  const setReceiptData = useStore((state) => state.setReceiptData);
  const setCurrentStep = useStore((state) => state.setCurrentStep);

  const defaultValues = receiptData
    ? {
        merchant: receiptData.receipt.merchant,
        date: receiptData.receipt.date,
        total: receiptData.receipt.total,
        items: receiptData.receipt.items,
        image: receiptData.image,
      }
    : {
        merchant: "",
        date: "",
        total: "",
        items: [],
        image: "",
      };

  const { register, control, handleSubmit, watch } = useForm<ManualFormData>({
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = (data: ManualFormData) => {
    // Update the receipt data in the store
    setReceiptData({
      receipt: {
        merchant: data.merchant,
        date: data.date,
        total: data.total,
        items: data.items,
      },
      image: data.image || "",
    });

    // do nada; proceed to the confirmation step
    setCurrentStep(Steps.CONFIRM_UPLOAD);
  };

  // Handle image modal logic
  const [isModalOpen, setModalOpen] = React.useState(false);
  const openReceiptModal = () => setModalOpen(true);
  const closeReceiptModal = () => setModalOpen(false);

  const imageSrc = watch("image");

  return (
    <div id="results" className="receipt-modify-container">
      <div>
        <h2>Receipt</h2>
        <p>Add or modify the details of your receipt here</p>
      </div>
      {imageSrc && (
        <div id="zc-hj-receipt-img" onClick={openReceiptModal}>
          <img
            className="receipt-image"
            src={`data:image/png;base64,${imageSrc}`}
            alt="Receipt"
          />
          {isModalOpen && (
            <div
              id="receiptImageModal"
              className="receipt-modal"
              onClick={closeReceiptModal}
            >
              <span className="receipt-modal-close">&times;</span>
              <img
                className="receipt-modal-content"
                id="receiptFullImage"
                src={`data:image/png;base64,${imageSrc}`}
                alt="Receipt Full"
              />
            </div>
          )}
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        id="zc-receipt-manual-upload-form"
      >
        {/* Hidden image field */}
        <input type="hidden" {...register("image")} />

        <div className="receipt-field">
          <label htmlFor="merchant">Merchant</label>
          <input
            required
            id="zc-c-merchant"
            type="text"
            placeholder="Bob's Burgers"
            {...register("merchant", { required: true })}
          />
        </div>
        <div className="receipt-field">
          <label htmlFor="date">Date</label>
          <input
            id="zc-c-date"
            type="text"
            placeholder="MM/DD/YYYY"
            {...register("date")}
          />
        </div>
        <div className="receipt-field">
          <label htmlFor="total">Total</label>
          <input
            id="zc-c-total"
            type="text"
            placeholder="$100.00"
            {...register("total")}
          />
        </div>

        <div className="receipt-field-items">
          <h3>Items</h3>
          <ul className="receipt-items">
            {fields.map((item, index) => (
              <li
                key={item.id}
                className={`receipt-item receipt-item-${index}`}
              >
                <input
                  type="text"
                  placeholder="Item Name"
                  {...register(`items.${index}.name` as const)}
                  className="receipt-item-name"
                />
                <input
                  type="text"
                  placeholder="Item Price"
                  {...register(`items.${index}.price` as const)}
                  className="receipt-item-price"
                />
                <button
                  type="button"
                  className="remove-item"
                  onClick={() => remove(index)}
                >
                  X
                </button>
              </li>
            ))}
          </ul>
          {fields.length === 0 && (
            <div className="no-items-message">
              No items here. Please add items manually or click "Next" to
              proceed.
            </div>
          )}
        </div>
        <div className="button-container">
          <button
            type="button"
            className="add-item secondary-button"
            onClick={() => append({ name: "", price: "" })}
          >
            Add Item
          </button>
          <button type="submit" className="primary-button" id="next">
            Next
          </button>
        </div>
      </form>
    </div>
  );
}

function ConfirmUploadForm() {
  const [isModalOpen, setModalOpen] = React.useState(false);
  const receiptData = useStore((state) => state.receiptData);
  const setCurrentStep = useStore((state) => state.setCurrentStep);
  const isLoading = useStore((state) => state.isLoading);
  const setIsLoading = useStore((state) => state.setIsLoading);
  const setErrorMessage = useStore((state) => state.setErrorMessage);
  const setReceiptData = useStore((state) => state.setReceiptData);

  if (!receiptData) {
    return null; // Optionally, you could redirect to the first step
  }

  const handleBack = () => {
    // Navigate back to the manual edit step
    // technically, we could go back to the manual upload step
    // they are essentially the same thing
    // just different names for clarity in end-user workflows
    setCurrentStep(Steps.AUTO_EDIT);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/v1/finances/receipts/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(receiptData),
      });

      if (!response.ok) {
        // Handle error response from the server
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save receipt");
      }

      // Handle success (e.g., redirect to another page, show success message)
      console.log("Receipt saved successfully");
      // Reset the state or navigate as needed
      setCurrentStep(Steps.AUTO_UPLOAD);
      setReceiptData({
        receipt: {
          merchant: "",
          date: "",
          total: "",
          items: [],
        },
        image: "",
      });
    } catch (error) {
      console.error("Error saving receipt:", error);
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Image modal handlers
  const openReceiptModal = () => setModalOpen(true);
  const closeReceiptModal = () => setModalOpen(false);

  return (
    <div id="receipt-confirmation" className="receipt-confirmation-container">
      <div className="receipt-confirmation-header">
        <h2>Receipt</h2>
        <p>Please confirm the receipt details below.</p>
      </div>

      {receiptData.image && (
        <div id="zc-confirm-receipt-img">
          <img
            className="receipt-image"
            src={`data:image/png;base64,${receiptData.image}`}
            alt="Receipt Image"
            onClick={openReceiptModal}
          />
          {isModalOpen && (
            <div
              id="receiptImageModal"
              className="receipt-modal"
              onClick={closeReceiptModal}
            >
              <span className="receipt-modal-close">&times;</span>
              <img
                className="receipt-modal-content"
                id="receiptFullImage"
                src={`data:image/png;base64,${receiptData.image}`}
                alt="Receipt Full"
              />
            </div>
          )}
        </div>
      )}

      <h3>Merchant</h3>
      <table>
        <thead>
          <tr>
            <th>Merchant</th>
            <th>Date</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td id="merchant">{receiptData.receipt.merchant}</td>
            <td id="date">{receiptData.receipt.date}</td>
            <td id="total">{receiptData.receipt.total}</td>
          </tr>
        </tbody>
      </table>

      <h3>Items</h3>
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {receiptData.receipt.items.map((item, index) => (
            <tr key={index} className="item">
              <td id="name">{item.name}</td>
              <td id="price">{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="button-container">
        <button className="secondary-button" onClick={handleBack}>
          Back
        </button>
        <button
          className="primary-button"
          id="save-button"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>

      {isLoading && (
        <div>Processing your request. This may take a few moments...</div>
      )}
    </div>
  );
}

export default App;
