import jsPDF from 'jspdf';

export interface ManifestPassenger {
  name: string;
  phone: string;
  pickupAddress: string;
  dropoffAddress: string | null;
  passengers: number;
  notes: string | null;
  hasLargeLuggage: boolean;
  luggageDescription: string | null;
  hasPackageDelivery: boolean;
  packageDescription: string | null;
  specialRequests: string | null;
  paymentStatus: string;
}

export interface ManifestData {
  agentName: string;
  tripDate: string;
  pickupTime: string;
  routeFrom: string;
  routeTo: string;
  routeVia: string | null;
  vehicleNumber: string | null;
  driverName: string | null;
  driverPhone: string | null;
  passengers: ManifestPassenger[];
}

export const generateManifestPdf = (data: ManifestData): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getPaymentLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'LUNAS';
      case 'pending': return 'BELUM BAYAR';
      case 'waiting_verification': return 'VERIFIKASI';
      case 'cancelled': return 'BATAL';
      default: return status.toUpperCase();
    }
  };

  const checkNewPage = (neededHeight: number) => {
    if (y + neededHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('MANIFES PERJALANAN', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(data.agentName, pageWidth / 2, 28, { align: 'center' });

  y = 50;

  // Trip Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 50, 3, 3, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  const col1X = margin + 5;
  const col2X = margin + contentWidth / 2;

  y += 8;
  doc.text('TANGGAL', col1X, y);
  doc.text('JAM JEMPUT', col2X, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  y += 6;
  doc.text(formatDate(data.tripDate), col1X, y);
  doc.text(data.pickupTime, col2X, y);

  y += 10;
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RUTE', col1X, y);
  doc.text('ARMADA', col2X, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  y += 6;
  const route = data.routeVia 
    ? `${data.routeFrom} → ${data.routeVia} → ${data.routeTo}`
    : `${data.routeFrom} → ${data.routeTo}`;
  doc.text(route, col1X, y);
  doc.text(data.vehicleNumber || '-', col2X, y);

  y += 10;
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SOPIR', col1X, y);
  doc.text('HP SOPIR', col2X, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  y += 6;
  doc.text(data.driverName || '-', col1X, y);
  doc.text(data.driverPhone || '-', col2X, y);

  y += 15;

  // Summary
  const totalPassengers = data.passengers.reduce((sum, p) => sum + p.passengers, 0);
  const paidCount = data.passengers.filter(p => p.paymentStatus === 'paid').length;
  const unpaidCount = data.passengers.length - paidCount;

  doc.setFillColor(59, 130, 246);
  doc.roundedRect(margin, y, contentWidth / 3 - 3, 15, 2, 2, 'F');
  doc.setFillColor(34, 197, 94);
  doc.roundedRect(margin + contentWidth / 3, y, contentWidth / 3 - 3, 15, 2, 2, 'F');
  doc.setFillColor(239, 68, 68);
  doc.roundedRect(margin + (contentWidth / 3) * 2, y, contentWidth / 3, 15, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: ${totalPassengers} PAX`, margin + (contentWidth / 3 - 3) / 2, y + 9, { align: 'center' });
  doc.text(`LUNAS: ${paidCount}`, margin + contentWidth / 3 + (contentWidth / 3 - 3) / 2, y + 9, { align: 'center' });
  doc.text(`BELUM: ${unpaidCount}`, margin + (contentWidth / 3) * 2 + (contentWidth / 3) / 2, y + 9, { align: 'center' });

  y += 25;

  // Passengers List
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DATA PENUMPANG', margin, y);
  y += 8;

  data.passengers.forEach((passenger, index) => {
    const boxHeight = 45;
    checkNewPage(boxHeight + 5);

    // Card background
    const isPaid = passenger.paymentStatus === 'paid';
    doc.setFillColor(isPaid ? 240 : 254, isPaid ? 253 : 242, isPaid ? 244 : 242);
    doc.setDrawColor(isPaid ? 187 : 252, isPaid ? 247 : 165, isPaid ? 208 : 165);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

    // Number badge
    const badgeSize = 8;
    doc.setFillColor(59, 130, 246);
    doc.circle(margin + 6, y + 6, badgeSize / 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text((index + 1).toString(), margin + 6, y + 8, { align: 'center' });

    // Name & Phone
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(passenger.name, margin + 14, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`📞 ${passenger.phone}  |  👥 ${passenger.passengers} orang`, margin + 14, y + 13);

    // Payment status badge
    const statusText = getPaymentLabel(passenger.paymentStatus);
    const statusWidth = doc.getTextWidth(statusText) + 8;
    doc.setFillColor(isPaid ? 34 : 239, isPaid ? 197 : 68, isPaid ? 94 : 68);
    doc.roundedRect(margin + contentWidth - statusWidth - 5, y + 3, statusWidth, 8, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(statusText, margin + contentWidth - statusWidth / 2 - 5, y + 8, { align: 'center' });

    // Addresses
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const pickupText = `📍 Jemput: ${passenger.pickupAddress}`;
    const pickupLines = doc.splitTextToSize(pickupText, contentWidth - 20);
    doc.text(pickupLines[0], margin + 5, y + 20);

    if (passenger.dropoffAddress) {
      const dropoffText = `🎯 Antar: ${passenger.dropoffAddress}`;
      const dropoffLines = doc.splitTextToSize(dropoffText, contentWidth - 20);
      doc.text(dropoffLines[0], margin + 5, y + 26);
    }

    // Special notes section
    let notesY = y + 32;
    const notes: string[] = [];
    
    if (passenger.hasLargeLuggage) {
      notes.push(`🧳 Barang besar${passenger.luggageDescription ? `: ${passenger.luggageDescription}` : ''}`);
    }
    if (passenger.hasPackageDelivery) {
      notes.push(`📦 Titipan${passenger.packageDescription ? `: ${passenger.packageDescription}` : ''}`);
    }
    if (passenger.specialRequests) {
      notes.push(`⚠️ ${passenger.specialRequests}`);
    }
    if (passenger.notes) {
      notes.push(`📝 ${passenger.notes}`);
    }

    if (notes.length > 0) {
      doc.setTextColor(234, 88, 12);
      doc.setFontSize(7);
      notes.forEach(note => {
        const noteLines = doc.splitTextToSize(note, contentWidth - 20);
        doc.text(noteLines[0], margin + 5, notesY);
        notesY += 4;
      });
    }

    y += boxHeight + 4;
  });

  // Footer
  checkNewPage(20);
  y += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, margin + contentWidth, y);
  y += 8;

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  // Save
  const dateStr = data.tripDate.replace(/-/g, '');
  const fileName = `Manifes-${data.routeFrom}-${data.routeTo}-${dateStr}.pdf`;
  doc.save(fileName);
};
