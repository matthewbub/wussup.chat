export const Label = ({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) => {
  return (
    <label htmlFor={name} className="ch-label">
      {children}
    </label>
  );
};

export const ErrorText = ({ children }: { children: React.ReactNode }) => {
  return <p className="mt-1 text-sm text-red-500">{children}</p>;
};
