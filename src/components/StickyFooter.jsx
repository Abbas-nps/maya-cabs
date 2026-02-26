import React from "react";

export default function StickyFooter({ children }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 py-4 px-4 flex justify-center z-40">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
