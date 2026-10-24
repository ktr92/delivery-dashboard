import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode; // ReactNode — это аналог slots во Vue (любой HTML/компоненты внутри)
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  // Если модалка закрыта — ничего не рендерим (аналог v-if)
  if (!isOpen) return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  // createPortal принимает: 1. Что рендерить (JSX), 2. Куда рендерить (DOM-нода)
  return createPortal(
    <div style={backdropStyle} onClick={onClose}>
      {/* stopPropagation, чтобы клик внутри модалки не закрывал её */}
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>
          &times;
        </button>
        {children}{" "}
        {/* Рендерим контент, который передали внутрь модалки (слот) */}
      </div>
    </div>,
    modalRoot,
  );

}


  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "8px",
    position: "relative",
    minWidth: "300px",
    color: "#000",
  };

  const closeButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "8px",
    right: "12px",
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  };