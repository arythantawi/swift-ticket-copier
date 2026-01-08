import { jsPDF } from 'jspdf';

interface TicketData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  routeFrom: string;
  routeTo: string;
  routeVia?: string | null;
  travelDate: string;
  pickupTime: string;
  pickupAddress: string;
  passengers: number;
  totalPrice: number;
  notes?: string | null;
  paymentStatus?: string;
}

export const generateTicketPdf = (data: TicketData, options?: { returnBlob?: boolean }): jsPDF | void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  
  // Colors
  const gold: [number, number, number] = [180, 142, 38];
  const darkGold: [number, number, number] = [140, 110, 30];
  const black: [number, number, number] = [20, 20, 20];
  const darkGray: [number, number, number] = [60, 60, 60];
  const gray: [number, number, number] = [120, 120, 120];
  const lightGray: [number, number, number] = [240, 240, 240];
  const white: [number, number, number] = [255, 255, 255];
  const green: [number, number, number] = [22, 163, 74];
  const yellow: [number, number, number] = [234, 179, 8];
  const orange: [number, number, number] = [249, 115, 22];
  
  // Get status display info
  const getStatusInfo = (status?: string): { label: string; color: [number, number, number] } => {
    switch (status) {
      case 'paid':
      case 'confirmed':
        return { label: 'LUNAS', color: green };
      case 'waiting_verification':
        return { label: 'VERIFIKASI', color: yellow };
      case 'pending':
        return { label: 'PENDING', color: orange };
      default:
        return { label: 'PENDING', color: orange };
    }
  };
  
  const statusInfo = getStatusInfo(data.paymentStatus);
  
  // Helper functions
  const drawLine = (y: number, color: [number, number, number] = lightGray) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
  };
  
  const drawDashedLine = (y: number) => {
    doc.setDrawColor(...gray);
    doc.setLineWidth(0.3);
    for (let x = margin; x < pageWidth - margin; x += 4) {
      doc.line(x, y, x + 2, y);
    }
  };

  // === HEADER SECTION ===
  // Top accent bar
  doc.setFillColor(...gold);
  doc.rect(0, 0, pageWidth, 8, 'F');
  
  // Company branding area
  let y = 25;
  
  // Company name with elegant styling
  doc.setTextColor(...black);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('TRAVEL EXPRESS', margin, y);
  
  // Tagline
  doc.setTextColor(...gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Perjalanan Nyaman, Harga Terjangkau', margin, y + 7);
  
  // Invoice label on right
  doc.setTextColor(...gold);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin, y, { align: 'right' });
  
  // Document type
  doc.setTextColor(...gray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('E-Ticket & Bukti Pembayaran', pageWidth - margin, y + 7, { align: 'right' });
  
  y = 50;
  drawLine(y, gold);
  
  // === ORDER INFO BAR ===
  y += 12;
  
  // Order ID
  doc.setTextColor(...gray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('NO. ORDER', margin, y);
  doc.text('TANGGAL CETAK', pageWidth / 2, y);
  doc.text('STATUS', pageWidth - margin - 30, y);
  
  y += 6;
  doc.setTextColor(...black);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(data.orderId, margin, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }), pageWidth / 2, y);
  
  // Status badge
  const statusWidth = statusInfo.label.length * 4 + 10;
  doc.setFillColor(...statusInfo.color);
  doc.roundedRect(pageWidth - margin - statusWidth, y - 5, statusWidth, 8, 2, 2, 'F');
  doc.setTextColor(...white);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(statusInfo.label, pageWidth - margin - statusWidth / 2, y, { align: 'center' });
  
  y += 15;
  drawLine(y);
  
  // === CUSTOMER & ROUTE INFO (Two columns) ===
  y += 15;
  const colWidth = (contentWidth - 15) / 2;
  
  // Left column - Customer Info
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y - 5, colWidth, 55, 3, 3, 'F');
  
  doc.setTextColor(...gold);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI PENUMPANG', margin + 10, y + 5);
  
  doc.setTextColor(...black);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(data.customerName, margin + 10, y + 18);
  
  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(data.customerPhone, margin + 10, y + 27);
  
  if (data.customerEmail) {
    doc.text(data.customerEmail, margin + 10, y + 35);
  }
  
  doc.setTextColor(...gray);
  doc.setFontSize(8);
  doc.text(`${data.passengers} Penumpang`, margin + 10, y + 45);
  
  // Right column - Route Info
  const rightColX = margin + colWidth + 15;
  doc.setFillColor(...lightGray);
  doc.roundedRect(rightColX, y - 5, colWidth, 55, 3, 3, 'F');
  
  doc.setTextColor(...gold);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('RUTE PERJALANAN', rightColX + 10, y + 5);
  
  // From
  doc.setTextColor(...gray);
  doc.setFontSize(8);
  doc.text('DARI', rightColX + 10, y + 16);
  doc.setTextColor(...black);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(data.routeFrom, rightColX + 10, y + 24);
  
  // Via (if exists)
  if (data.routeVia) {
    doc.setTextColor(...gray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('VIA', rightColX + 10, y + 32);
    doc.setTextColor(...darkGray);
    doc.setFontSize(9);
    doc.text(data.routeVia, rightColX + 10, y + 39);
  }
  
  // To
  doc.setTextColor(...gray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('TUJUAN', rightColX + colWidth / 2, y + 16);
  doc.setTextColor(...black);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(data.routeTo, rightColX + colWidth / 2, y + 24);
  
  y += 60;
  
  // === TRAVEL DETAILS ===
  y += 10;
  doc.setTextColor(...gold);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DETAIL KEBERANGKATAN', margin, y);
  
  y += 10;
  
  // Date and Time boxes
  const boxWidth = (contentWidth - 10) / 2;
  
  // Date box
  doc.setFillColor(...white);
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, boxWidth, 28, 3, 3, 'FD');
  
  doc.setTextColor(...gray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('TANGGAL KEBERANGKATAN', margin + 10, y + 10);
  
  const formattedDate = new Date(data.travelDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.setTextColor(...black);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedDate, margin + 10, y + 21);
  
  // Time box
  doc.roundedRect(margin + boxWidth + 10, y, boxWidth, 28, 3, 3, 'FD');
  
  doc.setTextColor(...gray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('JAM PENJEMPUTAN', margin + boxWidth + 20, y + 10);
  
  doc.setTextColor(...black);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.pickupTime, margin + boxWidth + 20, y + 22);
  
  y += 38;
  
  // Pickup Address
  doc.setTextColor(...gray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('ALAMAT PENJEMPUTAN', margin, y);
  
  y += 8;
  doc.setTextColor(...black);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(data.pickupAddress, contentWidth);
  doc.text(addressLines, margin, y);
  y += addressLines.length * 5 + 5;
  
  // Notes
  if (data.notes) {
    y += 5;
    doc.setTextColor(...gray);
    doc.setFontSize(8);
    doc.text('CATATAN', margin, y);
    
    y += 8;
    doc.setTextColor(...darkGray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const notesLines = doc.splitTextToSize(data.notes, contentWidth);
    doc.text(notesLines, margin, y);
    y += notesLines.length * 5;
  }
  
  // === PAYMENT SUMMARY ===
  y += 15;
  drawDashedLine(y);
  y += 15;
  
  doc.setTextColor(...gold);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('RINCIAN PEMBAYARAN', margin, y);
  
  y += 12;
  
  // Price breakdown
  const pricePerPerson = data.totalPrice / data.passengers;
  
  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Harga per penumpang`, margin, y);
  doc.text(formatCurrency(pricePerPerson), pageWidth - margin, y, { align: 'right' });
  
  y += 8;
  doc.text(`Jumlah penumpang`, margin, y);
  doc.text(`× ${data.passengers} orang`, pageWidth - margin, y, { align: 'right' });
  
  y += 12;
  drawLine(y, gray);
  y += 12;
  
  // Total
  doc.setFillColor(...gold);
  doc.roundedRect(margin, y - 5, contentWidth, 25, 3, 3, 'F');
  
  doc.setTextColor(...white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL PEMBAYARAN', margin + 15, y + 8);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(data.totalPrice), pageWidth - margin - 15, y + 10, { align: 'right' });
  
  // === FOOTER ===
  const footerY = pageHeight - 30;
  
  // Divider
  drawLine(footerY - 10, lightGray);
  
  // Terms
  doc.setTextColor(...gray);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  const terms = [
    '• Tiket ini sah sebagai bukti pemesanan dan pembayaran yang telah diverifikasi.',
    '• Harap tunjukkan tiket ini (cetak/digital) kepada driver saat penjemputan.',
    '• Pastikan berada di lokasi penjemputan 10 menit sebelum waktu yang ditentukan.',
    '• Untuk pertanyaan atau perubahan jadwal, hubungi customer service kami.'
  ];
  
  terms.forEach((term, i) => {
    doc.text(term, margin, footerY + (i * 5));
  });
  
  // Bottom bar
  doc.setFillColor(...gold);
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');
  
  // Save or return
  if (options?.returnBlob) {
    return doc;
  }
  doc.save(`Tiket-${data.orderId}.pdf`);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};
