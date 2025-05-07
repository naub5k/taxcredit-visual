import React from 'react';
import { useNavigate } from 'react-router-dom';

const PartnerModal = ({ isOpen, onClose, sido, gugun }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
    navigate(`/region-detail?sido=${encodeURIComponent(sido)}&gugun=${encodeURIComponent(gugun)}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          <img 
            src="/partner-character.png" 
            alt="파트너 캐릭터" 
            className="w-32 h-32 object-contain"
          />
        </div>
        <h2 className="text-xl font-bold mb-4">파트너 전용입니다</h2>
        <p className="mb-6">확인을 누르시면 상세 데이터를 확인할 수 있습니다.</p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button 
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerModal; 