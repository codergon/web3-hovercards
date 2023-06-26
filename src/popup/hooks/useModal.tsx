import { useState } from "react";

interface AppModalProps {
  isCentered?: boolean;
  children: React.ReactNode;
}

const useModal = (defaultState = false) => {
  const [isOpen, setIsOpen] = useState(defaultState);

  const closeModal = () => {
    setIsOpen(false);
    document.body.classList.remove("no-scroll");
  };

  const openModal = () => {
    setIsOpen(true);
    document.body.classList.add("no-scroll");
  };

  const AppModal = ({ isCentered, children }: AppModalProps) => {
    if (!isOpen) return null;

    return (
      <>
        <div className="app-modal-overlay" onClick={closeModal}></div>
        <div className="app-modal">{children}</div>
      </>
    );
  };

  return { AppModal, openModal, closeModal };
};

export default useModal;
