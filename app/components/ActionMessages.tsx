import React from "react";

interface ActionMessagesProps {
  error?: string;
  success?: string;
}

export const ActionMessages: React.FC<ActionMessagesProps> = ({
  error,
  success,
}) => {
  return (
    <>
      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">Success</p>
          <p>{success}</p>
        </div>
      )}
    </>
  );
};
