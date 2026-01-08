import { useState, useRef } from 'react';
import { Upload, Image, Loader2, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PaymentUploadProps {
  orderId: string;
  onUploadSuccess: () => void;
}

const PaymentUpload = ({ orderId, onUploadSuccess }: PaymentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderId', orderId);

      const response = await fetch(
        'https://ojxydihfvorglvmqyyaq.supabase.co/functions/v1/upload-to-drive',
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengupload file');
      }

      setIsSuccess(true);
      toast.success('Bukti pembayaran berhasil diupload!');
      onUploadSuccess();

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal mengupload file');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isSuccess) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">
          Bukti Pembayaran Terkirim
        </h3>
        <p className="text-sm text-muted-foreground">
          Tim kami akan memverifikasi pembayaran Anda dalam 1x24 jam.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-primary" />
        Upload Bukti Pembayaran
      </h3>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        id="payment-proof"
      />

      {!file ? (
        <label
          htmlFor="payment-proof"
          className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors"
        >
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
            <Image className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            Klik untuk memilih file
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP, atau PDF (maks. 5MB)
          </p>
        </label>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-contain rounded-lg bg-secondary/50"
              />
            ) : (
              <div className="w-full h-48 bg-secondary/50 rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">{file.name}</span>
              </div>
            )}
            <button
              onClick={clearFile}
              className="absolute top-2 right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground truncate max-w-[200px]">
              {file.name}
            </span>
            <span className="text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full btn-gold"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Kirim Bukti Pembayaran
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentUpload;