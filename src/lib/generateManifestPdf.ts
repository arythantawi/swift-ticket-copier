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
  sortOrder?: number; // For custom sorting
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

// Known city/area order from pickup point (closest to farthest from destination)
// This map defines the order of locations for each route direction
const getLocationOrder = (routeFrom: string, routeTo: string): Record<string, number> => {
  // Define location orders based on common routes
  // Lower number = closer to destination (should be delivered last)
  // Higher number = farther from destination (should be picked up first)
  
  const locationOrders: Record<string, Record<string, number>> = {
    // From Banyuwangi direction going to Surabaya
    'Banyuwangi-Surabaya': {
      'banyuwangi': 100,
      'rogojampi': 95,
      'muncar': 90,
      'genteng': 85,
      'jajag': 80,
      'jember': 70,
      'lumajang': 60,
      'probolinggo': 50,
      'pasuruan': 40,
      'sidoarjo': 30,
      'surabaya': 10,
    },
    // From Surabaya direction going to Banyuwangi
    'Surabaya-Banyuwangi': {
      'surabaya': 100,
      'sidoarjo': 95,
      'pasuruan': 85,
      'probolinggo': 75,
      'lumajang': 65,
      'jember': 55,
      'jajag': 45,
      'genteng': 40,
      'muncar': 35,
      'rogojampi': 30,
      'banyuwangi': 10,
    },
    // From Banyuwangi to Denpasar
    'Banyuwangi-Denpasar': {
      'banyuwangi': 100,
      'ketapang': 90,
      'gilimanuk': 80,
      'negara': 70,
      'tabanan': 50,
      'denpasar': 10,
      'kuta': 15,
      'sanur': 12,
      'ubud': 20,
    },
    // From Denpasar to Banyuwangi
    'Denpasar-Banyuwangi': {
      'denpasar': 100,
      'kuta': 98,
      'sanur': 97,
      'ubud': 95,
      'tabanan': 80,
      'negara': 60,
      'gilimanuk': 40,
      'ketapang': 30,
      'banyuwangi': 10,
    },
  };

  const routeKey = `${routeFrom}-${routeTo}`;
  return locationOrders[routeKey] || {};
};

// Extract location keyword from address
const extractLocationKeyword = (address: string): string => {
  const normalizedAddress = address.toLowerCase();
  const keywords = [
    'surabaya', 'sidoarjo', 'pasuruan', 'probolinggo', 'lumajang', 
    'jember', 'jajag', 'genteng', 'muncar', 'rogojampi', 'banyuwangi',
    'denpasar', 'kuta', 'sanur', 'ubud', 'tabanan', 'negara', 'gilimanuk', 'ketapang'
  ];
  
  for (const keyword of keywords) {
    if (normalizedAddress.includes(keyword)) {
      return keyword;
    }
  }
  return '';
};

// Sort passengers by pickup location (farthest from destination first)
const sortPassengersByLocation = (
  passengers: ManifestPassenger[], 
  routeFrom: string, 
  routeTo: string
): ManifestPassenger[] => {
  const locationOrder = getLocationOrder(routeFrom, routeTo);
  
  if (Object.keys(locationOrder).length === 0) {
    // If no specific order defined, return as-is
    return passengers;
  }

  return [...passengers].sort((a, b) => {
    const locA = extractLocationKeyword(a.pickupAddress);
    const locB = extractLocationKeyword(b.pickupAddress);
    
    const orderA = locationOrder[locA] ?? 50; // Default middle priority
    const orderB = locationOrder[locB] ?? 50;
    
    // Sort descending (higher number = picked up first = appears first in manifest)
    return orderB - orderA;
  });
};

