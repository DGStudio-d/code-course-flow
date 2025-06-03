import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const FloatingWhatsAppButton = () => {
  const whatsappNumber = "+1234567890"; // Replace with your WhatsApp number
  const message = "Hello, I need assistance."; // Default message

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-60 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition"
      aria-label="Contact us on WhatsApp"
    >
      <FaWhatsapp className="w-6 h-6" />
      <span>Whatsapp Contact</span>
    </a>
  );
};

export default FloatingWhatsAppButton;
