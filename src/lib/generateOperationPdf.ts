import { jsPDF } from 'jspdf';

interface TripOperation {
  id: string;
  trip_date: string;
  route_from: string;
  route_to: string;
  route_via: string | null;
  pickup_time: string;
  total_passengers: number;
  income_tickets: number;
  income_other: number;
  expense_fuel: number;
  expense_ferry: number;
  expense_snack: number;
  expense_meals: number;
  expense_driver_commission: number;
  expense_driver_meals: number;
  expense_toll: number;
  expense_parking: number;
  expense_other: number;
  notes: string | null;
  driver_name: string | null;
  vehicle_number: string | null;
}

export const generateOperationPdf = (trip: TripOperation): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  
  // Colors (similar to the pink form in the image)
  const pink: [number, number, number] = [255, 182, 193];
  const lightPink: [number, number, number] = [255, 218, 224];
  const darkBlue: [number, number, number] = [0, 100, 180];
  const black: [number, number, number] = [0, 0, 0];
  const white: [number, number, number] = [255, 255, 255];
  
  // Helper for currency formatting
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID').format(price);
  };
  
  // Helper for date formatting
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };
  
  // Calculate totals
  const totalExpense = 
    trip.expense_fuel + 
    trip.expense_ferry + 
    trip.expense_snack + 
    trip.expense_meals + 
    trip.expense_driver_commission + 
    trip.expense_driver_meals + 
    trip.expense_toll + 
    trip.expense_parking + 
    trip.expense_other;
  
  const totalIncome = trip.income_tickets + trip.income_other;
  const profit = totalIncome - totalExpense;
  
  let y = margin;
  const rowHeight = 9;
  const labelWidth = 65;
  const col2Width = 30;
  const valueWidth = contentWidth - labelWidth - col2Width;
  
  // === HEADER ===
  doc.setFillColor(...darkBlue);
  doc.rect(0, 0, pageWidth, 20, 'F');
  
  doc.setTextColor(...white);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TRAVEL EXPRESS', pageWidth / 2, 10, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Laporan Operasional Trip', pageWidth / 2, 16, { align: 'center' });
  
  y = 30;
  
  // === MAIN FORM AREA ===
  // Background
  doc.setFillColor(...lightPink);
  doc.rect(margin, y, contentWidth, 195, 'F');
  
  // Border
  doc.setDrawColor(...pink);
  doc.setLineWidth(1);
  doc.rect(margin, y, contentWidth, 195, 'S');
  
  y += 8;
  const leftX = margin + 5;
  const valueX = margin + labelWidth + 5;
  const rightValueX = margin + contentWidth - 5;
  
  // Helper to draw a row with border
  const drawRow = (label: string, col2: string, value: string, isBold: boolean = false) => {
    // Draw cell borders
    doc.setDrawColor(...pink);
    doc.setLineWidth(0.5);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);
    doc.line(margin + labelWidth, y, margin + labelWidth, y + rowHeight);
    doc.line(margin + labelWidth + col2Width, y, margin + labelWidth + col2Width, y + rowHeight);
    
    // Draw text
    doc.setTextColor(...black);
    doc.setFontSize(9);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(label, leftX, y + 6);
    doc.text(col2, valueX, y + 6);
    doc.text(value, rightValueX, y + 6, { align: 'right' });
    
    y += rowHeight;
  };
  
  const drawSimpleRow = (label: string, value: string, isBold: boolean = false) => {
    doc.setDrawColor(...pink);
    doc.setLineWidth(0.5);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);
    doc.line(margin + labelWidth + col2Width, y, margin + labelWidth + col2Width, y + rowHeight);
    
    doc.setTextColor(...black);
    doc.setFontSize(9);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(label, leftX, y + 6);
    doc.text(value, rightValueX, y + 6, { align: 'right' });
    
    y += rowHeight;
  };
  
  const drawHeaderRow = (text: string) => {
    doc.setFillColor(...pink);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setDrawColor(...pink);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);
    
    doc.setTextColor(...black);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(text, leftX, y + 6);
    
    y += rowHeight;
  };
  
  // === TRIP INFO SECTION ===
  // Route label and value
  const routeText = trip.route_via 
    ? `${trip.route_from} → ${trip.route_via} → ${trip.route_to}`
    : `${trip.route_from} → ${trip.route_to}`;
  
  drawSimpleRow('Ke', trip.route_to.toUpperCase());
  drawSimpleRow('Nomor Kendaraan', trip.vehicle_number || '-');
  drawSimpleRow('Sopir', trip.driver_name || '-');
  drawSimpleRow('Tanggal Berangkat', formatDate(trip.trip_date));
  drawSimpleRow('Jam Penjemputan', trip.pickup_time);
  drawSimpleRow('Jumlah Penumpang', `${trip.total_passengers} PAX`);
  drawSimpleRow('Total Uang Tiket', formatPrice(trip.income_tickets), true);
  
  // === PENGELUARAN SECTION ===
  y += 3;
  drawHeaderRow('PENGELUARAN');
  
  drawRow('SOLAR', 'Liter', formatPrice(trip.expense_fuel));
  drawRow('PENYEBRANGAN', '', formatPrice(trip.expense_ferry));
  drawRow('SNACK', 'Orang', formatPrice(trip.expense_snack));
  drawRow('MAKAN', 'Orang', formatPrice(trip.expense_meals));
  drawRow('KOMISI SOPIR', '15%', formatPrice(trip.expense_driver_commission));
  drawRow('UANG MAKAN SOPIR', '', formatPrice(trip.expense_driver_meals));
  drawRow('TOL', '', formatPrice(trip.expense_toll));
  drawRow('PARKIR', '', formatPrice(trip.expense_parking));
  drawRow('LAIN-LAIN', '', formatPrice(trip.expense_other));
  
  // Empty space for handwritten notes area (like in the image)
  y += 15;
  
  // === TOTALS SECTION ===
  doc.setDrawColor(...pink);
  doc.setLineWidth(1);
  doc.line(margin, y, margin + contentWidth, y);
  
  drawSimpleRow('TOTAL PENGELUARAN', formatPrice(totalExpense), true);
  
  y += 3;
  
  drawSimpleRow('TOTAL UANG TIKET', formatPrice(totalIncome), true);
  drawSimpleRow('TOTAL PENGELUARAN', formatPrice(totalExpense), true);
  
  // Final profit row with emphasis
  doc.setFillColor(...pink);
  doc.rect(margin, y, contentWidth, rowHeight + 2, 'F');
  doc.setDrawColor(...pink);
  doc.setLineWidth(1);
  doc.line(margin, y + rowHeight + 2, margin + contentWidth, y + rowHeight + 2);
  doc.line(margin + labelWidth + col2Width, y, margin + labelWidth + col2Width, y + rowHeight + 2);
  
  doc.setTextColor(...black);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('JUMLAH BERSIH', leftX, y + 7);
  doc.text(formatPrice(profit), rightValueX, y + 7, { align: 'right' });
  
  // === NOTES SECTION ===
  if (trip.notes) {
    y += 20;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CATATAN:', margin, y);
    
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const notesLines = doc.splitTextToSize(trip.notes, contentWidth);
    doc.text(notesLines, margin, y);
  }
  
  // === FOOTER ===
  const footerY = 280;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, margin, footerY);
  
  doc.text(`Rute: ${routeText}`, pageWidth - margin, footerY, { align: 'right' });
  
  // Save file
  const fileName = `Laporan-${trip.route_from}-${trip.route_to}-${formatDate(trip.trip_date)}.pdf`;
  doc.save(fileName);
};
