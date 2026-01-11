import { MessageCircle } from 'lucide-react';

const WhatsAppFloat = () => {
  // WhatsApp Business number - can be updated to actual number
  const phoneNumber = '6281234567890';
  const message = 'Halo, saya ingin bertanya tentang layanan Travel Minibus';
  
  const handleClick = () => {
    // Validate phone number format before constructing URL
    const sanitizedPhone = phoneNumber.replace(/\D/g, '');
    if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
      console.warn('Invalid phone number format');
      return;
    }
    const sanitizedMessage = message.slice(0, 500); // Limit message length
    const url = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(sanitizedMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
      aria-label="Chat via WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white fill-white" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-card text-foreground text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
        Chat WhatsApp
      </span>
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
    </button>
  );
};

export default WhatsAppFloat;
