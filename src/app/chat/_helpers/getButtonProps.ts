// returns button props based on the current status of the chat
export const getButtonProps = (
  status: string,
  buttonOptions: {
    stop: {
      type: "button";
      variant: "destructive";
      onClick: () => void;
      className: string;
      disabled: boolean;
    };
    error: {
      type: "button";
      variant: "outline";
      onClick: () => void;
      disabled: boolean;
    };
    send: {
      type: "submit";
      className: string;
    };
  }
) => {
  switch (status) {
    case "submitted":
    case "streaming":
      return buttonOptions.stop;
    case "error":
      return buttonOptions.error;
    case "ready":
    default:
      return buttonOptions.send;
  }
};

// returns the appropriate button text based on the current status
export const getButtonChildren = (status: string) => {
  switch (status) {
    case "submitted":
      return "Stop";
    case "error":
      return "Retry";
    default:
      return "Send";
  }
};
