import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Printer,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';

export interface PaymentReceiptData {
  status: 'success' | 'failed';
  transactionId: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  planInterval: string;
  amount: number;
  currency: string;
  currencySymbol: string;
  paymentMethod: string;
  errorMessage?: string;
}

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: PaymentReceiptData | null;
  onRetry?: () => void;
  onContinueToBuilder?: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptData,
  onRetry,
  onContinueToBuilder,
}) => {
  const [isPrinting, setIsPrinting] = useState<boolean>(true);
  const [printKey, setPrintKey] = useState<number>(0);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsPrinting(true);
      const timer = setTimeout(() => {
        setIsPrinting(false);
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [isOpen, printKey]);

  if (!receiptData) return null;

  const isSuccess = receiptData.status === 'success';

  const handlePrint = () => {
    window.print();
  };

  const handleReplayPrint = () => {
    setPrintKey((prev) => prev + 1);
  };

  // Base price and 18% GST split calculations
  const totalAmount = receiptData.amount;
  const baseAmount = Math.round((totalAmount / 1.18) * 100) / 100;
  const totalGst = Math.round((totalAmount - baseAmount) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst - cgst) * 100) / 100;

  // Format Date and Time
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
  const timeFormatted = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const authCode = Math.floor(100000 + Math.random() * 900000);
  const terminalId = 'POS-IND-01';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="md">
      <div className="flex flex-col items-center justify-center pt-1 pb-1 select-none">
        
        {/* =========================================================================
            1. METALLIC POS PRINTER CUTTER DISPENSER
           ========================================================================= */}
        <div className="w-full max-w-[390px] bg-gradient-to-b from-zinc-800 via-zinc-900 to-black p-3.5 rounded-t-2xl border-t border-x border-zinc-700/80 shadow-2xl relative z-20">
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isSuccess
                    ? isPrinting
                      ? 'bg-emerald-400 animate-printer-slot'
                      : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]'
                    : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]'
                }`}
              />
              <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-300 font-bold">
                {isPrinting
                  ? 'Printing Thermal Receipt...'
                  : isSuccess
                  ? 'Receipt Dispensed • 80mm POS'
                  : 'Transaction Declined Notice'}
              </span>
            </div>

            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
              203 DPI
            </span>
          </div>

          {/* Paper Cutter Blade Line */}
          <div className="h-2.5 w-full bg-zinc-950 rounded-full border border-zinc-700 shadow-inner flex items-center justify-center relative overflow-hidden">
            <div
              className={`h-0.5 w-4/5 rounded-full transition-all duration-300 ${
                isPrinting
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-pulse'
                  : 'bg-zinc-800'
              }`}
            />
          </div>
        </div>

        {/* =========================================================================
            2. AUTHENTIC REAL-WORLD OFFLINE THERMAL RECEIPT
           ========================================================================= */}
        <div className="w-full max-w-[390px] overflow-hidden relative -mt-1 pt-1 z-10">
          <div
            key={printKey}
            ref={receiptRef}
            id="printable-payment-receipt"
            className="animate-thermal-print bg-[#FFFDF9] text-zinc-900 shadow-2xl relative overflow-hidden font-mono border-x border-zinc-300/80"
            style={{
              filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.18))',
            }}
          >
            {/* Left Ticket Punch Cutout */}
            <div className="absolute top-[260px] -left-3.5 w-7 h-7 bg-zinc-900 rounded-full border border-zinc-300/40 z-30 shadow-inner" />
            {/* Right Ticket Punch Cutout */}
            <div className="absolute top-[260px] -right-3.5 w-7 h-7 bg-zinc-900 rounded-full border border-zinc-300/40 z-30 shadow-inner" />

            {/* Receipt Body */}
            <div className="px-6 pt-6 pb-4 space-y-3.5 text-left text-xs leading-tight">
              
              {/* Header: Store Identity */}
              <div className="text-center space-y-1">
                <div className="text-sm font-black tracking-wider uppercase text-zinc-950 font-mono">
                  *** RESUMORA CLOUD SYSTEMS ***
                </div>
                <div className="text-[10px] text-zinc-600 font-medium">
                  OFFICIAL TAX INVOICE &amp; RECEIPT
                </div>
                <div className="text-[9px] text-zinc-500 font-mono">
                  GSTIN: 27AABCR8920F1Z5 • SAC: 998314
                </div>
                <div className="text-[9px] text-zinc-500 font-mono">
                  BANGALORE / MUMBAI, INDIA • HTTPS://RESUMORA.APP
                </div>
              </div>

              {/* Dotted Separator */}
              <div className="border-t border-dashed border-zinc-400 my-2" />

              {/* Transaction Metadata */}
              <div className="space-y-1 text-[11px] text-zinc-800">
                <div className="flex justify-between">
                  <span className="text-zinc-500">INVOICE NO:</span>
                  <span className="font-bold">{receiptData.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">DATE / TIME:</span>
                  <span>{dateFormatted} {timeFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">TERMINAL:</span>
                  <span>{terminalId} (ONLINE GATEWAY)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">CUSTOMER:</span>
                  <span className="font-bold truncate max-w-[180px]" title={receiptData.customerEmail}>
                    {receiptData.customerEmail || 'CANDIDATE'}
                  </span>
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`py-2 px-3 border text-center font-bold uppercase tracking-wider text-[11px] rounded ${
                  isSuccess
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-rose-50 border-rose-400 text-rose-800'
                }`}
              >
                {isSuccess ? '✓ PAYMENT COMPLETED &amp; VERIFIED' : '✕ TRANSACTION FAILED / DECLINED'}
              </div>

              {/* Dotted Separator */}
              <div className="border-t border-dashed border-zinc-400 my-2" />

              {/* Line Items Table (True POS Structure) */}
              <div>
                <div className="flex justify-between text-[10px] text-zinc-500 font-bold border-b border-zinc-300 pb-1 uppercase">
                  <span>QTY  DESCRIPTION</span>
                  <span>AMOUNT</span>
                </div>

                <div className="py-2 space-y-1">
                  <div className="flex justify-between font-bold text-zinc-950 text-xs">
                    <span>1x {receiptData.planName.toUpperCase()}</span>
                    <span>{receiptData.currencySymbol}{baseAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Unlimited PDF/DOCX vector exports &amp; AI credits
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-zinc-300 pt-2 space-y-1 text-[11px]">
                  <div className="flex justify-between text-zinc-600">
                    <span>TAXABLE SUBTOTAL:</span>
                    <span>{receiptData.currencySymbol}{baseAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>CGST (9.0%):</span>
                    <span>{receiptData.currencySymbol}{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>SGST (9.0%):</span>
                    <span>{receiptData.currencySymbol}{sgst.toFixed(2)}</span>
                  </div>
                  
                  {/* Total Header */}
                  <div className="flex justify-between items-baseline font-black text-sm text-zinc-950 border-t-2 border-zinc-900 pt-1.5 mt-1">
                    <span>TOTAL AMOUNT:</span>
                    <span className="text-base font-extrabold text-zinc-950">
                      {receiptData.currencySymbol}{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dotted Separator */}
              <div className="border-t border-dashed border-zinc-400 my-2" />

              {/* Payment Details */}
              <div className="space-y-1 text-[10px] text-zinc-700">
                <div className="flex justify-between">
                  <span className="text-zinc-500">PAYMENT METHOD:</span>
                  <span className="font-bold">{receiptData.paymentMethod.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">TXN REF ID:</span>
                  <span className="font-bold truncate max-w-[190px]">{receiptData.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">AUTH CODE:</span>
                  <span>{authCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">PLAN STATUS:</span>
                  <span className="font-bold text-emerald-700">
                    {isSuccess ? 'PRO ACTIVE (UNLIMITED)' : 'UNPAID'}
                  </span>
                </div>
              </div>

              {/* Dotted Separator */}
              <div className="border-t border-dashed border-zinc-400 my-2" />

              {/* Authentic High-Density Barcode */}
              <div className="text-center space-y-1 pt-1 pb-1">
                <div className="flex justify-center items-center">
                  <svg className="w-56 h-10 text-zinc-950" viewBox="0 0 200 35" fill="currentColor">
                    <rect x="0" y="0" width="3" height="35" />
                    <rect x="5" y="0" width="1.5" height="35" />
                    <rect x="9" y="0" width="4" height="35" />
                    <rect x="15" y="0" width="2" height="35" />
                    <rect x="19" y="0" width="1" height="35" />
                    <rect x="22" y="0" width="3" height="35" />
                    <rect x="27" y="0" width="5" height="35" />
                    <rect x="34" y="0" width="2" height="35" />
                    <rect x="38" y="0" width="1.5" height="35" />
                    <rect x="42" y="0" width="4" height="35" />
                    <rect x="48" y="0" width="2.5" height="35" />
                    <rect x="53" y="0" width="1" height="35" />
                    <rect x="56" y="0" width="3.5" height="35" />
                    <rect x="62" y="0" width="2" height="35" />
                    <rect x="66" y="0" width="4.5" height="35" />
                    <rect x="73" y="0" width="1.5" height="35" />
                    <rect x="77" y="0" width="3" height="35" />
                    <rect x="82" y="0" width="2" height="35" />
                    <rect x="86" y="0" width="5" height="35" />
                    <rect x="93" y="0" width="1" height="35" />
                    <rect x="96" y="0" width="3.5" height="35" />
                    <rect x="102" y="0" width="2" height="35" />
                    <rect x="106" y="0" width="4" height="35" />
                    <rect x="112" y="0" width="1.5" height="35" />
                    <rect x="115" y="0" width="3" height="35" />
                    <rect x="120" y="0" width="2.5" height="35" />
                    <rect x="125" y="0" width="5" height="35" />
                    <rect x="132" y="0" width="1.5" height="35" />
                    <rect x="136" y="0" width="3.5" height="35" />
                    <rect x="142" y="0" width="2" height="35" />
                    <rect x="146" y="0" width="4.5" height="35" />
                    <rect x="153" y="0" width="1" height="35" />
                    <rect x="156" y="0" width="3" height="35" />
                    <rect x="161" y="0" width="2" height="35" />
                    <rect x="165" y="0" width="5" height="35" />
                    <rect x="172" y="0" width="1.5" height="35" />
                    <rect x="176" y="0" width="3.5" height="35" />
                    <rect x="182" y="0" width="2" height="35" />
                    <rect x="186" y="0" width="4" height="35" />
                    <rect x="192" y="0" width="2" height="35" />
                    <rect x="196" y="0" width="4" height="35" />
                  </svg>
                </div>
                <div className="text-[9px] text-zinc-500 tracking-widest font-mono">
                  * {receiptData.invoiceNumber} *
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center text-[9px] text-zinc-500 space-y-0.5 pt-1">
                <div>*** THANK YOU FOR YOUR SUBSCRIPTION ***</div>
                <div>CUSTOMER SUPPORT: SUPPORT@RESUMORA.APP</div>
              </div>
            </div>

            {/* Jagged Scallop Tear-off Cut at Bottom */}
            <div className="w-full h-4 receipt-scallop-bottom -mb-1 bg-zinc-900 border-t border-zinc-300" />
          </div>
        </div>

        {/* =========================================================================
            3. ACTION CONTROLS & CLEAN PRINT DIALOG
           ========================================================================= */}
        <div className="w-full max-w-[390px] space-y-2 pt-4 text-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
              className="flex-1 font-semibold text-xs"
            >
              Print / Save PDF
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={handleReplayPrint}
              title="Replay Thermal Paper Feed Animation"
              className="px-3"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              onClose();
              if (onContinueToBuilder) {
                onContinueToBuilder();
              }
            }}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full font-bold uppercase tracking-wider py-3 shadow-md text-xs"
          >
            {isSuccess ? 'Continue to Resume Builder →' : 'Dismiss'}
          </Button>

          {!isSuccess && onRetry && (
            <button
              onClick={() => {
                onClose();
                onRetry();
              }}
              className="text-xs text-[var(--color-brand)] hover:underline pt-1 cursor-pointer font-semibold block mx-auto"
            >
              Try Payment Again →
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