export const generateManifestPdf = (data: ManifestData): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Sort passengers by location (farthest from destination first)
  const sortedPassengers = sortPassengersByLocation(data.passengers, data.routeFrom, data.routeTo);

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
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Helper to draw dotted line
  const drawDottedLine = (startX: number, endX: number, yPos: number) => {
    const dotText = '.'.repeat(Math.floor((endX - startX) / 1.2));
    doc.text(dotText, startX, yPos);
  };

  // Helper to draw form field with dots
  const drawFormField = (label: string, value: string, yPos: number, labelWidth: number = 25) => {
    const labelX = margin;
    const colonX = margin + labelWidth;
    const valueX = colonX + 5;
    const lineEnd = margin + contentWidth;

    doc.setFont('helvetica', 'normal');
    doc.text(label, labelX, yPos);
    doc.text(':', colonX, yPos);
    
    if (value) {
      doc.text(value, valueX, yPos);
    }
    
    // Draw dots after value
    const valueWidth = value ? doc.getTextWidth(value) + 2 : 0;
    const dotsStartX = valueX + valueWidth;
    if (dotsStartX < lineEnd - 5) {
      drawDottedLine(dotsStartX, lineEnd, yPos);
    }
  };

  // Header - Simple title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('MANIFES PERJALANAN', pageWidth / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(data.agentName, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Trip Info - simple format
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  const route = data.routeVia 
    ? `${data.routeFrom} - ${data.routeVia} - ${data.routeTo}`
    : `${data.routeFrom} - ${data.routeTo}`;

  doc.text(`Rute: ${route}`, margin, y);
  y += 5;
  doc.text(`Tanggal: ${formatDate(data.tripDate)}`, margin, y);
  y += 5;
  doc.text(`Jam Jemput: ${data.pickupTime}`, margin, y);
  y += 5;
  doc.text(`Armada: ${data.vehicleNumber || '-'}`, margin, y);
  doc.text(`Sopir: ${data.driverName || '-'} (${data.driverPhone || '-'})`, margin + 70, y);
  y += 5;

  // Summary
  const totalPassengers = data.passengers.reduce((sum, p) => sum + p.passengers, 0);
  const paidCount = data.passengers.filter(p => p.paymentStatus === 'paid').length;
  doc.text(`Total: ${totalPassengers} Penumpang  |  Lunas: ${paidCount}/${data.passengers.length} Booking`, margin, y);
  y += 10;

  // Divider line
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, y, margin + contentWidth, y);
  y += 8;

  // Passengers List - Form format like the image (sorted by location)
  doc.setFontSize(10);
  
  sortedPassengers.forEach((passenger, index) => {
    const passengerHeight = 35; // Estimated height per passenger
    checkNewPage(passengerHeight);

    // Number
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}.`, margin, y);
    
    // Payment status on the right
    const statusText = `[${getPaymentLabel(passenger.paymentStatus)}]`;
    doc.text(statusText, margin + contentWidth - doc.getTextWidth(statusText), y);
    
    y += 5;

    // Form fields with dots
    doc.setFont('helvetica', 'normal');
    drawFormField('Nama', `${passenger.name} (${passenger.passengers} org)`, y, 20);
    y += 5;
    
    drawFormField('Alamat', passenger.pickupAddress, y, 20);
    y += 5;
    
    drawFormField('Telp', passenger.phone, y, 20);
    y += 5;
    
    drawFormField('Tujuan', passenger.dropoffAddress || '-', y, 20);
    y += 5;

    // Additional notes if any
    const additionalNotes: string[] = [];
    if (passenger.hasLargeLuggage) {
      additionalNotes.push(`Barang besar${passenger.luggageDescription ? ': ' + passenger.luggageDescription : ''}`);
    }
    if (passenger.hasPackageDelivery) {
      additionalNotes.push(`Titipan${passenger.packageDescription ? ': ' + passenger.packageDescription : ''}`);
    }
    if (passenger.specialRequests) {
      additionalNotes.push(passenger.specialRequests);
    }
    if (passenger.notes) {
      additionalNotes.push(passenger.notes);
    }

    if (additionalNotes.length > 0) {
      drawFormField('Ket', additionalNotes.join(', '), y, 20);
      y += 5;
    }

    y += 3; // Space between passengers
  });

  // Footer
  checkNewPage(15);
  y += 5;
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Dicetak: ${new Date().toLocaleString('id-ID')}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  // Save
  const dateStr = data.tripDate.replace(/-/g, '');
  const fileName = `Manifes-${data.routeFrom}-${data.routeTo}-${dateStr}.pdf`;
  doc.save(fileName);
};
