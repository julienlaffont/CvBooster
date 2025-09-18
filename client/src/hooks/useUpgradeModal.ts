import { useState } from 'react';

type UpgradeType = 'cv' | 'cover-letter';

export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [upgradeType, setUpgradeType] = useState<UpgradeType>('cv');

  const openModal = (type: UpgradeType) => {
    setUpgradeType(type);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const showUpgradeModal = (type?: UpgradeType) => {
    setUpgradeType(type || 'cv');
    setIsOpen(true);
  };

  return {
    isOpen,
    upgradeType,
    openModal,
    closeModal,
    showUpgradeModal,
  };
}